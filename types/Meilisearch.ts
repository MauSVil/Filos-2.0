export type Meilisearch<T> = {
  hits: T[];
  offset: number;
  limit: number;
  estimatedTotalHits: number;
  totalPages: number;
  processingTimeMs: number;
  query: string;
}