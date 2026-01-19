#!/usr/bin/env node
/**
 * E2E verification for CRA dev-server proxy:
 * 1) POST /api/booking
 * 2) GET  /api/track/{bookingId}
 *
 * This script is intended to be run from the frontend workspace and should hit
 * the backend through the CRA proxy (i.e., talk to the frontend origin, not the backend origin).
 *
 * Usage:
 *   node scripts/verify_api_proxy_e2e.mjs
 *
 * Optional env vars:
 *   E2E_FRONTEND_ORIGIN=http://localhost:3000
 *   E2E_BRAND_ID=1
 *   E2E_MODEL_ID=1
 *   E2E_PROBLEM_ID=1
 */

/* eslint-disable no-console */

const FRONTEND_ORIGIN = process.env.E2E_FRONTEND_ORIGIN || "http://localhost:3000";

const BRAND_ID = Number.parseInt(process.env.E2E_BRAND_ID || "1", 10);
const MODEL_ID = Number.parseInt(process.env.E2E_MODEL_ID || "1", 10);
const PROBLEM_ID = Number.parseInt(process.env.E2E_PROBLEM_ID || "1", 10);

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
async function run() {
  /** Run the end-to-end proxy verification workflow and print results to stdout. */
  const now = Date.now();
  const bookingBody = {
    customer_name: `E2E Test ${now}`,
    phone: "+15550001111",
    email: `e2e_${now}@example.com`,
    brand_id: BRAND_ID,
    model_id: MODEL_ID,
    problem_id: PROBLEM_ID,
    notes: "E2E proxy verification",
  };

  console.log(`[E2E] Frontend origin: ${FRONTEND_ORIGIN}`);
  console.log("[E2E] Creating booking via CRA proxy: POST /api/booking");
  console.log("[E2E] Request body:", bookingBody);

  const postRes = await fetch(`${FRONTEND_ORIGIN}/api/booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingBody),
  });

  const postText = await postRes.text();
  const postJson = safeJsonParse(postText);

  console.log(`[E2E] POST status: ${postRes.status}`);
  console.log("[E2E] POST response:", postJson ?? postText);

  if (!postRes.ok) {
    throw new Error(`POST /api/booking failed with status ${postRes.status}`);
  }

  const bookingId = postJson?.booking_id;
  if (!Number.isInteger(bookingId)) {
    throw new Error(`POST /api/booking did not return a valid booking_id. Got: ${postText}`);
  }

  console.log(`[E2E] Fetching tracking timeline: GET /api/track/${bookingId}`);

  const getRes = await fetch(`${FRONTEND_ORIGIN}/api/track/${bookingId}`);
  const getText = await getRes.text();
  const getJson = safeJsonParse(getText);

  console.log(`[E2E] GET status: ${getRes.status}`);
  console.log("[E2E] GET response:", getJson ?? getText);

  if (!getRes.ok) {
    throw new Error(`GET /api/track/${bookingId} failed with status ${getRes.status}`);
  }

  if (getJson?.booking_id !== bookingId) {
    throw new Error(
      `GET /api/track returned booking_id mismatch. Expected ${bookingId}, got ${getJson?.booking_id}`
    );
  }

  console.log("[E2E] ✅ Proxy E2E verification succeeded.");
}

run().catch((err) => {
  console.error("[E2E] ❌ Proxy E2E verification failed.");
  console.error(err?.stack || String(err));
  process.exit(1);
});
