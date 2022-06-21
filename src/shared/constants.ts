import * as process from 'process';

export const IS_PROD = process.env.NODE_ENV === 'production';

export const CACHE_GLOBAL_TTL = 86400; // max global time ttl 24h
export const CACHE_GLOBAL_MAX_ITEMS = 100;
