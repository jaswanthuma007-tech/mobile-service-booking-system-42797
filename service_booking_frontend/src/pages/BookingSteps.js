import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, Alert, Button, Card } from '../components/UI';
import './bookingSteps.css';
import { getBrands, getModels, getServices } from '../api/client';

const STEPS = [
  { key: 'brand', label: 'Select Brand' },
  { key: 'model', label: 'Select Model' },
  { key: 'service', label: 'Select Service' }
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

// PUBLIC_INTERFACE
export default function BookingSteps() {
  /** Single-page 3-step selection flow: Brand -> Model -> Service, then routes to existing BookingFlow with prefills. */
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingServices, setLoadingServicesState] = useState(false);
  const [error, setError] = useState('');

  const brandRef = useRef(null);
  const modelRef = useRef(null);
  const serviceRef = useRef(null);

  const selectedBrand = useMemo(
    () => brands.find((b) => String(b.id) === String(selectedBrandId)),
    [brands, selectedBrandId]
  );
  const selectedModel = useMemo(
    () => models.find((m) => String(m.id) === String(selectedModelId)),
    [models, selectedModelId]
  );
  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === String(selectedServiceId)),
    [services, selectedServiceId]
  );

  const canGoNext = useMemo(() => {
    if (stepIndex === 0) return Boolean(selectedBrandId);
    if (stepIndex === 1) return Boolean(selectedModelId);
    if (stepIndex === 2) return Boolean(selectedServiceId);
    return false;
  }, [stepIndex, selectedBrandId, selectedModelId, selectedServiceId]);

  function scrollToStep(idx) {
    const el = idx === 0 ? brandRef.current : idx === 1 ? modelRef.current : serviceRef.current;
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
        setError(e?.message || 'Failed to load brands.');
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
      setSelectedServiceId('');
      setServices([]);

      if (!selectedBrandId) return;

      setError('');
      setLoadingModels(true);
      try {
        const m = await getModels(Number(selectedBrandId));
        if (cancelled) return;
        setModels(m || []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load models.');
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    }

    loadModelsForBrand();
    return () => {
      cancelled = true;
    };
  }, [selectedBrandId]);

  // When model changes: load services; reset service selection.
  useEffect(() => {
    let cancelled = false;

    async function loadServicesForModel() {
      setSelectedServiceId('');
      setServices([]);

      if (!selectedModelId) return;

      setError('');
      setLoadingServicesState(true);
      try {
        // Backend exposes a generic list; frontend can filter/label later if needed.
        const s = await getServices();
        if (cancelled) return;
        setServices(s || []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load services.');
      } finally {
        if (!cancelled) setLoadingServicesState(false);
      }
    }

    loadServicesForModel();
    return () => {
      cancelled = true;
    };
  }, [selectedModelId]);

  function handleSelectBrand(id) {
    setSelectedBrandId(String(id));
    // Auto-advance to model step
    goToStep(1);
  }

  function handleSelectModel(id) {
    setSelectedModelId(String(id));
    // Auto-advance to service step
    goToStep(2);
  }

  function handleSelectService(id) {
    setSelectedServiceId(String(id));
  }

  function handleConfirm() {
    // Route into existing customer details flow (BookingFlow) and prefill via query params.
    // BookingFlow currently understands name/phone/pincode; we extend it to accept brandId/modelId/problemId.
    const qs = buildQuery({
      brandId: selectedBrandId,
      modelId: selectedModelId,
      problemId: selectedServiceId
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
                {loadingBrands ? 'Loading brands…' : 'Tap a brand to continue.'}
              </p>
            </div>

            <div className="bf3-grid" role="list">
              {(brands || []).map((b) => {
                const active = String(b.id) === String(selectedBrandId);
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`bf3-choice ${active ? 'is-selected' : ''}`}
                    onClick={() => handleSelectBrand(b.id)}
                    role="listitem"
                    aria-pressed={active}
                    disabled={loadingBrands}
                  >
                    <span className="bf3-choice__title">{b.name}</span>
                    <span className="bf3-choice__meta">{active ? 'Selected' : 'Select'}</span>
                  </button>
                );
              })}
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
            ref={serviceRef}
            className={`bf3-panel ${stepIndex === 2 ? 'is-active' : ''}`}
            aria-label="Select service"
          >
            <div className="bf3-panel__head">
              <h3 style={{ margin: 0 }}>3) Select Service</h3>
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
                <div className="bf3-empty">Pick a model to see services.</div>
              ) : loadingServices ? (
                <div className="bf3-empty">Loading services…</div>
              ) : (services || []).length === 0 ? (
                <div className="bf3-empty">No services available.</div>
              ) : (
                (services || []).map((s) => {
                  const active = String(s.id) === String(selectedServiceId);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`bf3-choice ${active ? 'is-selected' : ''}`}
                      onClick={() => handleSelectService(s.id)}
                      role="listitem"
                      aria-pressed={active}
                      disabled={!selectedModelId || loadingServices}
                    >
                      <span className="bf3-choice__title">{s.name}</span>
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
                  <strong>Service:</strong> {selectedService?.name || '—'}
                </div>
              </div>

              <Button variant="primary" onClick={handleConfirm} disabled={!selectedServiceId}>
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
