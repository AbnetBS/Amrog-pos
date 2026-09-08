import { NextResponse } from "next/server";
import { db } from "@/db";
import { ticketItems, tickets } from "@/db/schema";
import { and, eq, notInArray, asc, desc, gte, inArray } from "drizzle-orm";
import { requireStaffOrAdmin, readStaffSession, readAdminSession } from "@/lib/session";
import { publish, CHANNELS } from "@/lib/realtime";
import { sendPushToNamedStaff, sendPushToRoles } from "@/lib/push";
import { stationProgressAlerts, ticketOwner } from "@/lib/alerts";
import { stationOf, type StationName } from "@/lib/stations";

/** The three crews that receive work (see @/lib/stations). */
type Station = StationName;

async function authorizedStation(): Promise<Station | "admin" | null> {
  if (await readAdminSession()) return "admin";
  const staff = await readStaffSession();
  // A crew may only ever read its OWN lane: buna makers see buna lines, the
  // barista sees the drinks, the kitchen sees the food.
  if (staff?.role === "barista" || staff?.role === "kitchen" || staff?.role === "buna") return staff.role;
  return null;
}

/**
 * GET /api/station-items?station=barista|kitchen[&history=1]
 * Returns open tickets carrying items for this crew station ONLY.
 *
 * ?history=1 → "Today's History": every order this crew RECEIVED today (the
 * paper stack they used to keep), open or already closed, with each line's
 * progress. Same release rule as the live list, so a held or still-unprinted
 * line never shows up as work they already did.
 */
export async function GET(request: Request) {
  const __auth = await requireStaffOrAdmin();
  if (!__auth.ok) return __auth.response;
  const stationRole = await authorizedStation();
  if (!stationRole) return NextResponse.json({ error: "Station role required" }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    // Anything unrecognised falls back to the kitchen lane, exactly as before.
    const station: Station = stationRole === "admin" ? stationOf(searchParams.get("station")) : stationRole;
    const historyOnly = searchParams.get("history") === "1";

    // ── THE RELEASE RULE (shared by the live list and the history) ──
    // 1. The ORIGINAL order is released the moment staff SEND it: a waiter's
    //    ✓ ACCEPT & SEND, or the cashier's CONFIRM & SEND on a held QR order
    //    (her plain accept only HOLDS the bill — the guest may add more — so a
    //    confirmed bill without a confirmed_at stamp releases NOTHING).
    // 2. Anything ADDED after that release follows the old print-and-send
    //    flow: it stays off the crew's list until the cashier prints again, and
    //    her card shows ONLY the new items. Her print appends them to that
    //    table's order for the crew.
    // So the cutoff is the LATER of the two stamps: sent-at (confirmed_at)
    // and printed-at. No stamps at all = a held bill the crew cannot see yet.
    const releaseCutoff = (confirmedAt: Date | string | null, printedAt: Date | string | null) => {
      const c = confirmedAt ? new Date(confirmedAt).getTime() : null;
      const p = printedAt ? new Date(printedAt).getTime() : null;
      if (c === null && p === null) return null; // held bill, never sent → release nothing
      return Math.max(c ?? 0, p ?? 0);
    };

    const releasedItems = (
      confirmedAt: Date | string | null,
      printedAt: Date | string | null,
      items: any[]
    ) => {
      const cutoff = releaseCutoff(confirmedAt, printedAt);
      if (cutoff === null) return [];
      return items.filter((it) => {
        if (!it.createdAt) return true; // legacy rows without a timestamp → released
        return new Date(it.createdAt).getTime() <= cutoff;
      });
    };

    if (historyOnly) {
      // ── TODAY'S HISTORY ──
      // Every order this crew received today: the release stamp (sent-at or
      // printed-at, whichever released the line) falls on today. Scoped to the
      // last 48h of tickets so a late-night order released by this morning's
      // print is still found, without ever scanning the whole table.
      const since = new Date();
      since.setDate(since.getDate() - 2);
      const recent = await db
        .select({
          id: tickets.id,
          tableName: tickets.tableName,
          orderNumber: tickets.orderNumber,
          status: tickets.status,
          createdBy: tickets.createdBy,
          confirmedBy: tickets.confirmedBy,
          createdAt: tickets.createdAt,
          updatedAt: tickets.updatedAt,
          closedAt: tickets.closedAt,
          printedAt: tickets.printedAt,
          confirmedAt: tickets.confirmedAt,
        })
        .from(tickets)
        .where(gte(tickets.createdAt, since))
        .orderBy(desc(tickets.id));

      if (recent.length === 0) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });

      const recentIds = recent.map((t) => t.id);
      const recentItems = await db
        .select()
        .from(ticketItems)
        .where(
          and(
            eq(ticketItems.stationName, station),
            eq(ticketItems.removed, false),
            inArray(ticketItems.ticketId, recentIds)
          )
        )
        .orderBy(asc(ticketItems.id));

      const byTicket = new Map<number, any[]>();
      for (const it of recentItems) {
        if (!byTicket.has(it.ticketId)) byTicket.set(it.ticketId, []);
        byTicket.get(it.ticketId)!.push(it);
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayMs = startOfToday.getTime();
      const isToday = (d: Date | string | null) =>
        d ? new Date(d).getTime() >= startOfTodayMs : false;

      const rows = [];
      for (const t of recent) {
        const items = byTicket.get(t.id) || [];
        if (items.length === 0) continue;
        // Which of our lines were actually RELEASED (visible to the crew), and
        // did that release happen today?
        const released = releasedItems(t.confirmedAt, t.printedAt, items);
        if (released.length === 0) continue;
        // The crew received this order when the newest released line crossed
        // the cutoff: the later of the two stamps.
        const cutoff = releaseCutoff(t.confirmedAt, t.printedAt) as number;
        if (!isToday(new Date(cutoff))) continue;
        rows.push({
          id: t.id,
          tableName: t.tableName,
          orderNumber: t.orderNumber,
          status: t.status,
          createdBy: t.createdBy,
          confirmedBy: t.confirmedBy,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          closedAt: t.closedAt,
          printedAt: t.printedAt,
          confirmedAt: t.confirmedAt,
          releasedAt: new Date(cutoff),
          items: released.map((it: any) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            notes: it.notes,
            stationStatus: it.stationStatus,
            createdAt: it.createdAt,
          })),
        });
      }
      // Newest work first.
      rows.sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime());
      return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
    }

    // GROUP 6 — bound the item read to OPEN tickets only. Previously this
    // fetched EVERY historical item for the station (e.g. ~15k rows at 10k
    // tickets) every 8s and then filtered in JS. Now: read the small set of
    // open ticket ids first, then fetch only THEIR items for this station.
    // (Group 9: a CLOSED bill — waiter cleared the table — is no longer open,
    // so the station lists drop it exactly like paid/cancelled ones.)
    const open = await db
      .select({
        id: tickets.id,
        tableName: tickets.tableName,
        orderNumber: tickets.orderNumber,
        status: tickets.status,
        totalAmount: tickets.totalAmount,
        receiptRequestedAt: tickets.receiptRequestedAt,
        createdBy: tickets.createdBy,
        confirmedBy: tickets.confirmedBy,
        // Group 8: the crew needs to know WHEN the order arrived (and how long it
        // has been waiting), not just that it exists.
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        // The two release stamps: the send releases the original order, the
        // print releases anything added after it.
        printedAt: tickets.printedAt,
        confirmedAt: tickets.confirmedAt,
      })
      .from(tickets)
      // WORKFLOW (owner's decision, Sept 2026): the SEND releases the food,
      // not the print. The moment a waiter taps ✓ ACCEPT & SEND (or the
      // cashier taps CONFIRM & SEND on a held QR order) the ticket becomes
      // "confirmed" with a release stamp and the kitchen, the barista AND the
      // cashier all receive it in the same second. The cashier still keys it
      // into the EFD and prints, but the crew no longer waits for that tap.
      // A cashier's plain accept HOLDS the bill (no stamp, nothing released).
      // Only orders nobody has accepted yet (pending_waiter) stay hidden here.
      .where(notInArray(tickets.status, ["paid", "cancelled", "closed", "pending_waiter"]));

    if (open.length === 0) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });

    const openIds = open.map((t) => t.id);
    const allItems = await db
      .select()
      .from(ticketItems)
      .where(
        and(
          eq(ticketItems.stationName, station),
          eq(ticketItems.removed, false),
          inArray(ticketItems.ticketId, openIds)
        )
      )
      .orderBy(asc(ticketItems.id));

    if (allItems.length === 0) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });

    const map = new Map<number, any[]>();
    for (const it of allItems) {
      if (!map.has(it.ticketId)) map.set(it.ticketId, []);
      map.get(it.ticketId)!.push(it);
    }

    const payload = open
      .filter((t) => map.has(t.id))
      .map((t) => {
        const items = releasedItems(t.confirmedAt, t.printedAt, map.get(t.id) || []);
        return {
          id: t.id,
          tableName: t.tableName,
          orderNumber: t.orderNumber,
          status: t.status,
          totalAmount: t.totalAmount,
          createdBy: t.createdBy,
          confirmedBy: t.confirmedBy,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          // A guest asking for the bill is the crew's cue that the table is waiting.
          receiptRequestedAt: t.receiptRequestedAt,
          items,
        };
      })
      .filter((t) => t.items.length > 0);

    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[station-items error]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/** PUT — station crew accepts/completes their items at start/finish of prep work */
export async function PUT(request: Request) {
  const __auth = await requireStaffOrAdmin();
  if (!__auth.ok) return __auth.response;
  const stationRole = await authorizedStation();
  if (!stationRole) return NextResponse.json({ error: "Station role required" }, { status: 403 });
  try {
    const body = await request.json();
    if (!body.itemId || !body.stationStatus) {
      return NextResponse.json({ error: "itemId and stationStatus required" }, { status: 400 });
    }
    const existing = await db
      .select({
        id: ticketItems.id,
        stationName: ticketItems.stationName,
        ticketId: ticketItems.ticketId,
        name: ticketItems.name,
        quantity: ticketItems.quantity,
      })
      .from(ticketItems)
      .where(eq(ticketItems.id, Number(body.itemId)))
      .limit(1);
    if (existing.length === 0) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (stationRole !== "admin" && existing[0].stationName !== stationRole) {
      return NextResponse.json({ error: "Item belongs to another station" }, { status: 403 });
    }

    const updated = await db
      .update(ticketItems)
      .set({ stationStatus: String(body.stationStatus) })
      .where(eq(ticketItems.id, Number(body.itemId)))
      .returning();

    // ── THE ALERT THAT WAS MISSING COMPLETELY ──
    // The crew finishing a dish rang nobody, so food sat on the pass until a
    // waiter happened to look at her screen. Now every station action wakes
    // the waiter's phone, and the last finished item says "whole order ready".
    try {
      const item = existing[0];
      const ticketRows = await db
        .select({
          id: tickets.id,
          tableName: tickets.tableName,
          totalAmount: tickets.totalAmount,
          confirmedBy: tickets.confirmedBy,
          createdBy: tickets.createdBy,
        })
        .from(tickets)
        .where(eq(tickets.id, item.ticketId))
        .limit(1);
      if (ticketRows.length > 0) {
        // Is anything on this bill still unfinished (any station)?
        const siblings = await db
          .select({ id: ticketItems.id, stationStatus: ticketItems.stationStatus })
          .from(ticketItems)
          .where(and(eq(ticketItems.ticketId, item.ticketId), eq(ticketItems.removed, false)));
        const wholeOrderReady = siblings.every((row) =>
          row.id === item.id ? String(body.stationStatus) === "done" : row.stationStatus === "done"
        );
        const alerts = stationProgressAlerts(String(body.stationStatus), {
          id: ticketRows[0].id,
          tableName: ticketRows[0].tableName,
          totalAmount: ticketRows[0].totalAmount,
          station: String(item.stationName || ""),
          itemName: item.name,
          quantity: item.quantity,
          wholeOrderReady,
        });
        // OWNER-ONLY (owner's decision, Sept 2026): "food ready" rings the
        // waiter who accepted/sent this table — not every waiter on duty. An
        // unowned ticket (QR order nobody accepted) still rings all waiters.
        const owner = ticketOwner(ticketRows[0].confirmedBy, ticketRows[0].createdBy);
        for (const alert of alerts) {
          const payload = {
            title: alert.title,
            body: alert.body,
            tag: alert.tag,
            urgent: alert.urgent,
            repeat: alert.repeat,
          };
          if (owner && alert.roles.length === 1 && alert.roles[0] === "waiter") {
            void sendPushToNamedStaff("waiter", owner, payload).catch(() => {});
          } else {
            void sendPushToRoles(alert.roles, payload).catch(() => {});
          }
        }
      }
    } catch {
      // A push hiccup must never fail the crew's tap.
    }

    publish(CHANNELS.orders);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("[station-items PUT error]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
