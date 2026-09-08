import { NextResponse } from "next/server";
import { db } from "@/db";
import { tickets, ticketItems, categories } from "@/db/schema";
import { ensureTablesExist } from "@/db/migrate";
import { inArray, or, gt } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { stationOf, STATION_NAMES, type StationName } from "@/lib/stations";

function isToday(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function isYesterday(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  const date = new Date(d);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return date.getFullYear() === y.getFullYear() && date.getMonth() === y.getMonth() && date.getDate() === y.getDate();
}

function isWithinDays(d: Date | string | null | undefined, days: number): boolean {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff >= 0 && diff < days * 24 * 60 * 60 * 1000;
}

/**
 * WHEN was this bill SOLD in the real world?
 *
 * The cafe runs the EFD print-queue workflow: a bill is a sale the moment the
 * cashier keys it into the government EFD/POS and prints the receipt
 * (tickets.printedAt) — it may stay open for hours while the guests eat and is
 * later "closed" by the waiter clearing the table, but the MONEY moment was the
 * print. Full-payment deployments mark bills paid/completed instead, so both
 * count. This is why the old report (paid/completed only) read as "not
 * working": in print-queue mode no bill ever reached those statuses.
 */
function soldAt(t: { printedAt: Date | string | null; closedAt: Date | string | null; updatedAt: Date | string | null; createdAt: Date | string | null }): Date | string | null {
  return t.printedAt || t.closedAt || t.updatedAt || t.createdAt;
}

/** True when this bill counts as a sale (printed into the EFD, or paid/completed). */
function isSold(t: { status: string; printedAt: Date | string | null }): boolean {
  if (t.status === "cancelled") return false;
  if (t.status === "paid" || t.status === "completed") return true;
  // Print-queue workflow: printed (still open) or closed (table cleared).
  return (t.status === "printed" || t.status === "closed") && !!t.printedAt;
}

export async function GET() {
  const __auth = await requireAdmin();
  if (!__auth.ok) return __auth.response;
  await ensureTablesExist();
  try {
    // PERFORMANCE: every figure in this report only spans the last 30 days —
    // scope the tickets query in SQL (instead of loading the entire table forever)
    // and fetch items ONLY for those tickets.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const allTickets = await db
      .select()
      .from(tickets)
      .where(
        or(
          gt(tickets.createdAt, cutoff),
          gt(tickets.updatedAt, cutoff),
          gt(tickets.closedAt, cutoff)
        )
      );

    const cats = await db.select().from(categories);

    // A bill counts as sold when it was PRINTED into the EFD (print-queue
    // workflow: printed / closed) or marked paid/completed (full mode).
    const revenueTickets = allTickets.filter(isSold);

    const todayTickets = revenueTickets.filter((t) => isToday(soldAt(t)));
    const yesterdayTickets = revenueTickets.filter((t) => isYesterday(soldAt(t)));
    const weekTickets = revenueTickets.filter((t) => isWithinDays(soldAt(t), 7));
    const monthTickets = revenueTickets.filter((t) => isWithinDays(soldAt(t), 30));

    const todayRevenue = todayTickets.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const yesterdayRevenue = yesterdayTickets.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const weeklyRevenue = weekTickets.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const monthlyRevenue = monthTickets.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const todayOrders = todayTickets.length;
    const averageOrderValue = todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0;

    // GROUP 4 / ITEM 2 — scope item reads to what the report ACTUALLY uses:
    //  • popular-items, category-sales & the STATION CROSS-CHECK need items of
    //    TODAY'S sold tickets only
    //  • order history needs items of the newest 200 closed tickets only
    //  • the "Printed Today" archive (the admin's copy of the cashier's daily
    //    cross-check list) needs items of every bill printed today
    const todayTicketIds = new Set(todayTickets.map((t) => t.id));

    // ── PRINTED TODAY (the paper world's receipt pile, registered as history) ──
    // Every bill the cashier keyed into the EFD today, whatever happened to it
    // afterwards (still open, later cleared). Cancelled bills are excluded: a
    // voided order is not a sale. Same rule as the cashier's own "Printed Today"
    // panel, so the two lists always agree.
    const printedTodayTickets = allTickets
      .filter((t) => t.status !== "cancelled" && t.printedAt && isToday(t.printedAt))
      .sort((a, b) => new Date(b.printedAt || 0).getTime() - new Date(a.printedAt || 0).getTime());
    const printedTodayIds = printedTodayTickets.map((t) => t.id);
    const printedTodayTotal = printedTodayTickets.reduce((s, t) => s + (t.totalAmount || 0), 0);

    // Full-payment deployments that never print: their paid/completed bills of
    // today are still today's sales, so include them in the archive too.
    const paidTodayIds = todayTickets.filter((t) => !printedTodayIds.includes(t.id)).map((t) => t.id);

    const orderHistoryTickets = allTickets
      .filter((t) => t.status === "paid" || t.status === "completed" || t.status === "cancelled" || t.status === "closed")
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 200);
    const historyTicketIds = orderHistoryTickets.map((t) => t.id);

    const itemTicketIds = [...new Set([...todayTicketIds, ...printedTodayIds, ...paidTodayIds, ...historyTicketIds])];
    type ItemRow = typeof ticketItems.$inferSelect;
    const emptyItems: ItemRow[] = [];
    const [scopedItems, historyItems] = await Promise.all([
      itemTicketIds.length > 0
        ? db.select().from(ticketItems).where(inArray(ticketItems.ticketId, itemTicketIds))
        : Promise.resolve(emptyItems),
      historyTicketIds.length > 0
        ? db.select().from(ticketItems).where(inArray(ticketItems.ticketId, historyTicketIds))
        : Promise.resolve(emptyItems),
    ]);
    const itemsByTicket = new Map<number, ItemRow[]>();
    for (const it of scopedItems) {
      if (!itemsByTicket.has(it.ticketId)) itemsByTicket.set(it.ticketId, []);
      itemsByTicket.get(it.ticketId)!.push(it);
    }

    // Peak selling hours — orders grouped by hour of the day (today)
    const hourAgg: Array<{ hour: number; orders: number; revenue: number }> = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      orders: 0,
      revenue: 0,
    }));
    for (const t of todayTickets) {
      const d = new Date(soldAt(t) as Date);
      const h = d.getHours();
      hourAgg[h].orders += 1;
      hourAgg[h].revenue += t.totalAmount || 0;
    }
    const hourlySales = hourAgg.filter((h) => h.orders > 0);
    const peakHour =
      hourlySales.length > 0 ? hourlySales.reduce((a, b) => (b.revenue > a.revenue ? b : a), hourlySales[0]) : null;

    // Popular items (from today's sold tickets, non-removed)
    const todayItems = [...todayTicketIds].flatMap((id) => (itemsByTicket.get(id) || []).filter((it) => !it.removed));
    const itemAgg = new Map<string, { quantity: number; revenue: number }>();
    for (const it of todayItems) {
      const cur = itemAgg.get(it.name) || { quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.price * it.quantity;
      itemAgg.set(it.name, cur);
    }
    const categoryNames = cats.filter((c) => c.slug !== "all").map((c) => ({ slug: c.slug, name: c.name }));
    const itemToCatName = (slug: string | null | undefined) =>
      categoryNames.find((c) => c.slug === slug)?.name || slug || "General";

    const popularItems = Array.from(itemAgg.entries())
      .map(([name, v]) => ({ name, quantity: v.quantity, revenue: v.revenue }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Sales by category
    const catAgg = new Map<string, number>();
    for (const it of todayItems) {
      const cName = itemToCatName(it.category);
      catAgg.set(cName, (catAgg.get(cName) || 0) + it.price * it.quantity);
    }
    const categorySales = Array.from(catAgg.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // ── CROSS-CHECK BY STATION (the paper world's three stacks) ──
    // Before this system, the cross-checker collected the kitchen's, the
    // barista's and the buna makers' order papers, added each pile, and compared
    // the total with the cashier's EFD receipts. This is the same three piles
    // from today's sold bills: per station the number of bills it had lines on,
    // the units it made and the ETB those lines add up to.
    type StationAgg = { orders: Set<number>; quantity: number; revenue: number };
    type StationItemAgg = Map<string, { quantity: number; revenue: number }>;
    const stationAgg = new Map<StationName, StationAgg>();
    for (const s of STATION_NAMES) stationAgg.set(s, { orders: new Set(), quantity: 0, revenue: 0 });
    const stationItemAgg = new Map<StationName, StationItemAgg>();
    for (const s of STATION_NAMES) stationItemAgg.set(s, new Map());
    for (const it of todayItems) {
      const station = stationOf(it.stationName);
      const agg = stationAgg.get(station)!;
      agg.orders.add(it.ticketId);
      agg.quantity += it.quantity;
      agg.revenue += it.price * it.quantity;
      const perItem = stationItemAgg.get(station)!;
      const cur = perItem.get(it.name) || { quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.price * it.quantity;
      perItem.set(it.name, cur);
    }
    const stationSales = STATION_NAMES.map((station) => {
      const agg = stationAgg.get(station)!;
      return { station, orders: agg.orders.size, quantity: agg.quantity, revenue: agg.revenue };
    });
    const stationItems = STATION_NAMES.flatMap((station) =>
      Array.from(stationItemAgg.get(station)!.entries())
        .map(([name, v]) => ({ station, name, quantity: v.quantity, revenue: v.revenue }))
        .sort((a, b) => b.quantity - a.quantity)
    );

    // Payment method statistics
    const payAgg = new Map<string, { count: number; revenue: number }>();
    for (const t of todayTickets) {
      const m = t.paymentMethod || "cash";
      const cur = payAgg.get(m) || { count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += t.totalAmount || 0;
      payAgg.set(m, cur);
    }
    const paymentStats = Array.from(payAgg.entries()).map(([method, v]) => ({
      method,
      count: v.count,
      revenue: v.revenue,
    }));

    // Receipt METADATA list only — photos load on demand via /api/tickets/receipt?id=
    const receipts = revenueTickets
      .filter((t) => t.receiptImage)
      .map((t) => ({
        id: t.id,
        tableName: t.tableName,
        method: t.paymentMethod || "online",
        totalAmount: t.totalAmount || 0,
        closedAt: t.closedAt ? String(t.closedAt) : null,
      }))
      .slice(0, 30);

    // The "Printed Today" archive for the owner — the same bills the cashier
    // sees below her tables, WITH items so each card opens the full bill for
    // the end-of-day cross-check. (Full-mode paid bills of today are appended
    // so the archive is complete whatever workflow the owner runs.)
    const printedToday = printedTodayTickets.map((t) => ({
      ...t,
      items: itemsByTicket.get(t.id) || [],
    }));
    for (const id of paidTodayIds) {
      const t = todayTickets.find((x) => x.id === id);
      if (t) printedToday.push({ ...t, items: itemsByTicket.get(id) || [] });
    }

    // Full order history (completed/paid/closed/cancelled), newest first, with
    // items + payment + receipt. Items come from the scoped historyItems query
    // (bounded to these 200 tickets).
    const orderHistory = orderHistoryTickets.map((t) => ({
      ...t,
      items: historyItems.filter((i) => i.ticketId === t.id),
    }));

    return NextResponse.json({
      todayRevenue,
      yesterdayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      todayOrders,
      yesterdayOrders: yesterdayTickets.length,
      weekOrders: weekTickets.length,
      monthOrders: monthTickets.length,
      averageOrderValue,
      popularItems,
      categorySales,
      paymentStats,
      receipts,
      orderHistory,
      hourlySales,
      peakHour,
      // Cross-check by station (today): the barista / kitchen / buna piles.
      stationSales,
      stationItems,
      // The printed-today archive + its total (compare with the EFD receipt pile).
      printedTodayTotal,
      printedToday,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
