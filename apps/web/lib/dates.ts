/**
 * Parse an API timestamp without relying on browser-specific date parsing.
 *
 * Our database currently stores UTC values as naive datetimes, so older API
 * responses look like `2026-08-23T09:30:00` rather than carrying a timezone.
 * Chromium treats those as local time, while Safari may reject them entirely.
 * Treating legacy naive API values as UTC keeps the instant stable until every
 * API response has been migrated to emit an explicit `Z` suffix.
 */
export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const input = value.trim();
  if (!input) return null;

  // A date-only string represents a calendar day, not midnight UTC. Construct
  // it from numeric parts so a west-of-UTC timezone never displays yesterday.
  const calendar = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (calendar) {
    const [, year, month, day] = calendar;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // ISO-8601 allows `Z` or an explicit numeric offset. Add Z only for the
  // legacy timezone-less UTC values our FastAPI/Pydantic responses contain.
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input);
  const normalized = hasTimezone ? input : `${input}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatApiDate(
  value: string | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string | null {
  const date = parseApiDate(value);
  return date ? new Intl.DateTimeFormat(locale, options).format(date) : null;
}

/** Convert an HTML date-only deadline to explicit UTC ISO-8601. */
export function dateInputToDeadlineIso(value: string): string | null {
  const date = parseApiDate(value);
  if (!date) return null;
  // A due date should remain available through the selected local calendar
  // day. Numeric construction avoids Safari's ambiguous string parser.
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}
