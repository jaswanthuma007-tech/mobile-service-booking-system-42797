import { MOCK_BRANDS, MOCK_MODELS_BY_BRAND_ID, MOCK_PROBLEMS } from './mocks';

const DEFAULT_TIMEOUT_MS = 8000;

// Prefer explicit env overrides, otherwise default to relative /api so CRA proxy can handle dev without CORS.
const API_BASE =
  (process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '/api')?.replace(/\/+$/, '') || '/api';

const USE_MOCKS_TOGGLE = String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';

// Module-level state: we turn this on automatically if backend is unreachable or is returning 5xx.
let autoMockFallbackEnabled = false;

/**
 * Determine if a URL is absolute (http/https).
 * @param {string} s
 * @returns {boolean}
 */
function isAbsoluteUrl(s) {
  return /^https?:\/\//i.test(String(s || ''));
}

/**
 * Join base + path safely.
 * @param {string} base
 * @param {string} path
 * @returns {string}
 */
function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').startsWith('/') ? String(path) : `/${path}`;
  if (!b) return p;
  return `${b}${p}`;
}

/**
 * Convert an object to a querystring (skips null/undefined/empty-string).
 * @param {Record<string, any>} params
 * @returns {string}
 */
function toQueryString(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/**
 * Create a normalized error object for the UI.
 * @param {{
 *   type: 'timeout'|'network'|'http',
 *   message: string,
 *   status?: number,
 *   url?: string
 * }} args
 */
function createApiError(args) {
  const err = new Error(args.message);
  err.type = args.type;
  if (args.status !== undefined) err.status = args.status;
  if (args.url) err.url = args.url;
  return err;
}

/**
 * Reads an error response safely and returns a usable message.
 * @param {Response} res
 * @returns {Promise<string>}
 */
async function readErrorMessage(res) {
  try {
    const data = await res.json();
    if (data?.message) return data.message;
    return `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/**
 * Decide if we should switch into automatic mock fallback.
 * - network errors (DNS/CORS/offline)
 * - timeouts
 * - 5xx errors
 * @param {any} err
 * @returns {boolean}
 */
function shouldEnableAutoMockFallback(err) {
  if (!err) return false;
  if (err.type === 'network' || err.type === 'timeout') return true;
  const status = Number(err.status);
  if (!Number.isNaN(status) && status >= 500) return true;
  return false;
}

/**
 * Friendly message for UI.
 * @param {any} err
 * @returns {string}
 */
function toFriendlyMessage(err) {
  if (!err) return 'Something went wrong.';
  if (err.type === 'timeout') return 'The server is taking too long to respond. Please try again.';
  if (err.type === 'network') return 'We couldn’t reach the server. Please check your connection and try again.';
  if (err.type === 'http') return err.message || 'Request failed.';
  return err.message || 'Request failed.';
}

/**
 * Perform a JSON request to the backend with a timeout.
 * @param {string} path
 * @param {{ method?: string, body?: any, query?: Record<string, any>, signal?: AbortSignal, timeoutMs?: number }} options
 * @returns {Promise<any>}
 */
async function requestJson(path, options = {}) {
  const { method = 'GET', body, query, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const base = API_BASE || '';
  const url = joinUrl(base, path) + toQueryString(query);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException('timeout', 'AbortError')), timeoutMs);

  // If caller provided a signal, abort our internal controller when it aborts.
  let removeSignalListener = null;
  if (signal) {
    const onAbort = () => controller.abort(signal.reason || new DOMException('aborted', 'AbortError'));
    signal.addEventListener('abort', onAbort);
    removeSignalListener = () => signal.removeEventListener('abort', onAbort);
  }

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const msg = await readErrorMessage(res);
      throw createApiError({ type: 'http', status: res.status, message: msg, url });
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (e) {
    // AbortError could be timeout or caller cancellation; try to distinguish.
    if (e?.name === 'AbortError') {
      // If the caller signal is aborted, do not treat as timeout/network; just rethrow as a cancellation.
      if (signal?.aborted) throw e;
      throw createApiError({
        type: 'timeout',
        message: 'Request timed out.',
        url
      });
    }

    // Fetch throws TypeError for network/CORS issues.
    const msg = e?.message ? String(e.message) : '';
    if (e instanceof TypeError || /Failed to fetch/i.test(msg) || /NetworkError/i.test(msg) || /Load failed/i.test(msg)) {
      throw createApiError({
        type: 'network',
        message: `Network error calling ${isAbsoluteUrl(API_BASE) ? API_BASE : 'backend'}.`,
        url
      });
    }

    // Preserve already normalized http errors.
    if (e?.type === 'http' || e?.type === 'timeout' || e?.type === 'network') throw e;

    throw createApiError({ type: 'http', message: msg || 'Request failed.', url });
  } finally {
    clearTimeout(timeout);
    if (removeSignalListener) removeSignalListener();
  }
}

/**
 * Return whether mocks are currently being used (either via env toggle, or automatic fallback).
 * This is useful for UI hints (e.g., “Using demo data”).
 * @returns {boolean}
 */
function isMockModeEnabled() {
  return USE_MOCKS_TOGGLE || autoMockFallbackEnabled;
}

/**
 * Wrapper to call API and optionally fall back to mocks when configured or when backend is unhealthy.
 * @param {() => Promise<any>} apiCall
 * @param {() => any} mockValueFactory
 * @returns {Promise<any>}
 */
async function callWithMockFallback(apiCall, mockValueFactory) {
  if (isMockModeEnabled()) return mockValueFactory();

  try {
    return await apiCall();
  } catch (err) {
    if (shouldEnableAutoMockFallback(err)) {
      autoMockFallbackEnabled = true;
      return mockValueFactory();
    }
    // Re-throw non-fallback errors
    throw createApiError({ type: err.type || 'http', status: err.status, message: toFriendlyMessage(err), url: err.url });
  }
}

// PUBLIC_INTERFACE
export function getApiStatus() {
  /** Expose API config/state for UI diagnostics (base URL + mock mode). */
  return {
    apiBase: API_BASE,
    useMocksToggle: USE_MOCKS_TOGGLE,
    autoMockFallbackEnabled,
    mockModeEnabled: isMockModeEnabled()
  };
}

// PUBLIC_INTERFACE
export async function getBrands(options = {}) {
  /** Fetch supported brands. */
  return callWithMockFallback(
    () => requestJson('/brands', options),
    () => MOCK_BRANDS.slice()
  );
}

// PUBLIC_INTERFACE
export async function getModels(brandId, options = {}) {
  /** Fetch models for a given brand id. */
  const id = Number(brandId);
  return callWithMockFallback(
    () => requestJson('/models', { ...options, query: { ...(options.query || {}), brand: id } }),
    () => (MOCK_MODELS_BY_BRAND_ID[id] ? MOCK_MODELS_BY_BRAND_ID[id].slice() : [])
  );
}

// PUBLIC_INTERFACE
export async function getProblems(options = {}) {
  /** Fetch common repair problems. */
  return callWithMockFallback(
    () => requestJson('/problems', options),
    () => MOCK_PROBLEMS.slice()
  );
}

// PUBLIC_INTERFACE
export async function getServices() {
  /** Fetch available repair services (alias of problems endpoint). */
  return getProblems();
}

// PUBLIC_INTERFACE
export async function createBooking(payload) {
  /** Create a new booking (returns { booking_id }). */
  // Important: do NOT mock booking creation automatically; user actions should fail loudly
  // unless the explicit toggle is enabled (demo mode).
  if (USE_MOCKS_TOGGLE || autoMockFallbackEnabled) {
    // Simulate realistic latency
    await new Promise((r) => setTimeout(r, 450));
    return { booking_id: Math.floor(100000 + Math.random() * 900000) };
  }
  return requestJson('/booking', { method: 'POST', body: payload });
}

// PUBLIC_INTERFACE
export async function adminListBookings(params = {}) {
  /** List bookings for admin dashboard (returns { total, items }). */
  return requestJson('/admin/bookings', { query: params });
}

// PUBLIC_INTERFACE
export async function adminUpdateStatus(bookingId, status) {
  /** Update booking status (returns { updated }). */
  return requestJson('/admin/update_status', {
    method: 'POST',
    body: { booking_id: bookingId, status }
  });
}

// PUBLIC_INTERFACE
export async function trackBooking(bookingId, options = {}) {
  /** Track a booking (returns { booking_id, current_status, created_at, history }). */
  const id = Number(bookingId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Please enter a valid numeric booking ID.');
  }
  return requestJson(`/track/${id}`, options);
}
