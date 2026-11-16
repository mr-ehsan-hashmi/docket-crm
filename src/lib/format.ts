const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

export function formatRelative(iso: string, now: number = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const elapsed = Math.abs(seconds);

  if (elapsed < 45) return "just now";
  if (elapsed < HOUR) return relativeFormatter.format(Math.round(seconds / MINUTE), "minute");
  if (elapsed < DAY) return relativeFormatter.format(Math.round(seconds / HOUR), "hour");
  if (elapsed < 7 * DAY) return relativeFormatter.format(Math.round(seconds / DAY), "day");
  return formatDate(iso);
}

export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function excerptOf(body: string): string {
  return body.length > 90 ? `${body.slice(0, 90).trimEnd()}…` : body;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
