import * as crypto from 'node:crypto';

export interface GeneratedApiKey {
  rawKey: string;
  hash: string;
  prefix: string;
}

export function generateApiKey(): GeneratedApiKey {
  const random = crypto.randomBytes(24).toString('hex');
  const rawKey = `unlp_info_${random}`;
  const hash = hashApiKey(rawKey);
  const prefix = `${rawKey.slice(0, 12)}...${rawKey.slice(-4)}`;

  return { rawKey, hash, prefix };
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey.trim()).digest('hex');
}
