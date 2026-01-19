const BASE_URL = 'http://localhost:3001';

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
 * Perform a JSON request to the backend.
 * @param {string} path
 * @param {{ method?: string, body?: any, query?: Record<string, any>, signal?: AbortSignal }} options
 * @returns {Promise<any>}
 */
async function requestJson(path, options = {}) {
  const { method = 'GET', body, query, signal } = options;

  const url = `${BASE_URL}${path}${toQueryString(query)}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal
  });

  if (!res.ok) {
    const msg = await readErrorMessage(res);
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  // 204 support (not expected here, but safe)
  if (res.status === 204) return null;
  return res.json();
}

// PUBLIC_INTERFACE
export async function getBrands() {
  /** Fetch supported brands. */
  return requestJson('/api/brands');
}

// PUBLIC_INTERFACE
export async function getModels(brandId) {
  /** Fetch models for a given brand id. */
  return requestJson('/api/models', { query: { brand: brandId } });
}

// PUBLIC_INTERFACE
export async function getProblems() {
  /** Fetch common repair problems. */
  return requestJson('/api/problems');
}

// PUBLIC_INTERFACE
export async function createBooking(payload) {
  /** Create a new booking (returns { booking_id }). */
  return requestJson('/api/booking', { method: 'POST', body: payload });
}

// PUBLIC_INTERFACE
export async function adminListBookings(params = {}) {
  /** List bookings for admin dashboard (returns { total, items }). */
  return requestJson('/api/admin/bookings', { query: params });
}

// PUBLIC_INTERFACE
export async function adminUpdateStatus(bookingId, status) {
  /** Update booking status (returns { updated }). */
  return requestJson('/api/admin/update_status', {
    method: 'POST',
    body: { booking_id: bookingId, status }
  });
}
