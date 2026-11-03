/**
 * High-performance client-side cache for product catalog & banners.
 * Prevents repetitive network waterfalls when switching between pages.
 */

const memoryCache = new Map<string, { data: any; expiry: number }>();
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();

  // 1. Check in-memory cache (Fastest: 0ms)
  const mem = memoryCache.get(key);
  if (mem && mem.expiry > now) {
    return mem.data as T;
  }

  // 2. Check sessionStorage cache
  try {
    const raw = sessionStorage.getItem(`lakshya_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expiry > now) {
        memoryCache.set(key, parsed);
        return parsed.data as T;
      }
    }
  } catch {
    // ignore
  }

  // 3. Network Fetch
  const freshData = await fetchFn();

  // 4. Update memory & session cache
  const entry = { data: freshData, expiry: now + ttlMs };
  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`lakshya_cache_${key}`, JSON.stringify(entry));
  } catch {
    // ignore
  }

  return freshData;
}

export function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear();
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith('lakshya_cache_')) sessionStorage.removeItem(k);
      });
    } catch {
      // ignore
    }
    return;
  }

  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) memoryCache.delete(k);
  }
  try {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(`lakshya_cache_${keyPrefix}`)) sessionStorage.removeItem(k);
    });
  } catch {
    // ignore
  }
}
