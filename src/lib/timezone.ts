/**
 * THE ETHIOPIAN WALL CLOCK (owner, Sept 2026).
 *
 * The server runs on Railway (UTC), but the cafe runs on Ethiopian time
 * (EAT, UTC+3 — no daylight saving, ever). Every "today", "yesterday" and
 * "which hour sold most" in the reports must follow the clock on the office
 * PC, not the server's: at 1am in Addis the server still thinks it is
 * yesterday, and a 6pm rush would print as 3pm. All day/hour math goes
 * through these helpers — never through the Date's local getters.
 */
export const ETHIOPIA_TIME_ZONE = "Africa/Addis_Ababa";

/** EAT is a fixed UTC+3 all year (Ethiopia never observes DST). */
const ET_OFFSET_MS = 3 * 60 * 60 * 1000;

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: ETHIOPIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const hourFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: ETHIOPIA_TIME_ZONE,
  hour: "numeric",
  hour12: false,
});

const asDate = (d: Date | string | null | undefined): Date | null => {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

/** "2026-09-09" — the EAT calendar day an instant falls on. */
export function etDayKey(d: Date | string | null | undefined): string | null {
  const dt = asDate(d);
  if (!dt) return null;
  const [m, day, y] = partsFmt.format(dt).split("/"); // en-US order is MM/DD/YYYY
  return `${y}-${m}-${day}`;
}

/** True when the instant falls on today's EAT calendar day. */
export function isTodayET(d: Date | string | null | undefined): boolean {
  const k = etDayKey(d);
  return k !== null && k === etDayKey(new Date());
}

/** True when the instant falls on yesterday's EAT calendar day. */
export function isYesterdayET(d: Date | string | null | undefined): boolean {
  const k = etDayKey(d);
  if (k === null) return false;
  // EAT midnight today minus one day, keyed back in EAT: a true calendar
  // yesterday even around midnight (unlike "24 hours ago").
  return k === etDayKey(new Date(etStartOfToday().getTime() - 24 * 60 * 60 * 1000));
}

/**
 * The UTC instant of EAT midnight today — the `printedAt >=` cutoff for
 * "printed today" queries. Built from the EAT calendar date, so it is right
 * whatever timezone the server runs in.
 */
export function etStartOfToday(): Date {
  return etStartOfDay(new Date());
}

/** The UTC instant of EAT midnight on the EAT calendar day `d` falls on. */
export function etStartOfDay(d: Date | string): Date {
  const dt = d instanceof Date ? d : new Date(d);
  const [y, m, day] = (etDayKey(dt) || "1970-01-01").split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0) - ET_OFFSET_MS);
}

/** The UTC instant of EAT midnight on an explicit EAT calendar date. */
export function etStartOfCalendarDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - ET_OFFSET_MS);
}

/** Hour of day (0-23) on the Ethiopian wall clock. */
export function etHour(d: Date | string): number {
  const dt = d instanceof Date ? d : new Date(d);
  // hour12:false renders midnight as "24" on some ICU builds — normalize it.
  return Number(hourFmt.format(dt)) % 24;
}
