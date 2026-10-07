// ---------------------------------------------------------------------------
// Date utilities — pure, unit-tested. Local-time semantics throughout (the
// reference app treats days in the user's timezone). No external date dep.
// ---------------------------------------------------------------------------

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
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

/** "11:29 PM" / "09:05 AM" (sidebar clock, 12-hour). */
export function formatTime12h(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ap}`;
}

/**
 * Calendar grid for a month: 6 rows × 7 cols starting Monday (the reference
 * grid shows leading days of the previous month — measured live). Returns
 * Date objects plus whether each belongs to the target month.
 */
export function monthGrid(year: number, monthIndex0: number): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, monthIndex0, 1);
  const lead = isoWeekday(first);
  const cells: { date: Date; inMonth: boolean }[] = [];
  const start = addDays(first, -lead);
  for (let i = 0; i < 42; i++) {
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
