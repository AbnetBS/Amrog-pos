/**
 * THE STATION VOCABULARY — one file, so the three crews can never drift apart.
 *
 * A "station" is a crew that physically makes something:
 *
 *   kitchen  → foods, pastries, meals & snacks          (/kitchen)
 *   barista  → machine coffee, juices & cold drinks      (/barista)
 *   buna     → TRADITIONAL coffee (jebena buna), made at the buna makers'
 *              own place, indoors and outdoors           (/buna)
 *
 * `buna` was added (owner's decision, Sept 2026) because the traditional
 * coffee is made by its own two people, who ALSO take orders like waiters when
 * the room is full. They are not the barista: their phone must ring only for
 * their own buna lines, never for machine coffee or kitchen work.
 *
 * WHICH ITEM GOES WHERE: a menu item flagged "Traditional buna" (menu_items.
 * is_buna) always goes to the BUNA station, whatever category it sits in —
 * the flag is per item, so "Jebena Buna" can live inside the Coffee category
 * next to the macchiato. Everything else follows the owner's category routing
 * (barista | kitchen) from the Stations tab.
 *
 * This module is deliberately PURE: no database, no Next.js, no React. It is
 * imported by the alert matrix and by the regression tests.
 */

export type StationName = "kitchen" | "barista" | "buna";

/** Every crew that can receive work — the order they are listed in. */
export const STATION_NAMES: StationName[] = ["kitchen", "barista", "buna"];

/**
 * Every role a login account can hold: the two floor roles, the three making
 * crews, and the owner. Kept here so the API validation and the admin dropdown
 * can never drift apart when a crew is added.
 */
export const STAFF_ROLES: string[] = ["waiter", "cashier", ...STATION_NAMES, "admin"];

export const STATION_LABELS: Record<StationName, string> = {
  kitchen: "Kitchen (Chef)",
  barista: "Barista",
  buna: "Buna Maker",
};

/** Short label used inside alert bodies ("for the Buna Maker"). */
export const STATION_SHORT: Record<StationName, string> = {
  kitchen: "kitchen",
  barista: "barista",
  buna: "buna station",
};

/** True when `value` names one of the three crews. */
export function isStationName(value: unknown): value is StationName {
  return value === "kitchen" || value === "barista" || value === "buna";
}

/**
 * Normalise a stored `station_name` value. Legacy rows and anything unknown
 * fall back to the KITCHEN, exactly like the old code did — an item must never
 * end up belonging to no crew, or nobody would ever press Done on it.
 */
export function stationOf(value: string | null | undefined): StationName {
  return isStationName(value) ? value : "kitchen";
}

/**
 * Which station does an ordered item belong to?
 *
 * The per-item traditional-buna flag WINS over the category routing: it is the
 * owner's explicit "this one goes to the buna makers" switch.
 */
export function stationForOrder(
  categoryRouting: Record<string, "barista" | "kitchen">,
  categorySlug: string,
  isBunaItem: boolean
): StationName {
  if (isBunaItem) return "buna";
  return categoryRouting[categorySlug] || "kitchen";
}
