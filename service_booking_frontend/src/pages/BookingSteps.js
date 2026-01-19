import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, Alert, Button, Card } from '../components/UI';
import './bookingSteps.css';
import { getBrands, getModels, getProblems } from '../api/client';

const STEPS = [
  { key: 'brand', label: 'Select Brand' },
  { key: 'model', label: 'Select Model' },
  { key: 'problem', label: 'Select Problem' }
];

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
 * Derive a nice-looking logo placeholder for a brand when we don't have real assets.
 * This keeps the UI consistent without adding binary assets to the repo.
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

  // Simple deterministic hash -> hue (0..359)
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return { initials: initials || '•', hue };
}

/**
 * Provide a clearer message for common fetch/network failures, avoiding generic "Failed to fetch".
 * @param {any} e
 * @param {string} fallback
 * @returns {string}
 */
function toUserFacingError(e, fallback) {
  const msg = e?.message ? String(e.message) : '';
  if (/Failed to fetch/i.test(msg) || /NetworkError/i.test(msg)) {
    return 'Unable to reach the booking server. Please check your connection and try again.';
  }
  return msg || fallback;
}

// PUBLIC_INTERFACE
export default function BookingSteps() {
  /** Single-page 3-step selection flow: Brand -> Model -> Service, then routes to existing BookingFlow with prefills. */
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [problems, setProblems] = useState([]);

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState('');

  const [brandSearch, setBrandSearch] = useState('');

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingProblems, setLoadingProblemsState] = useState(false);
  const [error, setError] = useState('');

  const brandRef = useRef(null);
  const modelRef = useRef(null);
  const problemRef = useRef(null);

  const selectedBrand = useMemo(
    () => brands.find((b) => String(b.id) === String(selectedBrandId)),
    [brands, selectedBrandId]
  );
  const selectedModel = useMemo(
    () => models.find((m) => String(m.id) === String(selectedModelId)),
    [models, selectedModelId]
  );
  const selectedProblem = useMemo(
    () => problems.find((p) => String(p.id) === String(selectedProblemId)),
    [problems, selectedProblemId]
  );

  const filteredBrands = useMemo(() => {
    const q = String(brandSearch || '').trim().toLowerCase();
    if (!q) return brands || [];
    return (brands || []).filter((b) => String(b.name || '').toLowerCase().includes(q));
  }, [brands, brandSearch]);

  const canGoNext = useMemo(() => {
    if (stepIndex === 0) return Boolean(selectedBrandId);
    if (stepIndex === 1) return Boolean(selectedModelId);
    if (stepIndex === 2) return Boolean(selectedProblemId);
    return false;
  }, [stepIndex, selectedBrandId, selectedModelId, selectedProblemId]);

  function scrollToStep(idx) {
    const el = idx === 0 ? brandRef.current : idx === 1 ? modelRef.current : problemRef.current;
    if (!el) return;

    // Smooth scroll + "slide" animation via CSS classes on the step panels.
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goToStep(idx) {
    const bounded = Math.max(0, Math.min(2, idx));
    setStepIndex(bounded);
    // Scroll after React applies state; requestAnimationFrame helps reduce jumpiness.
    window.requestAnimationFrame(() => scrollToStep(bounded));
  }

  // Initial load: brands
  useEffect(() => {
    let cancelled = false;
    async function loadBrands() {
      setError('');
      setLoadingBrands(true);
      try {
        const b = await getBrands();
        if (cancelled) return;
        setBrands(b || []);
      } catch (e) {
        if (cancelled) return;
        setError(toUserFacingError(e, 'Failed to load brands.'));
      } finally {
        if (!cancelled) setLoadingBrands(false);
      }
    }
    loadBrands();
    return () => {
      cancelled = true;
    };
  }, []);

  // When brand changes: fetch models; reset dependent selections.
  useEffect(() => {
    let cancelled = false;

    async function loadModelsForBrand() {
      setModels([]);
      setSelectedModelId('');
      setSelectedProblemId('');
      setProblems([]);

      if (!selectedBrandId) return;

      setError('');
      setLoadingModels(true);
      try {
        const m = await getModels(Number(selectedBrandId));
        if (cancelled) return;
        setModels(m || []);
      } catch (e) {
        if (cancelled) return;
        setError(toUserFacingError(e, 'Failed to load models.'));
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    }

    loadModelsForBrand();
    return () => {
      cancelled = true;
    };
  }, [selectedBrandId]);

  // When model changes: load problems; reset problem selection.
  useEffect(() => {
    let cancelled = false;

    async function loadProblemsForModel() {
      setSelectedProblemId('');
      setProblems([]);

      if (!selectedModelId) return;

      setError('');
      setLoadingProblemsState(true);
      try {
        const p = await getProblems();
        if (cancelled) return;
        setProblems(p || []);
      } catch (e) {
        if (cancelled) return;
        setError(toUserFacingError(e, 'Failed to load problems.'));
      } finally {
        if (!cancelled) setLoadingProblemsState(false);
      }
    }

    loadProblemsForModel();
    return () => {
      cancelled = true;
    };
  }, [selectedModelId]);

  function handleSelectBrand(id) {
    setSelectedBrandId(String(id));
    // Auto-advance to model step (models fetch will run in the background via effect)
    goToStep(1);
  }

  function handleSelectModel(id) {
    setSelectedModelId(String(id));
    // Auto-advance to service step
    goToStep(2);
  }

  function handleSelectProblem(id) {
    setSelectedProblemId(String(id));
  }

  function handleConfirm() {
    // Route into booking flow and prefill via query params.
    const qs = buildQuery({
      brandId: selectedBrandId,
      modelId: selectedModelId,
      problemId: selectedProblemId
    });

    navigate(`/booking${qs}`);
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
        <h2 style={{ marginTop: 0, letterSpacing: '-0.02em' }}>Book a service</h2>
        <p style={{ marginTop: 6, color: 'rgba(17, 24, 39, 0.70)', lineHeight: 1.55 }}>
          Choose your device and service in three quick steps.
        </p>

        {/* Simple progress indicator (3 steps) */}
        <div className="bf3-progress" aria-label="Booking progress">
          {STEPS.map((s, idx) => {
            const state = idx === stepIndex ? 'current' : idx < stepIndex ? 'done' : 'todo';
            return (
              <button
                key={s.key}
                type="button"
                className={`bf3-progress__step bf3-progress__step--${state}`}
                onClick={() => goToStep(idx)}
                aria-current={idx === stepIndex ? 'step' : undefined}
              >
                <span className="bf3-progress__dot" aria-hidden="true" />
                <span className="bf3-progress__label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <div style={{ marginBottom: 12 }}>
            <Alert variant="error" title="Something went wrong">
              {error}
            </Alert>
          </div>
        ) : null}

        {/* Panels */}
        <div className="bf3-panels">
          <section
            ref={brandRef}
            className={`bf3-panel ${stepIndex === 0 ? 'is-active' : ''}`}
            aria-label="Select brand"
          >
            <div className="bf3-panel__head">
              <h3 style={{ margin: 0 }}>1) Select Brand</h3>
              <p style={{ margin: '6px 0 0', color: 'rgba(17, 24, 39, 0.62)' }}>
                {loadingBrands ? 'Loading brands…' : 'Search and tap a brand to continue.'}
              </p>
            </div>

            <div className="bf3-brandSearch">
              <label className="bf3-inputLabel" htmlFor="brand-search">
                Search brands
              </label>
              <div className="bf3-inputWrap">
                <input
                  id="brand-search"
                  className="bf3-input"
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={loadingBrands ? 'Loading…' : 'Type e.g., Apple, Samsung…'}
                  disabled={loadingBrands}
                  autoComplete="off"
                />
                {brandSearch ? (
                  <button
                    type="button"
                    className="bf3-inputClear"
                    onClick={() => setBrandSearch('')}
                    aria-label="Clear brand search"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            </div>

            <div className="bf3-brandGrid" role="list" aria-label="Brand list">
              {loadingBrands ? (
                <div className="bf3-empty">Loading brands…</div>
              ) : filteredBrands.length === 0 ? (
                <div className="bf3-empty">No brands match your search.</div>
              ) : (
                filteredBrands.map((b) => {
                  const active = String(b.id) === String(selectedBrandId);
                  const { initials, hue } = deriveBrandMark(b.name);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`bf3-brandCard ${active ? 'is-selected' : ''}`}
                      onClick={() => handleSelectBrand(b.id)}
                      role="listitem"
                      aria-pressed={active}
                      disabled={loadingBrands}
                    >
                      <div
                        className="bf3-brandCard__logo"
                        aria-hidden="true"
                        style={{
                          background: `linear-gradient(180deg, hsla(${hue}, 90%, 56%, 0.18), rgba(255,255,255,0.90))`,
                          borderColor: `hsla(${hue}, 90%, 56%, 0.30)`
                        }}
                      >
                        <span className="bf3-brandCard__logoText">{initials}</span>
                      </div>

                      <div className="bf3-brandCard__body">
                        <div className="bf3-brandCard__name">{b.name}</div>
                        <div className="bf3-brandCard__meta">{active ? 'Selected' : 'Tap to select'}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section
            ref={modelRef}
            className={`bf3-panel ${stepIndex === 1 ? 'is-active' : ''}`}
            aria-label="Select model"
          >
            <div className="bf3-panel__head">
              <h3 style={{ margin: 0 }}>2) Select Model</h3>
              <p style={{ margin: '6px 0 0', color: 'rgba(17, 24, 39, 0.62)' }}>
                {selectedBrand ? (
                  <>
                    Brand: <strong>{selectedBrand.name}</strong>
                  </>
                ) : (
                  'Select a brand first.'
                )}
              </p>
            </div>

            <div className="bf3-grid" role="list">
              {!selectedBrandId ? (
                <div className="bf3-empty">Pick a brand to see models.</div>
              ) : loadingModels ? (
                <div className="bf3-empty">Loading models…</div>
              ) : (models || []).length === 0 ? (
                <div className="bf3-empty">No models available for this brand.</div>
              ) : (
                (models || []).map((m) => {
                  const active = String(m.id) === String(selectedModelId);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`bf3-choice ${active ? 'is-selected' : ''}`}
                      onClick={() => handleSelectModel(m.id)}
                      role="listitem"
                      aria-pressed={active}
                      disabled={!selectedBrandId || loadingModels}
                    >
                      <span className="bf3-choice__title">{m.name}</span>
                      <span className="bf3-choice__meta">{active ? 'Selected' : 'Select'}</span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section
            ref={problemRef}
            className={`bf3-panel ${stepIndex === 2 ? 'is-active' : ''}`}
            aria-label="Select problem"
          >
            <div className="bf3-panel__head">
              <h3 style={{ margin: 0 }}>3) Select Problem</h3>
              <p style={{ margin: '6px 0 0', color: 'rgba(17, 24, 39, 0.62)' }}>
                {selectedModel ? (
                  <>
                    Device: <strong>{selectedBrand?.name}</strong> / <strong>{selectedModel.name}</strong>
                  </>
                ) : (
                  'Select a model first.'
                )}
              </p>
            </div>

            <div className="bf3-grid" role="list">
              {!selectedModelId ? (
                <div className="bf3-empty">Pick a model to see problems.</div>
              ) : loadingProblems ? (
                <div className="bf3-empty">Loading problems…</div>
              ) : (problems || []).length === 0 ? (
                <div className="bf3-empty">No problems available.</div>
              ) : (
                (problems || []).map((p) => {
                  const active = String(p.id) === String(selectedProblemId);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`bf3-choice ${active ? 'is-selected' : ''}`}
                      onClick={() => handleSelectProblem(p.id)}
                      role="listitem"
                      aria-pressed={active}
                      disabled={!selectedModelId || loadingProblems}
                    >
                      <span className="bf3-choice__title">{p.name}</span>
                      <span className="bf3-choice__meta">{active ? 'Selected' : 'Select'}</span>
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
                  <strong>Model:</strong> {selectedModel?.name || '—'}
                </div>
                <div>
                  <strong>Problem:</strong> {selectedProblem?.name || '—'}
                </div>
              </div>

              <Button variant="primary" onClick={handleConfirm} disabled={!selectedProblemId}>
                Confirm Booking
              </Button>
            </div>
          </section>
        </div>

        {/* Back/Next navigation */}
        <div className="actions">
          <Button
            variant="ghost"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={stepIndex === 0}
          >
            Back
          </Button>

          <Button
            variant="primary"
            onClick={() => goToStep(stepIndex + 1)}
            disabled={!canGoNext || stepIndex === 2}
          >
            Next
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
