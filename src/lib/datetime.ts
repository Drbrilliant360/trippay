/** All times display in East Africa Time regardless of viewer timezone. */
const EAT = "Africa/Dar_es_Salaam";

export function formatDateTime(iso: string, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: EAT,
  }).format(new Date(iso));
}

export function formatDate(iso: string, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: EAT,
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
    timeZone: EAT,
  }).format(new Date(iso));
}

export function formatShortDate(iso: string, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: EAT,
  }).format(new Date(iso));
}
