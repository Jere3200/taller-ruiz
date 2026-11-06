const timeFormat = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
const dayFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" });

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "Hoy, 14:05 h", "Ayer, 09:30 h" or "3 nov, 16:20 h". `now` is injectable so tests do not depend on the clock. */
export function formatDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = `${timeFormat.format(date)} h`;
  if (sameDay(date, now)) return `Hoy, ${time}`;
  if (sameDay(date, yesterday)) return `Ayer, ${time}`;
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
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
