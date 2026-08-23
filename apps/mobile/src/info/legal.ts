import type { Locale } from "@/i18n";

import { getLegalContent } from "../../../web/lib/legal-content";

export type LegalPage = "support" | "privacy" | "terms";

/** Legal and support copy is authored once for web and native mobile. */
export function legalContent(locale: Locale, page: LegalPage) {
  return getLegalContent(locale, page);
}
