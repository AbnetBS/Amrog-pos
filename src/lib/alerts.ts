/**
 * ROLE ALERT MATRIX - who must be woken, for which action.
 *
 * The complaint behind this file: "every action made for the role must have a
 * notification and an alarm". Before, only a handful of moments pushed a phone
 * (a new QR order, a print, a bill request). Everything else changed silently,
 * so a waiter whose phone was in her pocket, or who was using another app,
 * simply never learned that her food was ready or that the guest asked for the
 * bill.
 *
 * NOTE (owner, Sept 2026): the matrix was then TRIMMED. The waiter does NOT
 * need an alarm for "kitchen started", "bill printed", "preparing" or "item
 * removed" — those are noise, and noise trains staff to ignore the alerts
 * that matter. They update the screens instantly; they just never wake a phone.
 * Food READY and the guest's bill request still ring — and only the waiter who
 * owns the table (see `ticketOwner`), never the whole team.
 *
 * Every event now lands here, in ONE pure table, so:
 *   • no route can forget an event (a regression test walks this matrix),
 *   • the wording staff read is consistent,
 *   • the actor never rings their own phone (see `withoutActor`).
 *
 * This module is deliberately PURE: no database, no web-push, no Next.js. It
 * takes a plain description of what happened and returns the alerts to send,
 * which makes the whole matrix testable without a server.
 */

// Relative import on purpose: this matrix is executed directly by
// `scripts/verify-role-alerts.ts`, outside Next's path aliases.
import { STATION_NAMES, STATION_LABELS, isStationName, type StationName } from "./stations";

export type StaffRole = "waiter" | "cashier" | "kitchen" | "barista" | "buna" | "juice";

/** The four crews that physically make something (see @/lib/stations). */
export const STATION_ROLES: StaffRole[] = [...STATION_NAMES];
export const ALL_STAFF_ROLES: StaffRole[] = ["waiter", "cashier", ...STATION_NAMES];

export interface RoleAlert {
  roles: StaffRole[];
  title: string;
  body: string;
  /** Same-tag alerts replace each other; add an event suffix to ring twice. */
  tag: string;
  /**
   * Someone must ACT: the phone keeps the notification on the lock screen
   * until it is tapped. Non-urgent alerts inform ("table paid") and fade on
   * their own.
   */
  urgent: boolean;
  /**
   * Extra rings while nobody reacts. Every event in this matrix rings EXACTLY
   * ONCE and then stays quiet, even if nobody has answered it (repeat: 0):
   * during a rush a phone that keeps re-ringing for old events trains staff
   * to ignore it. The one exception lives in src/lib/push.ts:
   * CUSTOMER_ALERT_RING keeps repeat: 3 only because its four rings ~1.1s
   * apart ARE one continuous ~3 second alarm, not repeats.
   */
  repeat: number;
}

export interface TicketAlertInfo {
  id: number;
  tableName: string;
  totalAmount?: number | null;
  /** Present for pending bills so staff know what they are walking to. */
  orderNumber?: string | null;
  /**
   * The crews that ACTUALLY have lines on this bill.
   *
   * A drinks-only order used to wake the kitchen, and — since the buna makers
   * arrived — every accepted order woke all three crews. Now the caller passes
   * the stations it found on the ticket and only those phones ring. Left empty
   * (a legacy caller) it falls back to every crew: ringing one crew too many
   * is better than serving nobody.
   */
  stations?: StationName[] | null;
}

/** What each crew reads when an order is released to them. */
const RELEASE_TITLES: Record<StationName, string> = {
  kitchen: "👨‍🍳 New order to cook",
  barista: "☕ New drinks to make",
  buna: "🫖 New buna to make",
  juice: "🧃 New juices to make",
};

const money = (t: TicketAlertInfo) =>
  typeof t.totalAmount === "number" && t.totalAmount > 0 ? ` • ${t.totalAmount} ETB` : "";

/**
 * A ticket moved to a new status. `confirmed` is the moment the food is
 * released, so it wakes the crews that have lines on the bill, the cashier and
 * the waiter at once.
 * `printed` and `preparing` deliberately do NOT wake the stations: by then the
 * crew is already cooking, and a re-print must never re-ring them for food
 * they already have.
 */
export function ticketStatusAlerts(status: string, t: TicketAlertInfo): RoleAlert[] {
  const table = t.tableName;
  switch (status) {
    case "pending_waiter":
      return [
        {
          roles: ["waiter"],
          title: "🍽 Order needs confirmation",
          body: `${table}${money(t)} • tap to confirm`,
          tag: `fana-pending-${t.id}`,
          urgent: true,
          repeat: 0,
        },
      ];

    // ONE TAP FEEDS EVERYBODY — but only the crews that have work in it.
    // Accepting an order used to reach the cashier only, and the crew waited
    // for her print; the fix made the same tap reach every crew at once, which
    // then woke the kitchen for a drinks-only bill and woke the buna makers for
    // every macchiato. Now the same tap reaches exactly the crews whose lines
    // are on the ticket, plus the cashier (to print) and the waiter (to know it
    // went through). One alert per crew, so each gets its own tag and its own
    // wording, and a drink order never rings the kitchen.
    case "confirmed": {
      const crews = (t.stations && t.stations.length > 0 ? t.stations : STATION_NAMES).filter(isStationName);
      return [
        ...crews.map((station) => ({
          roles: [station] as StaffRole[],
          title: RELEASE_TITLES[station],
          body:
            station === "buna"
              ? `${table} • accepted • traditional buna, start now`
              : `${table} • accepted • start now`,
          tag: `fana-cook-${t.id}-${station}`,
          urgent: true,
          repeat: 0,
        })),
        {
          roles: ["cashier"],
          title: "🧾 To print",
          body: `${table}${money(t)} • key it into the EFD and print`,
          tag: `fana-print-${t.id}`,
          urgent: true,
          repeat: 0,
        },
        {
          roles: ["waiter"],
          title: "✓ Order accepted",
          body: `${table} • ${crews.map((s) => STATION_LABELS[s]).join(", ") || "the crew"} and the cashier all have it`,
          tag: `fana-confirmed-${t.id}`,
          urgent: false,
          repeat: 0,
        },
      ];
    }

    case "printed":
    case "preparing":
      // SILENT (owner's decision, Sept 2026): "bill printed" and "kitchen
      // accepted" used to ring the waiter, but she does not need to walk
      // anywhere for either — they are information, not a call to act. The
      // cards still update the moment it happens; they just never wake a phone.
      return [];

    // ── THE MONEY AND CLOSING STEPS ARE SILENT (owner's decision) ──
    // "Guest is ready to pay", "payment completed", "bill settled" and "table
    // cleared" all happen while staff are already looking at the screen, or in
    // the EFD/POS world where this app is not the system of record. Ringing a
    // pocket for them was noise, and noise is what makes people ignore the
    // alerts that matter. The screens still update instantly; they just do not
    // wake anybody.
    case "ready_for_payment":
    case "completed":
    case "paid":
    case "closed":
      return [];

    case "cancelled": {
      // Only the crews that could be standing over a hot pan are rung: for
      // them a cancellation is money burning. The waiter and the cashier see
      // it on their screens without a sound (they are usually the ones who
      // cancelled it in the first place). Like the release alert, a cancelled
      // drinks-only bill does not wake the kitchen — but when the caller
      // passes no stations the fallback still rings every crew, because
      // ringing one crew too many is better than serving nobody.
      const crews = (t.stations && t.stations.length > 0 ? t.stations : STATION_NAMES).filter(isStationName);
      return [
        {
          roles: crews.length > 0 ? [...crews] : [...STATION_ROLES],
          title: "⛔ ORDER CANCELLED",
          body: `${table} • stop preparing and do not serve`,
          tag: `fana-cancelled-${t.id}`,
          urgent: true,
          repeat: 0,
        },
      ];
    }

    default:
      return [];
  }
}

export interface StationProgressInfo extends TicketAlertInfo {
  /** kitchen | barista */
  station: string;
  itemName: string;
  quantity: number;
  /** True when this was the LAST unfinished item of the whole order. */
  wholeOrderReady: boolean;
}

/**
 * The crew touched an item. "Done" is the alert waiters were missing entirely:
 * food went cold on the pass because nobody told them it was ready.
 */
export function stationProgressAlerts(stationStatus: string, info: StationProgressInfo): RoleAlert[] {
  if (stationStatus === "done") {
    return [
      {
        roles: ["waiter"],
        title: info.wholeOrderReady ? "🔔 ORDER READY TO SERVE" : "🔔 Ready to serve",
        body: info.wholeOrderReady
          ? `${info.tableName} • the whole order is ready, pick it up`
          : `${info.tableName} • ${info.itemName} x${info.quantity} is ready`,
        tag: `fana-ready-${info.id}-${info.itemName}`,
        urgent: true,
        repeat: 0,
      },
    ];
  }
  // "accepted" (the crew STARTED a dish) is SILENT (owner's decision, Sept
  // 2026): the waiter cannot serve food that is still in the pan, so ringing
  // her for it is pure noise. Only "done" wakes her — that is the moment she
  // must walk to the pass.
  return [];
}

export interface ItemChangeInfo extends TicketAlertInfo {
  itemName: string;
  /** kitchen | barista | "" when the line has no station. */
  station?: string | null;
  /** Only for quantity edits. */
  fromQuantity?: number;
  toQuantity?: number;
}

/**
 * An item was removed from a live bill (out of stock, guest changed mind).
 *
 * Only the station that owns the line is rung ("do not prepare") — they may
 * have it in the pan. The WAITER is deliberately NOT rung (owner's decision,
 * Sept 2026): she either removed it herself (the bill editor) or stands next
 * to the cashier who did, and her screen updates instantly either way.
 */
export function itemRemovedAlerts(info: ItemChangeInfo): RoleAlert[] {
  const stationRoles = stationRoleFor(info.station);
  if (stationRoles.length === 0) return [];
  return [
    {
      roles: stationRoles,
      title: "✗ Do not prepare",
      body: `${info.tableName} • ${info.itemName} was removed from the order`,
      tag: `fana-item-removed-s-${info.id}-${info.itemName}`,
      urgent: true,
      repeat: 0,
    },
  ];
}

/** A quantity was corrected on a live bill. */
export function itemQuantityAlerts(info: ItemChangeInfo): RoleAlert[] {
  const stationRoles = stationRoleFor(info.station);
  const change = `${info.itemName}: ${info.fromQuantity} to ${info.toQuantity}`;
  const alerts: RoleAlert[] = [
    {
      roles: ["waiter"],
      title: "✎ Quantity changed",
      body: `${info.tableName} • ${change}`,
      tag: `fana-item-qty-${info.id}-${info.itemName}`,
      urgent: false,
      repeat: 0,
    },
  ];
  if (stationRoles.length > 0) {
    alerts.push({
      roles: stationRoles,
      title: "✎ Quantity changed",
      body: `${info.tableName} • ${change}`,
      tag: `fana-item-qty-s-${info.id}-${info.itemName}`,
      urgent: true,
      repeat: 0,
    });
  }
  return alerts;
}

/**
 * A note was changed on a line the crew already STARTED (accepted/done).
 *
 * A note edited while the line is still pending needs no alarm — the crew
 * reads the fresh note when they pick the line up. But once it is in the pan,
 * "no sugar" becoming "extra sugar" is new information they would otherwise
 * never re-read, so the owning station is rung urgently. The waiter is not
 * rung: she either wrote it herself or stands next to the cashier who did.
 */
export function itemNotesAlerts(info: ItemChangeInfo): RoleAlert[] {
  const stationRoles = stationRoleFor(info.station);
  if (stationRoles.length === 0) return [];
  return [
    {
      roles: stationRoles,
      title: "✎ Note changed",
      body: `${info.tableName} • ${info.itemName}: re-read the note before serving`,
      tag: `fana-item-note-s-${info.id}-${info.itemName}`,
      urgent: true,
      repeat: 0,
    },
  ];
}

/**
 * A line was corrected on a bill the cashier ALREADY keyed into the EFD.
 *
 * The EFD receipt went out with the old total, so the cashier must re-key
 * (void-and-reprint or a correction receipt, per EFD practice) — and she only
 * knows if someone tells her, because the editor is usually a WAITER fixing a
 * pending line, not her. Urgent: every minute the EFD and the system disagree
 * is a minute the cross-check cannot reconcile.
 */
export function itemEditedAfterPrintAlerts(info: ItemChangeInfo): RoleAlert[] {
  return [
    {
      roles: ["cashier"],
      title: "⚠ Bill changed after print",
      body: `${info.tableName} • ${info.itemName} was corrected after the EFD receipt, re-key it`,
      tag: `fana-edited-after-print-${info.id}`,
      urgent: true,
      repeat: 0,
    },
  ];
}

/** The guest asked for the bill from their own phone. */
export function billRequestAlerts(t: TicketAlertInfo): RoleAlert[] {
  return [
    {
      roles: ["waiter", "cashier"],
      title: "🧾 Bill requested",
      body: `${t.tableName}${money(t)} • the guest asked for the bill`,
      tag: `fana-bill-${t.id}`,
      urgent: true,
      repeat: 0,
    },
  ];
}

function stationRoleFor(station?: string | null): StaffRole[] {
  // kitchen | barista | buna — an unknown or missing station belongs to no
  // crew, so it rings nobody (the screens still update silently).
  return isStationName(station) ? [station] : [];
}

/**
 * Never ring the person who just did the thing. Push subscriptions are stored
 * per ROLE, so the actor's role is dropped from the recipients: the cashier
 * printing a bill does not make her own tablet scream at her.
 */
export function withoutActor(alerts: RoleAlert[], actorRole?: string | null): RoleAlert[] {
  if (!actorRole) return alerts;
  return alerts
    .map((a) => ({ ...a, roles: a.roles.filter((r) => r !== actorRole) }))
    .filter((a) => a.roles.length > 0);
}

/**
 * WHO owns this ticket? The waiter who ACCEPTED it, otherwise the waiter who
 * SENT it. Food-ready and bill-request alarms go to this waiter ONLY — the
 * rest of the team must not ring for somebody else's table (owner's decision,
 * Sept 2026).
 *
 * Returns null when nobody owns it yet: a QR order nobody accepted
 * (createdBy is "Customer (QR)"). Those still ring EVERY waiter, because any
 * of them can walk over and accept.
 */
export function ticketOwner(confirmedBy?: string | null, createdBy?: string | null): string | null {
  const name = (confirmedBy || createdBy || "").trim();
  if (!name) return null;
  if (/^customer/i.test(name)) return null; // "Customer (QR)" — nobody's table yet
  if (/^waiter$/i.test(name)) return null; // legacy fallback value, not a person
  return name;
}
