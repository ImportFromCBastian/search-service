export const SITE_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
export type SiteFrequency = (typeof SITE_FREQUENCIES)[number];

export const SNAPSHOT_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export type SnapshotStatus = (typeof SNAPSHOT_STATUSES)[number];

export const ACTIVE_SNAPSHOT_STATUSES = ['pending', 'running'] as const;
export type PartialSnapshot = (typeof ACTIVE_SNAPSHOT_STATUSES)[number];

export const SNAPSHOT_TRIGGERS = ['manual', 'scheduled'] as const;
export type SnapshotTrigger = (typeof SNAPSHOT_TRIGGERS)[number];

export const LOG_LEVELS = ['info', 'warn', 'error'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];
