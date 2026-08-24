/** Safari/iOS rejects several otherwise-common timestamp strings, especially
 * legacy API values such as `2026-08-23T09:30:00` without a UTC offset. */
export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const input = value.trim();
  if (!input) return null;

  const calendar = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (calendar) {
    const [, year, month, day] = calendar;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input);
  const date = new Date(hasTimezone ? input : `${input}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatApiDate(
  value: string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string | null {
  const date = parseApiDate(value);
  return date ? new Intl.DateTimeFormat(locale, options).format(date) : null;
}

/** Turn a YYYY-MM-DD deadline into an unambiguous end-of-local-day instant. */
export function dateInputToDeadlineIso(value: string): string | null {
  const date = parseApiDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}
