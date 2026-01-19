const CACHE_PREFIX = 'device_img_v1:';
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/**
 * Lightweight helper to check whether an image URL is loadable.
 * Uses <img> rather than fetch to avoid CORS complexities.
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
function canLoadImage(url, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;

    const finish = (ok) => {
      if (done) return;
      done = true;
      resolve(ok);
    };

    const timer = window.setTimeout(() => finish(false), timeoutMs);

    img.onload = () => {
      window.clearTimeout(timer);
      finish(true);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish(false);
    };

    // Ensure caches can be used by the browser; no credentials needed.
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    img.src = url;
  });
}

/**
 * Cache record structure stored in localStorage.
 * @typedef {{
 *   url: string,
 *   expiresAt: number
 * }} CacheRecord
 */

/**
 * Read cache record for a key.
 * @param {string} key
 * @returns {CacheRecord | null}
 */
function readCache(key) {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.url || !parsed?.expiresAt) return null;
    if (Date.now() > Number(parsed.expiresAt)) return null;
    return { url: String(parsed.url), expiresAt: Number(parsed.expiresAt) };
  } catch {
    return null;
  }
}

/**
 * Write cache record for a key.
 * @param {string} key
 * @param {string} url
 * @param {number} ttlMs
 */
function writeCache(key, url, ttlMs) {
  try {
    const record = { url, expiresAt: Date.now() + ttlMs };
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(record));
  } catch {
    // Ignore quota/security errors; slider will still work with runtime probing.
  }
}

/**
 * Build a list of candidate image URLs for a given device brand.
 * We intentionally use public GitHub-hosted CDNs (jsDelivr) that serve raw PNG/SVG assets.
 *
 * Note: Some sources provide SVG. SVG still works well for crisp device renders; however
 * the task prefers PNG with transparent BG. Where possible we prioritize PNG first,
 * then fall back to SVG.
 *
 * @param {'apple'|'samsung'|'oneplus'} brandKey
 * @returns {string[]}
 */
function buildBrandCandidates(brandKey) {
  /**
   * NOTE:
   * The hero slider requires specific public CDN endpoints for each device image.
   * We keep a *small* ordered list of candidates per brand so:
   * - primary URL is the specified CDN endpoint
   * - secondary URLs can act as resilience (if the primary is temporarily unavailable)
   *
   * Caching + probing logic is implemented in resolveDeviceImageUrl; we only provide candidates here.
   *
   * If you need to swap endpoints again, update the PRIMARY_* constants below.
   */

  // Primary (specified) endpoints:
  const PRIMARY_APPLE_IPHONE_URL = 'https://cdn.dxomark.com/wp-content/uploads/medias/post-122599/Apple-iPhone-14-Pro-front.png';
  const PRIMARY_SAMSUNG_URL = 'https://cdn.dxomark.com/wp-content/uploads/medias/post-122928/Samsung-Galaxy-S23-Ultra-front.png';
  const PRIMARY_ONEPLUS_URL = 'https://cdn.dxomark.com/wp-content/uploads/medias/post-122864/OnePlus-11-front.png';

  // Brand-specific fallback endpoints (user-provided).
  // These are tried immediately after primary before any generic resilience sources.
  const FALLBACK_APPLE_IPHONE_URL = 'https://www.gizmochina.com/wp-content/uploads/2022/09/iPhone-14-Pro-Front.png';
  const FALLBACK_SAMSUNG_URL = 'https://www.gizmochina.com/wp-content/uploads/2023/02/Samsung-Galaxy-S23-Ultra-front.png';
  const FALLBACK_ONEPLUS_URL = 'https://www.gizmochina.com/wp-content/uploads/2023/01/OnePlus-11-front.png';

  // Secondary resilience sources (public CDNs).
  // DeviceFrames (SVG device frames) - stable and transparent.
  const deviceFramesBase = 'https://cdn.jsdelivr.net/gh/fakenickels/DeviceFrames@master';
  // BasicPixels (PNG device mockups) - may vary by repo contents; kept as best-effort.
  const basicPixelsBase = 'https://cdn.jsdelivr.net/gh/BarzilaiRonen/BasicPixels@master';

  switch (brandKey) {
    case 'apple':
      return [
        PRIMARY_APPLE_IPHONE_URL,
        FALLBACK_APPLE_IPHONE_URL,

        // Resilience candidates:
        `${basicPixelsBase}/devices/Apple%20iPhone%2015%20Pro.png`,
        `${basicPixelsBase}/devices/iPhone%2015%20Pro.png`,
        `${deviceFramesBase}/Screens/Apple%20iPhone%2015%20Pro%20Natural%20Titanium.svg`,
        `${deviceFramesBase}/Screens/Apple%20iPhone%2014%20Pro%20Space%20Black.svg`,
      ];
    case 'samsung':
      return [
        PRIMARY_SAMSUNG_URL,
        FALLBACK_SAMSUNG_URL,

        // Resilience candidates:
        `${basicPixelsBase}/devices/Samsung%20Galaxy%20S24%20Ultra.png`,
        `${basicPixelsBase}/devices/Galaxy%20S24%20Ultra.png`,
        `${deviceFramesBase}/Screens/Samsung%20Galaxy%20S24%20Ultra%20Titanium%20Black.svg`,
        `${deviceFramesBase}/Screens/Samsung%20Galaxy%20S23%20Ultra%20Phantom%20Black.svg`,
      ];
    case 'oneplus':
      return [
        PRIMARY_ONEPLUS_URL,
        FALLBACK_ONEPLUS_URL,

        // Resilience candidates (not guaranteed in public repos; kept best-effort):
        `${basicPixelsBase}/devices/OnePlus%2012.png`,
        `${basicPixelsBase}/devices/OnePlus%2011.png`,
        `${deviceFramesBase}/Screens/OnePlus%2012%20Black.svg`,
        `${deviceFramesBase}/Screens/OnePlus%2011%20Black.svg`,
      ];
    default:
      return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * Resolve a real device image URL for a given brand, using:
 * 1) localStorage cached resolved URL (TTL)
 * 2) probe public CDN candidates until one loads
 * 3) fall back to provided local asset URL
 *
 * @param {{
 *   brandKey: 'apple'|'samsung'|'oneplus',
 *   fallbackSrc: string,
 *   ttlMs?: number,
 *   timeoutMs?: number
 * }} args
 * @returns {Promise<string>} resolved URL (remote or fallback)
 */
export async function resolveDeviceImageUrl(args) {
  /** Resolve a remote device image URL with caching and fallbacks. */
  const { brandKey, fallbackSrc, ttlMs = DEFAULT_TTL_MS, timeoutMs = 6500 } = args || {};
  const cacheKey = `brand:${brandKey}`;

  // SSR guard (CRA is client-side, but keep safe).
  if (typeof window === 'undefined') return fallbackSrc;

  const cached = readCache(cacheKey);
  if (cached?.url) {
    // Still validate quickly; if it fails (CDN outage), we'll re-probe.
    const ok = await canLoadImage(cached.url, Math.min(3000, timeoutMs));
    if (ok) return cached.url;
  }

  const candidates = buildBrandCandidates(brandKey);
  for (const url of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await canLoadImage(url, timeoutMs);
    if (ok) {
      writeCache(cacheKey, url, ttlMs);
      return url;
    }
  }

  return fallbackSrc;
}

/**
 * PUBLIC_INTERFACE
 * Preload a list of URLs (best-effort).
 * @param {string[]} urls
 */
export function preloadImages(urls = []) {
  /** Preload images to reduce visible loading during slide transitions. */
  if (typeof window === 'undefined') return;
  urls.forEach((u) => {
    if (!u) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = u;
  });
}
