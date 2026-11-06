// Dates are always shown in Buenos Aires time. The tracking page renders on the server, whose time zone
// (usually UTC) is not the customer's, and the panel renders in the browser: one fixed zone keeps both equal.
const TIME_ZONE = "America/Argentina/Buenos_Aires";
const DAY_MS = 86_400_000;

const timeFormat = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIME_ZONE });
const dayFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: TIME_ZONE });
// The en-CA locale formats as YYYY-MM-DD, which is a stable key to compare calendar days.
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TIME_ZONE });

const dayKey = (date: Date) => dayKeyFormat.format(date);

/** "Hoy, 14:05 h", "Ayer, 09:30 h" or "3 nov, 16:20 h". `now` is injectable so tests do not depend on the clock. */
export function formatDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const time = `${timeFormat.format(date)} h`;
  const key = dayKey(date);
  if (key === dayKey(now)) return `Hoy, ${time}`;
  // Argentina has no daylight saving time, so "24 hours earlier" is always the previous calendar day.
  if (key === dayKey(new Date(now.getTime() - DAY_MS))) return `Ayer, ${time}`;
  return `${dayFormat.format(date).replace(".", "")}, ${time}`;
}

/** "Recién", "Hace 35 min", "Hace 3 h", or the full date once it is older than a day. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Recién";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (minutes < 24 * 60) return `Hace ${Math.floor(minutes / 60)} h`;
  return formatDate(iso, now);
}

/** Lowercase, no accents: lets "garcia" match "García". */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
