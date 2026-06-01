export interface CacheVO {
  commandStats: Array<{ name: string; value: string | number }>;
  dbSize: number;
  info: Record<string, string>;
}
