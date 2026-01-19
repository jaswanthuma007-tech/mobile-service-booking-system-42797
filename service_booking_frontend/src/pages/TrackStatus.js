import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiStatus, trackBooking } from '../api/client';
import { AppShell, Alert, Button, Card, TextInput } from '../components/UI';

const TIMELINE_STEPS = [
  { key: 'new', title: 'Booking Confirmed' },
  { key: 'pickup_scheduled', title: 'Pickup Scheduled' },
  { key: 'device_received', title: 'Device Received' },
  { key: 'in_progress', title: 'Repair In Progress' },
  { key: 'ready_for_delivery', title: 'Ready for Delivery' },
  { key: 'delivered', title: 'Delivered' }
];

function normalizeStatusToStepKey(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'completed') return 'delivered';
  if (s === 'cancelled') return 'cancelled';
  if (TIMELINE_STEPS.some((x) => x.key === s)) return s;
  // Legacy statuses: new / in_progress / completed / cancelled are supported by backend admin.
  if (s === 'new') return 'new';
  if (s === 'in_progress') return 'in_progress';
  return s || 'new';
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function computeProgressIndex(currentKey) {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === currentKey);
  return idx < 0 ? 0 : idx;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function timelineStyles() {
  // Inline styles so we don’t depend on template CSS changes.
  return {
    wrapper: {
      display: 'grid',
      gap: 14,
      marginTop: 16
    },
    progressBarOuter: {
      height: 10,
      borderRadius: 999,
      background: 'rgba(17, 24, 39, 0.10)',
      overflow: 'hidden'
    },
    progressBarInner: (pct) => ({
      height: 10,
      width: `${pct}%`,
      borderRadius: 999,
      background: 'linear-gradient(90deg, #2563EB 0%, #F59E0B 100%)',
      transition: 'width 500ms ease'
    }),
    stepRow: {
      display: 'grid',
      gridTemplateColumns: '18px 1fr',
      gap: 12,
      alignItems: 'start'
    },
    dot: (state) => {
      const base = {
        width: 14,
        height: 14,
        borderRadius: 999,
        marginTop: 2,
        transition: 'transform 250ms ease, background 250ms ease, border-color 250ms ease'
      };
      if (state === 'done') return { ...base, background: '#2563EB', transform: 'scale(1.0)' };
      if (state === 'active') return { ...base, background: '#F59E0B', transform: 'scale(1.1)' };
      return { ...base, background: 'rgba(17, 24, 39, 0.10)' };
    },
    stepTitle: (state) => ({
      fontWeight: state === 'active' ? 900 : 800,
      color: state === 'todo' ? 'rgba(17, 24, 39, 0.60)' : 'rgba(17, 24, 39, 0.92)',
      letterSpacing: '-0.01em'
    }),
    stepMeta: {
      color: 'rgba(17, 24, 39, 0.68)',
      fontSize: 13,
      marginTop: 4,
      lineHeight: 1.45
    }
  };
}

// PUBLIC_INTERFACE
export default function TrackStatus() {
  /** Booking tracking page: enter booking id, fetch tracking history, show progress + timeline. */
  const navigate = useNavigate();
  const location = useLocation();

  const initialBookingId = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return q.get('id') || '';
  }, [location.search]);

  const [bookingId, setBookingId] = useState(initialBookingId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackData, setTrackData] = useState(null);

  const apiStatus = useMemo(() => getApiStatus(), []);

  const canTrack = useMemo(() => /^\d{1,10}$/.test(String(bookingId || '').trim()), [bookingId]);

  const currentStepKey = useMemo(() => {
    if (!trackData?.current_status) return 'new';
    return normalizeStatusToStepKey(trackData.current_status);
  }, [trackData]);

  const progressIndex = useMemo(() => computeProgressIndex(currentStepKey), [currentStepKey]);

  const progressPercent = useMemo(() => {
    const denom = Math.max(1, TIMELINE_STEPS.length - 1);
    return clamp((progressIndex / denom) * 100, 0, 100);
  }, [progressIndex]);

  const eventByStepKey = useMemo(() => {
    const map = new Map();
    (trackData?.history || []).forEach((e) => {
      const k = normalizeStatusToStepKey(e.status);
      // Keep the last event for that status
      map.set(k, e);
    });
    return map;
  }, [trackData]);

  async function doTrack(idToTrack) {
    setError('');
    setLoading(true);
    setTrackData(null);
    try {
      const res = await trackBooking(idToTrack);
      setTrackData(res);
    } catch (e) {
      setError(e?.message || 'Failed to track booking.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialBookingId && /^\d{1,10}$/.test(initialBookingId)) {
      doTrack(initialBookingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styles = useMemo(() => timelineStyles(), []);

  return (
    <AppShell
      rightSlot={
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/booking">
            <Button variant="secondary">Book a repair</Button>
          </Link>
        </div>
      }
    >
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6, letterSpacing: '-0.02em' }}>Track your repair</h2>
            <div style={{ color: 'rgba(17, 24, 39, 0.70)' }}>
              Enter your booking ID to see live progress and timeline updates.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
          <TextInput
            label="Booking ID"
            value={bookingId}
            onChange={setBookingId}
            placeholder="e.g., 123"
          />
          <div style={{ alignSelf: 'end' }}>
            <Button
              variant="primary"
              disabled={!canTrack || loading}
              onClick={() => {
                const id = String(bookingId || '').trim();
                navigate(`/track-status?id=${encodeURIComponent(id)}`, { replace: true });
                doTrack(id);
              }}
            >
              {loading ? 'Tracking…' : 'Track'}
            </Button>
          </div>
        </div>

        {apiStatus?.autoMockFallbackEnabled ? (
          <div style={{ marginTop: 12 }}>
            <Alert variant="secondary" title="Live tracking temporarily unavailable">
              We couldn’t reach the backend API, so you’re seeing a fallback tracking response.
              <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(17, 24, 39, 0.75)' }}>
                API base: <code>{String(apiStatus.apiBase)}</code>
              </div>
            </Alert>
          </div>
        ) : null}

        {error ? (
          <div style={{ marginTop: 12 }}>
            <Alert variant="error" title="Could not track booking">
              {error}
            </Alert>
          </div>
        ) : null}

        {trackData ? (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                border: '1px solid rgba(17, 24, 39, 0.10)',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(245, 158, 11, 0.06) 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Booking #{trackData.booking_id}
                </div>
                <div style={{ color: 'rgba(17, 24, 39, 0.72)' }}>
                  Created: {formatDateTime(trackData.created_at)}
                </div>
              </div>

              <div style={{ marginTop: 10, color: 'rgba(17, 24, 39, 0.78)' }}>
                Current status:{' '}
                <span style={{ fontWeight: 900, color: 'rgba(17, 24, 39, 0.92)' }}>
                  {TIMELINE_STEPS.find((s) => s.key === currentStepKey)?.title || trackData.current_status}
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={styles.progressBarOuter}>
                  <div style={styles.progressBarInner(progressPercent)} />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(17, 24, 39, 0.62)' }}>
                  Progress: {Math.round(progressPercent)}%
                </div>
              </div>
            </div>

            <div style={styles.wrapper} aria-label="Booking tracking timeline">
              {TIMELINE_STEPS.map((step, idx) => {
                const state = idx < progressIndex ? 'done' : idx === progressIndex ? 'active' : 'todo';
                const ev = eventByStepKey.get(step.key);
                const meta = ev
                  ? `${formatDateTime(ev.timestamp)}${ev.description ? ` • ${ev.description}` : ''}`
                  : state === 'todo'
                    ? 'Pending'
                    : '—';

                return (
                  <div key={step.key} style={styles.stepRow}>
                    <div style={styles.dot(state)} aria-hidden="true" />
                    <div>
                      <div style={styles.stepTitle(state)}>{step.title}</div>
                      <div style={styles.stepMeta}>{meta}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : loading ? (
          <div style={{ marginTop: 14, color: 'rgba(17, 24, 39, 0.70)' }}>Loading tracking data…</div>
        ) : null}
      </Card>

      <div style={{ marginTop: 14, textAlign: 'center', color: 'rgba(17, 24, 39, 0.70)' }}>
        Need help? <Link to="/store-locator">Find a store</Link> or contact support.
      </div>
    </AppShell>
  );
}
