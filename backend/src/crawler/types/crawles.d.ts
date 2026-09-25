export interface CrawlQueueItem {
  url: string;
  depth: number;
}

export interface ExtractedData {
  name?: string;
  description?: string;
  extra?: Record<string, unknown>;
}

export interface PageResult {
  html: string;
  statusCode: number;
  executionTimeMs: number;
}

export interface DiscoveredLinks {
  discoveredRawLinks: string[];
  linksToQueue: string[];
}

export interface PersistDocumentData {
  userId: Types.ObjectId;
  siteId: Types.ObjectId;
  snapshotId: Types.ObjectId;
  extractedData: ExtractedData;
  $: cheerio.CheerioAPI;
  normalizedUrl: string;
  statusCode: number;
  executionTimeMs: number;
  depth: number;
  discoveredRawLinks: string[];
}

export interface CrawlJobData {
  siteId: string;
  snapshotId: string;
  userId: string;
}
