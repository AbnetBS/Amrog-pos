"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, CreditCard, Banknote, Smartphone, RefreshCw, ImageIcon, Award, PieChart, Coffee, CookingPot, Printer, XCircle } from "lucide-react";
import { ReportData, Ticket } from "@/types";
import { formatClock, formatDateTime } from "@/lib/order-lines";

export default function ReportsTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [receiptModal, setReceiptModal] = useState<string | null>(null);
  // The printed-today archive card that is expanded into the full bill.
  const [billModal, setBillModal] = useState<Ticket | null>(null);

  const load = async () => {
    const r = await fetch("/api/reports");
    if (r.ok) setData(await r.json());
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (n: number) => n.toLocaleString("en-US") + " ETB";

  const stationMeta: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    barista: { label: "Barista", icon: <Coffee className="w-5 h-5 text-amber-300" />, cls: "border-amber-700/60" },
    kitchen: { label: "Kitchen (Chef)", icon: <CookingPot className="w-5 h-5 text-emerald-300" />, cls: "border-emerald-700/60" },
    buna: { label: "Buna Makers", icon: <span className="text-xl leading-none">🫖</span>, cls: "border-orange-700/60" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-amber-100">Today&rsquo;s Reports &amp; Analytics</h2>
          <p className="text-xs text-stone-400">
            Live numbers from today&rsquo;s sales: every bill keyed into the EFD (printed) or marked paid, refreshed from the database.
          </p>
        </div>
        <button onClick={load} className="p-2 bg-white/10 hover:bg-white/20 text-amber-200 rounded-xl" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {!data ? (
        <div className="p-10 text-center text-stone-500 text-sm">Loading reports...</div>
      ) : (
        <>
          {/* TIME INTERVAL cards — Today / Yesterday / Last Week / Last Month */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              [
                { label: "Today", rev: data.todayRevenue, cnt: data.todayOrders, hl: true },
                { label: "Yesterday", rev: data.yesterdayRevenue || 0, cnt: data.yesterdayOrders || 0, hl: false },
                { label: "Last 7 Days", rev: data.weeklyRevenue || 0, cnt: data.weekOrders || 0, hl: false },
                { label: "Last 30 Days", rev: data.monthlyRevenue || 0, cnt: data.monthOrders || 0, hl: false },
              ] as const
            ).map((p) => (
              <div
                key={p.label}
                className={`rounded-2xl p-4 ${
                  p.hl
                    ? "bg-gradient-to-br from-[#C9A227] to-[#8C6D18] text-[#2C1B17]"
                    : "bg-[#2C1B17] border border-stone-800 text-white"
                }`}
              >
                <p className={`text-[10px] font-extrabold uppercase tracking-wider ${p.hl ? "opacity-80" : "text-stone-400"}`}>
                  {p.label}
                </p>
                <p className="font-serif font-black text-xl">{fmt(p.rev)}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${p.hl ? "opacity-70" : "text-stone-500"}`}>{p.cnt} order(s)</p>
              </div>
            ))}
          </div>

          {/* ═══ CROSS-CHECK BY STATION — the paper world's three piles ═══
              Before this system the cross-checker collected the kitchen's, the
              barista's and the buna makers' order papers, added each pile and
              compared the total with the cashier's EFD receipts. These three
              cards ARE those piles: today's sales split by who prepared them. */}
          <div className="bg-[#2C1B17] rounded-2xl border border-[#C9A227]/40 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider">📋 Cross-Check by Station (Today)</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Each crew&rsquo;s pile of today&rsquo;s sales, split per item. Add the three totals and compare with the EFD receipt pile below.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase text-stone-400">Barista + Kitchen + Buna</p>
                <p className="font-serif font-black text-xl text-[#C9A227]">
                  {fmt((data.stationSales || []).reduce((s, x) => s + (x.revenue || 0), 0))}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(data.stationSales || []).map((s) => {
                const meta = stationMeta[s.station] || stationMeta.kitchen;
                const items = (data.stationItems || []).filter((i) => i.station === s.station);
                return (
                  <div key={s.station} className={`bg-[#3D2314] rounded-2xl border ${meta.cls} p-4 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-black text-amber-100">
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400">{s.orders} bill(s)</span>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-stone-400">Items sold</p>
                        <p className="font-serif font-black text-2xl text-white">{s.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-extrabold text-stone-400">Total sell</p>
                        <p className="font-serif font-black text-2xl text-[#C9A227]">{fmt(s.revenue)}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {items.length === 0 ? (
                        <p className="text-xs text-stone-500">Nothing sold from this station today.</p>
                      ) : (
                        items.map((i) => (
                          <div key={`${i.station}-${i.name}`} className="flex items-center justify-between gap-2 text-xs bg-black/25 rounded-lg px-2.5 py-1.5">
                            <span className="font-bold text-amber-100 truncate">{i.name}</span>
                            <span className="shrink-0 text-stone-400 font-bold">x{i.quantity}</span>
                            <span className="shrink-0 font-extrabold text-[#C9A227]">{i.revenue.toLocaleString("en-US")}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#2C1B17] rounded-2xl p-5 border border-stone-800">
              <ShoppingBag className="w-5 h-5 mb-2 text-[#C9A227]" />
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Orders Today</p>
              <p className="font-serif font-black text-2xl text-white">{data.todayOrders}</p>
            </div>
            <div className="bg-[#2C1B17] rounded-2xl p-5 border border-stone-800">
              <PieChart className="w-5 h-5 mb-2 text-[#C9A227]" />
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Avg. Order Value</p>
              <p className="font-serif font-black text-2xl text-white">{fmt(data.averageOrderValue)}</p>
            </div>
            <div className="bg-[#2C1B17] rounded-2xl p-5 border border-stone-800">
              <Award className="w-5 h-5 mb-2 text-[#C9A227]" />
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Payment Methods</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {data.paymentStats.length === 0 && <span className="text-xs text-stone-500">No payments yet</span>}
                {data.paymentStats.map((p) => (
                  <span key={p.method} className="text-[11px] font-bold text-white bg-white/10 px-2 py-1 rounded-lg capitalize">
                    {p.method}: {p.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak selling hours */}
            <div className="bg-[#2C1B17] rounded-2xl border border-stone-800 p-5">
              <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-1">⏰ Peak Selling Hours (Today)</h3>
              {data.peakHour ? (
                <>
                  <p className="text-[11px] text-emerald-400 font-bold mb-3">
                    🔥 Busiest: {data.peakHour.hour}:00 – {data.peakHour.hour + 1}:00 ({data.peakHour.orders} orders, {data.peakHour.revenue.toLocaleString()} ETB)
                  </p>
                  <div className="space-y-2">
                    {(data.hourlySales || [])
                      .sort((a, b) => a.hour - b.hour)
                      .map((h) => {
                        const max = Math.max(...(data.hourlySales || [{ revenue: 1 }]).map((x) => x.revenue), 1);
                        return (
                          <div key={h.hour} className="flex items-center gap-2 text-[11px]">
                            <span className="w-14 font-bold text-stone-400">{h.hour}:00</span>
                            <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${h.hour === data.peakHour?.hour ? "bg-gradient-to-r from-rose-500 to-[#C9A227]" : "bg-[#C9A227]/60"}`}
                                style={{ width: `${(h.revenue / max) * 100}%` }}
                              />
                            </div>
                            <span className="w-16 text-right font-bold text-[#C9A227]">{h.orders} ord</span>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <p className="text-xs text-stone-500">No sales yet today. Peaks will appear once the first bills close.</p>
              )}
            </div>

            {/* Popular items */}
            <div className="bg-[#2C1B17] rounded-2xl border border-stone-800 p-5">
              <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-4">🏆 Highest-Selling Foods (Today)</h3>
              {data.popularItems.length === 0 ? (
                <p className="text-xs text-stone-500">No sales yet today.</p>
              ) : (
                <div className="space-y-2">
                  {data.popularItems.map((it, idx) => (
                    <div key={it.name} className="flex items-center gap-3 text-xs">
                      <span className="w-6 h-6 rounded-full bg-[#C9A227]/20 text-[#C9A227] font-black flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="flex-1 font-bold text-amber-100 truncate">{it.name}</span>
                      <span className="text-stone-400">x{it.quantity}</span>
                      <span className="font-extrabold text-[#C9A227]">{fmt(it.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category sales */}
            <div className="bg-[#2C1B17] rounded-2xl border border-stone-800 p-5">
              <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-4">Sales by Category (Today)</h3>
              {data.categorySales.length === 0 ? (
                <p className="text-xs text-stone-500">No sales yet today.</p>
              ) : (
                <div className="space-y-3">
                  {data.categorySales.map((c) => {
                    const maxRev = Math.max(...data.categorySales.map((x) => x.revenue), 1);
                    return (
                      <div key={c.category}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-amber-100 capitalize">{c.category}</span>
                          <span className="font-extrabold text-[#C9A227]">{fmt(c.revenue)}</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#C9A227] to-amber-500 rounded-full" style={{ width: `${(c.revenue / maxRev) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Payment stats — covers cash / telebirr / cbe / card (and legacy "online") */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(
              [
                { m: "cash", label: "Cash", icon: <Banknote className="w-6 h-6 text-emerald-400" /> },
                { m: "telebirr", label: "Telebirr", icon: <Smartphone className="w-6 h-6 text-amber-400" /> },
                { m: "cbe", label: "CBE Birr", icon: <Smartphone className="w-6 h-6 text-violet-400" /> },
                { m: "card", label: "Card", icon: <CreditCard className="w-6 h-6 text-sky-400" /> },
                { m: "online", label: "Online (legacy)", icon: <Smartphone className="w-6 h-6 text-amber-400" /> },
              ] as const
            ).map(({ m, label, icon }) => {
              const found = data.paymentStats.find((p) => p.method === m);
              return (
                <div key={m} className="bg-[#2C1B17] rounded-2xl border border-stone-800 p-4 flex items-center gap-3">
                  {icon}
                  <div>
                    <p className="text-[10px] uppercase font-extrabold text-stone-400">{label}</p>
                    <p className="font-serif font-black text-lg text-white">{found ? fmt(found.revenue) : "0 ETB"}</p>
                    <p className="text-[10px] text-stone-500">{found ? found.count : 0} payment(s)</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══ PRINTED TODAY — the archive registered as history ═══
              The same list the cashier sees below her tables: every bill keyed
              into the EFD today, open or already cleared. This is the digital
              receipt pile the cross-checker compares with the station piles
              above. Tap any card to open the whole bill. */}
          <div className="bg-[#2C1B17] rounded-2xl border border-stone-800 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#C9A227]" /> Printed Today ({(data.printedToday || []).length})
              </h3>
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase text-stone-400">Total printed (compare with the EFD pile)</p>
                <p className="font-serif font-black text-xl text-emerald-400">{fmt(data.printedTodayTotal || 0)}</p>
              </div>
            </div>
            {(data.printedToday || []).length === 0 ? (
              <p className="text-xs text-stone-500">
                No bills printed yet today. Every bill the cashier taps ✓ PRINTED is registered here for the daily cross-check.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(data.printedToday || []).map((t) => {
                  const cleared = t.status === "closed";
                  return (
                    <button
                      key={t.id}
                      onClick={() => setBillModal(t)}
                      className={`text-left bg-[#241714] rounded-xl p-3 flex items-center justify-between gap-2 transition hover:bg-[#2e1d18] active:scale-[0.98] border ${
                        cleared ? "border-stone-700" : "border-stone-800"
                      }`}
                      title="Tap to see the full bill"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-black text-amber-100">{t.tableName}</p>
                        <p className="text-[11px] font-bold text-stone-300 truncate flex items-center gap-1">
                          <Printer className="w-3 h-3 text-[#C9A227] shrink-0" /> printed {formatClock(t.printedAt)} • {t.printedBy || "cashier"}
                        </p>
                        <p className="text-[11px] font-bold text-stone-300 truncate">🕒 {formatDateTime(t.printedAt || t.createdAt)}</p>
                        <p className="text-[11px] font-bold text-[#D8B93E] truncate">👤 {t.confirmedBy || t.createdBy || "staff"}</p>
                        {cleared && (
                          <p className="text-[10px] font-black text-stone-400 uppercase">✓ cleared {t.closedAt ? formatClock(t.closedAt) : ""}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-emerald-400">{t.totalAmount} ETB</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Receipt photos */}
          <div className="bg-[#2C1B17] rounded-2xl border border-stone-800 p-5">
            <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#C9A227]" /> Receipt Photos (Digital Payment Verification)
            </h3>
            {data.receipts.length === 0 ? (
              <p className="text-xs text-stone-500">No receipt photos uploaded yet. They appear when waiters photograph card/online receipts.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.receipts.map((r) => (
                  <button
                    key={r.id}
                    onClick={async () => {
                      // load the photo only WHEN the owner click-idle — never bundled in reports
                      const resp = await fetch(`/api/tickets/receipt?id=${r.id}`);
                      const d = await resp.json();
                      if (d.receiptImage) setReceiptModal(d.receiptImage);
                    }}
                    className="group text-left bg-black/30 border border-stone-700 rounded-xl p-3 hover:border-[#C9A227] transition"
                  >
                    <p className="text-[11px] font-bold text-amber-100 truncate">{r.tableName}</p>
                    <p className="text-[10px] text-stone-500 capitalize">{r.method} • {r.totalAmount} ETB</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-extrabold text-sky-300">
                      📷 View Receipt
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* BILL DETAIL MODAL — the printed-today archive card expanded: every
          item with name, qty, unit price, line total and the bill total. */}
      {billModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setBillModal(null)}
        >
          <div
            className="bg-[#2C1B17] border-2 border-[#C9A227]/50 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#2C1B17] border-b border-stone-800 px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif font-black text-xl text-amber-100">{billModal.tableName}</h3>
                <p className="text-xs font-bold text-stone-300 mt-0.5">
                  {billModal.orderNumber ? `#${billModal.orderNumber} • ` : ""}
                  printed {billModal.printedAt ? formatDateTime(billModal.printedAt) : "?"} • by {billModal.printedBy || "cashier"}
                </p>
                <p className="text-xs font-bold text-stone-300">
                  {billModal.status === "closed"
                    ? `✓ cleared ${billModal.closedAt ? formatDateTime(billModal.closedAt) : ""}`
                    : "● open bill"}
                </p>
              </div>
              <button onClick={() => setBillModal(null)} className="p-2 rounded-lg bg-white/10 text-stone-300 hover:bg-white/20 shrink-0" title="Close">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="bg-[#3D2314] rounded-xl divide-y divide-stone-800">
                {(billModal.items || []).filter((i) => !i.removed).map((i) => (
                  <div key={i.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-amber-100 truncate">{i.name}</p>
                      <p className="text-xs font-semibold text-stone-300">{i.quantity} × {i.price} ETB</p>
                      {i.notes && <p className="text-[11px] font-semibold text-amber-300 italic mt-0.5">📝 {i.notes}</p>}
                    </div>
                    <span className="text-sm font-black text-[#C9A227] shrink-0">{i.price * i.quantity} ETB</span>
                  </div>
                ))}
                {(billModal.items || []).filter((i) => !i.removed).length === 0 && (
                  <p className="p-3 text-center text-xs text-stone-500">No items.</p>
                )}
              </div>
              <div className="bg-[#3D2314] border border-[#C9A227]/40 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-black text-stone-200">Bill total</span>
                <span className="font-serif font-black text-2xl text-[#C9A227]">{billModal.totalAmount} ETB</span>
              </div>
              <button
                onClick={() => setBillModal(null)}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setReceiptModal(null)}>
          <img src={receiptModal} alt="Receipt" className="max-h-[85vh] max-w-full rounded-2xl border border-[#C9A227]" />
        </div>
      )}
    </div>
  );
}
