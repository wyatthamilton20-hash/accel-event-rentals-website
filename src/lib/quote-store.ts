// QuoteStore is intentionally an interface so the storage backend can be
// swapped without touching callers. To persist to a real DB later, implement
// QuoteStore with a Postgres/SQLite/Mongo class and replace the `quoteStore`
// export. No callers need to change.

import { log } from "./log";
import type { QuotePayload } from "./quote-types";

export interface QuoteStore {
  put(quoteId: string, payload: QuotePayload): Promise<void>;
}

export class LogQuoteStore implements QuoteStore {
  async put(quoteId: string, payload: QuotePayload): Promise<void> {
    log.info(
      "quote_submitted",
      { quoteId, ...(payload as unknown as Record<string, unknown>) },
      { pii: true }
    );
  }
}

export const quoteStore: QuoteStore = new LogQuoteStore();
