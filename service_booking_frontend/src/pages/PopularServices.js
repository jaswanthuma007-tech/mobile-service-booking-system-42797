import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Alert, Button, Card } from '../components/UI';
import { getApiStatus, getBrands, getProblems } from '../api/client';
import './bookingSteps.css';

/**
 * Safely build query string from key-values (skips null/undefined/empty).
 * @param {Record<string, any>} params
 * @returns {string}
 */
function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/**
 * Provide a clearer message for common fetch/network failures.
 * @param {any} e
 * @param {string} fallback
 * @returns {string}
 */
function toUserFacingError(e, fallback) {
  const msg = e?.message ? String(e.message) : '';
  if (e?.name === 'AbortError') return '';
  return msg || fallback;
}

/**
 * Deterministic brand mark (no binary assets required).
 * @param {string} brandName
 * @returns {{ initials: string, hue: number }}
 */
function deriveBrandMark(brandName) {
  const name = String(brandName || '').trim();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return { initials: initials || '•', hue };
}

/**
 * Curate service ordering and a few brand-specific “popular” picks.
 * We map backend problems to “services”.
 *
 * @param {string} brandName
 * @param {Array<{id:number,name:string}>} problems
 * @returns {Array<{id:number,name:string,tag:string,eta:string,priceNote:string}>}
 */
function buildBrandServices(brandName, problems) {
  const bn = String(brandName || '').toLowerCase();

  // Generic “popular” ranking by keyword; brand can slightly bias.
  const preferred = [
    { key: /screen/i, tag: 'Best seller' },
    { key: /battery/i, tag: 'Fast fix' },
    { key: /charging|port/i, tag: 'Common issue' },
    { key: /water/i, tag: 'Special care' },
    { key: /speaker|microphone|mic/i, tag: 'Audio' }
  ];

  // Apple/Samsung bias: show screen/battery/charging first.
  if (bn.includes('apple') || bn.includes('iphone') || bn.includes('samsung') || bn.includes('galaxy')) {
    preferred.unshift({ key: /diagnos/i, tag: 'Checkup' });
  }

  const normalized = (problems || []).map((p) => {
    const match = preferred.find((r) => r.key.test(String(p.name || '')));
    const tag = match?.tag || 'Popular';
    return {
      id: p.id,
      name: p.name,
      tag,
      eta: match?.tag === 'Special care' ? '2–4 hrs' : '45–90 mins',
      priceNote: 'Transparent pricing'
    };
  });

  // Sort by preferred keyword order first, then alpha.
  const rank = (name) => {
    const idx = preferred.findIndex((r) => r.key.test(String(name || '')));
    return idx === -1 ? 999 : idx;
  };

  return normalized.sort((a, b) => {
    const ra = rank(a.name);
    const rb = rank(b.name);
    if (ra !== rb) return ra - rb;
    return String(a.name).localeCompare(String(b.name));
  });
}

// PUBLIC_INTERFACE
export default function PopularServices() {
  /** Popular Services page: shows dynamic service cards for a selected brand, then routes into BookingFlow with prefills. */
  const navigate = useNavigate();
  const location = useLocation();

  const qs = useMemo(() => new URLSearchParams(location.search || ''), [location.search]);

  const brandId = qs.get('brandId') || '';
  const initialSelectedServiceId = qs.get('problemId') || '';
  const restoreSearch = qs.get('q') || '';

  const [brands, setBrands] = useState([]);
  const [problems, setProblems] = useState([]);

  const [serviceSearch, setServiceSearch] = useState(restoreSearch);
  const [selectedProblemId, setSelectedProblemId] = useState(initialSelectedServiceId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiInfo, setApiInfo] = useState(() => getApiStatus());

  const selectedBrand = useMemo(
    () => (brands || []).find((b) => String(b.id) === String(brandId)),
    [brands, brandId]
  );

  const brandMark = useMemo(() => deriveBrandMark(selectedBrand?.name || 'Brand'), [selectedBrand?.name]);

  const services = useMemo(() => buildBrandServices(selectedBrand?.name || '', problems), [selectedBrand?.name, problems]);

  const filteredServices = useMemo(() => {
    const q = String(serviceSearch || '').trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => String(s.name || '').toLowerCase().includes(q));
  }, [services, serviceSearch]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // If user lands here without a brand, send them back to brand selection.
      if (!brandId) {
        navigate('/booking/steps', { replace: true });
        return;
      }

      setError('');
      setLoading(true);
      try {
        const [b, p] = await Promise.all([getBrands(), getProblems()]);
        if (cancelled) return;
        setBrands(b || []);
        setProblems(p || []);
      } catch (e) {
        if (cancelled) return;
        setError(toUserFacingError(e, 'We couldn’t load services right now. Please try again.'));
      } finally {
        if (!cancelled) {
          setLoading(false);
          window.setTimeout(() => setApiInfo(getApiStatus()), 0);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [brandId, navigate]);

  function handleBackToBrands() {
    // Preserve search/service selection so returning forward keeps state.
    const backQs = buildQuery({
      brandId,
      problemId: selectedProblemId,
      q: serviceSearch
    });
    navigate(`/booking/steps${backQs}`);
  }

  function handleContinue() {
    const forwardQs = buildQuery({
      brandId,
      problemId: selectedProblemId
    });
    // Route into existing booking flow with prefills.
    navigate(`/booking${forwardQs}`);
  }

  return (
    <AppShell
      rightSlot={
        <Button variant="ghost" onClick={() => navigate('/')}>
          Home
        </Button>
      }
    >
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ marginTop: 0, letterSpacing: '-0.02em' }}>Popular Services</h2>
            <p style={{ marginTop: 6, color: 'rgba(17, 24, 39, 0.70)', lineHeight: 1.55 }}>
              Choose a service for <strong>{selectedBrand?.name || 'your device'}</strong>.
            </p>
          </div>

          <div
            aria-hidden="true"
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid rgba(17,24,39,0.12)',
              background: `linear-gradient(180deg, hsla(${brandMark.hue}, 90%, 56%, 0.14), rgba(255,255,255,0.92))`
            }}
          >
            <span style={{ fontWeight: 950, letterSpacing: '-0.04em', color: 'rgba(17,24,39,0.78)', fontSize: 18 }}>
              {brandMark.initials}
            </span>
          </div>
        </div>

        {apiInfo?.mockModeEnabled ? (
          <div style={{ marginBottom: 12 }}>
            <Alert variant="success" title="Using demo data">
              The booking server is unavailable right now, so we’re showing demo options.
            </Alert>
          </div>
        ) : null}

        {error ? (
          <div style={{ marginBottom: 12 }}>
            <Alert variant="error" title="Can’t load services">
              {error}
            </Alert>
          </div>
        ) : null}

        <div className="bf3-brandSearch" style={{ marginTop: 14 }}>
          <label className="bf3-inputLabel" htmlFor="service-search">
            Search services
          </label>
          <div className="bf3-inputWrap">
            <input
              id="service-search"
              className="bf3-input"
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder={loading ? 'Loading…' : 'Type e.g., screen, battery…'}
              disabled={loading}
              autoComplete="off"
            />
            {serviceSearch ? (
              <button
                type="button"
                className="bf3-inputClear"
                onClick={() => setServiceSearch('')}
                aria-label="Clear service search"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <div className="bf3-serviceGrid" role="list" aria-label="Service list">
          {loading ? (
            <div className="bf3-empty">Loading services…</div>
          ) : filteredServices.length === 0 ? (
            <div className="bf3-empty">No services match your search.</div>
          ) : (
            filteredServices.map((s) => {
              const active = String(s.id) === String(selectedProblemId);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`bf3-serviceCard ${active ? 'is-selected' : ''}`}
                  onClick={() => setSelectedProblemId(String(s.id))}
                  role="listitem"
                  aria-pressed={active}
                >
                  <div className="bf3-serviceCard__head">
                    <div className="bf3-serviceCard__title">{s.name}</div>
                    <div className="bf3-serviceCard__tag">{s.tag}</div>
                  </div>
                  <div className="bf3-serviceCard__meta">
                    <span>
                      <strong>ETA:</strong> {s.eta}
                    </span>
                    <span>
                      <strong>Pricing:</strong> {s.priceNote}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="bf3-confirm">
          <div className="bf3-confirm__summary" aria-label="Selection summary">
            <div>
              <strong>Brand:</strong> {selectedBrand?.name || '—'}
            </div>
            <div>
              <strong>Service:</strong>{' '}
              {(services || []).find((x) => String(x.id) === String(selectedProblemId))?.name || '—'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="ghost" onClick={handleBackToBrands}>
              Back
            </Button>
            <Button variant="primary" onClick={handleContinue} disabled={!selectedProblemId}>
              Continue
            </Button>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
