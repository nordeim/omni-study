// ---------------------------------------------------------------------------
// Date utilities — pure, unit-tested. Local-time semantics throughout (the
// reference app treats days in the user's timezone). No external date dep.
// ---------------------------------------------------------------------------

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
/** Sunday-first weekday labels — the reference CALENDAR column order (S9-E). */
export const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const WEEKDAY_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** ISO weekday index 0..6 (Mon=0) for a Date. */
export function isoWeekday(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Midnight (local) of the given date. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

export function addMonths(d: Date, months: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "October 6, 2026" (en-US long format, like the reference). */
export function formatLongDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "Tuesday, October 6, 2026" */
export function formatFullDate(d: Date): string {
  return `${WEEKDAY_LONG[isoWeekday(d)]}, ${formatLongDate(d)}`;
}

/** "October 2026" */
export function formatMonthYear(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Tue, Oct 6" (sidebar clock) */
export function formatShortWithYear(d: Date): string {
  const wd = WEEKDAY_SHORT[isoWeekday(d)]!;
  const mon = MONTHS[d.getMonth()]!.slice(0, 3);
  return `${wd}, ${mon} ${d.getDate()}`;
}

/** "03:05 PM" / "09:05 AM" (sidebar clock + mobile app bar, 12-hour with
 *  a 2-digit hour — measured live on the reference: "03:43 AM"). */
export function formatTime12h(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${m} ${ap}`;
}

/**
 * Calendar grid for a month: SUNDAY-first (S9-E, re-measured live on the
 * reference — the weekday header runs Sun…Sat and October 2026 starts at
 * Sep 27), with a dynamic week count: exactly the weeks needed
 * (ceil((lead + daysInMonth) / 7) rows — 35 cells for October 2026, six
 * rows only when the month spills past five). Returns Date objects plus
 * whether each belongs to the target month.
 */
export function monthGrid(year: number, monthIndex0: number): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, monthIndex0, 1);
  const lead = first.getDay(); // Sunday = 0 — the reference's column order
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const weeks = Math.ceil((lead + daysInMonth) / 7);
  const cells: { date: Date; inMonth: boolean }[] = [];
  const start = addDays(first, -lead);
  for (let i = 0; i < weeks * 7; i++) {
    const date = addDays(start, i);
    cells.push({ date, inMonth: date.getMonth() === monthIndex0 });
  }
  return cells;
}

/** Whole-day bucket label: Today / Tomorrow / weekday long date. */
export function dayBucketLabel(d: Date, today: Date): string {
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, addDays(today, 1))) return "Tomorrow";
  return formatFullDate(d);
}

/** Days until d (relative to today); negative if past. */
export function daysUntil(d: Date, today: Date): number {
  const ms = startOfDay(d).getTime() - startOfDay(today).getTime();
  return Math.round(ms / 86_400_000);
}

/** "2h 15m" style durations from minutes. */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Parse "HH:MM" → minutes since midnight; null when malformed. */
export function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Minutes since midnight → "HH:MM". */
export function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Format a duration between two "HH:MM" stamps as "1h 30m". */
export function formatHHMMRange(start: string, end: string): string {
  const a = parseHHMM(start);
  const b = parseHHMM(end);
  if (a === null || b === null) return "";
  return formatMinutes(Math.max(0, b - a));
}

/** ISO-8601 week number (1..53). The reference's Events panel renders
 *  "Oct 2026 CW 41" — the calendar week of the selected day. */
export function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon = 0 … Sun = 6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / 604_800_000);
}
