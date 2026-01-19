import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Alert, Button, Card, Select, Stepper, TextArea, TextInput } from '../components/UI';
import { createBooking, getApiStatus, getBrands, getModels, getProblems } from '../api/client';

const steps = ['Personal', 'Brand', 'Model', 'Problem', 'Review'];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function isValidPhone(phone) {
  return String(phone).trim().length >= 5;
}

function formatDateTime(s) {
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString();
  } catch {
    return s;
  }
}

function toUserFacingError(e, fallback) {
  // Provide a clearer message for common fetch/network failures.
  const msg = e?.message ? String(e.message) : '';
  if (e?.name === 'AbortError') return '';
  if (e?.type === 'timeout' || /timed out/i.test(msg)) {
    return 'The server is taking too long to respond. Please try again.';
  }
  if (e?.type === 'network' || /Failed to fetch/i.test(msg) || /NetworkError/i.test(msg)) {
    return 'We couldn’t reach the booking server. Please check your connection and try again.';
  }
  return msg || fallback;
}

// PUBLIC_INTERFACE
export default function BookingFlow() {
  /** Customer booking multi-step flow; creates booking via POST /api/booking. */
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(0);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [problemId, setProblemId] = useState('');

  // API data
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [problems, setProblems] = useState([]);

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  // Keep error visible but avoid using it as a generic/loading signal.
  const [error, setError] = useState('');
  const [apiInfo, setApiInfo] = useState(() => getApiStatus());

  // Track whether brand was changed by the user (vs prefills) to avoid wiping prefills.
  const lastBrandIdRef = useRef('');

  // Apply prefills from landing/selection flow query params.
  // Supported params:
  // - name, phone, pincode (from landing page)
  // - brandId, modelId, problemId (from the 3-step selector /booking/steps)
  useEffect(() => {
    const qs = new URLSearchParams(location.search || '');
    const preName = qs.get('name') || '';
    const prePhone = qs.get('phone') || '';
    const prePincode = qs.get('pincode') || '';

    const preBrandId = qs.get('brandId') || '';
    const preModelId = qs.get('modelId') || '';
    const preProblemId = qs.get('problemId') || '';

    if (preName && !customerName) setCustomerName(preName);
    if (prePhone && !phone) setPhone(prePhone);

    // Prefill device selections if not already chosen.
    if (preBrandId && !brandId) setBrandId(String(preBrandId));
    if (preModelId && !modelId) setModelId(String(preModelId));
    if (preProblemId && !problemId) setProblemId(String(preProblemId));

    // Backend schema has no "pincode" field; store it in notes so it still reaches admin view.
    if (prePincode && !notes) {
      setNotes(`Pincode: ${prePincode}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load brands & problems on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError('');
      setLoadingBrands(true);
      setLoadingProblems(true);
      try {
        const [b, p] = await Promise.all([getBrands(), getProblems()]);
        if (cancelled) return;
        setBrands(b || []);
        setProblems(p || []);
      } catch (e) {
        if (cancelled) return;
        setError(toUserFacingError(e, 'Failed to load booking options.'));
      } finally {
        if (!cancelled) {
          setLoadingBrands(false);
          setLoadingProblems(false);
          window.setTimeout(() => setApiInfo(getApiStatus()), 0);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // When brand changes: load models; reset model selection ONLY if the brand changed (not initial mount).
  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      // Brand cleared: wipe dependent values.
      if (!brandId) {
        lastBrandIdRef.current = '';
        setModels([]);
        setModelId('');
        return;
      }

      // If the brand has actually changed, reset model selection so user cannot keep an invalid model.
      if (lastBrandIdRef.current && String(lastBrandIdRef.current) !== String(brandId)) {
        setModelId('');
      }
      lastBrandIdRef.current = String(brandId);

      setError('');
      setLoadingModels(true);
      try {
        const m = await getModels(Number(brandId));
        if (cancelled) return;
        setModels(m || []);
      } catch (e) {
        if (cancelled) return;
        setError(toUserFacingError(e, 'Failed to load models.'));
      } finally {
        if (!cancelled) {
          setLoadingModels(false);
          window.setTimeout(() => setApiInfo(getApiStatus()), 0);
        }
      }
    }

    loadModels();
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  // If model was selected and it doesn't belong to currently loaded models, clear it.
  useEffect(() => {
    if (!modelId) return;
    if ((models || []).some((m) => String(m.id) === String(modelId))) return;
    setModelId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.id, label: b.name })),
    [brands]
  );
  const modelOptions = useMemo(
    () => models.map((m) => ({ value: m.id, label: m.name })),
    [models]
  );
  const problemOptions = useMemo(
    () => problems.map((p) => ({ value: p.id, label: p.name })),
    [problems]
  );

  const selectedBrand = useMemo(
    () => brands.find((b) => String(b.id) === String(brandId)),
    [brands, brandId]
  );
  const selectedModel = useMemo(
    () => models.find((m) => String(m.id) === String(modelId)),
    [models, modelId]
  );
  const selectedProblem = useMemo(
    () => problems.find((p) => String(p.id) === String(problemId)),
    [problems, problemId]
  );

  const validation = useMemo(() => {
    const v = {};
    if (step === 0 || step === 4) {
      if (!customerName.trim()) v.customerName = 'Name is required.';
      if (!phone.trim()) v.phone = 'Phone is required.';
      else if (!isValidPhone(phone)) v.phone = 'Phone seems too short.';
      if (!email.trim()) v.email = 'Email is required.';
      else if (!isValidEmail(email)) v.email = 'Please enter a valid email.';
    }
    if (step === 1 || step === 4) {
      if (!brandId) v.brandId = 'Please select a brand.';
    }
    if (step === 2 || step === 4) {
      if (!modelId) v.modelId = 'Please select a model.';
    }
    if (step === 3 || step === 4) {
      if (!problemId) v.problemId = 'Please select a problem.';
    }
    return v;
  }, [step, customerName, phone, email, brandId, modelId, problemId]);

  function canGoNext() {
    if (step === 0) return !validation.customerName && !validation.phone && !validation.email;
    if (step === 1) return !validation.brandId;
    if (step === 2) return !validation.modelId;
    if (step === 3) return !validation.problemId;
    return true;
  }

  // Auto-advance on selections (per instruction).
  useEffect(() => {
    if (step === 1 && brandId) {
      // Advance immediately; models will load while on next step (with loading state).
      setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  useEffect(() => {
    if (step === 2 && modelId) {
      setStep(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  useEffect(() => {
    if (step === 3 && problemId) {
      setStep(4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  async function handleSubmit() {
    setError('');

    // Full validation on submit
    const allErrors = {
      ...(customerName.trim() ? {} : { customerName: 'Name is required.' }),
      ...(phone.trim() ? {} : { phone: 'Phone is required.' }),
      ...(email.trim() ? {} : { email: 'Email is required.' }),
      ...(!isValidEmail(email) ? { email: 'Please enter a valid email.' } : {}),
      ...(!isValidPhone(phone) ? { phone: 'Phone seems too short.' } : {}),
      ...(!brandId ? { brandId: 'Please select a brand.' } : {}),
      ...(!modelId ? { modelId: 'Please select a model.' } : {}),
      ...(!problemId ? { problemId: 'Please select a problem.' } : {})
    };

    if (Object.keys(allErrors).length > 0) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        brand_id: Number(brandId),
        model_id: Number(modelId),
        problem_id: Number(problemId),
        notes: notes.trim() ? notes.trim() : null
      };

      const res = await createBooking(payload);
      navigate('/booking/confirmation', {
        state: {
          bookingId: res.booking_id,
          summary: {
            customer_name: payload.customer_name,
            phone: payload.phone,
            email: payload.email,
            brand_name: selectedBrand?.name,
            model_name: selectedModel?.name,
            problem_name: selectedProblem?.name,
            notes: payload.notes,
            created_at: formatDateTime(new Date().toISOString())
          }
        }
      });
    } catch (e) {
      setError(toUserFacingError(e, 'Booking submission failed.'));
    } finally {
      setSubmitLoading(false);
      window.setTimeout(() => setApiInfo(getApiStatus()), 0);
    }
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
          Complete the steps below. Your booking will be confirmed instantly with a booking ID.
        </p>

        <Stepper steps={steps} currentIndex={step} />

        {apiInfo?.mockModeEnabled ? (
          <div style={{ marginBottom: 12 }}>
            <Alert variant="success" title="Using demo data">
              The booking server is unavailable right now, so we’re showing demo options. Submitting may not create a real booking.
            </Alert>
          </div>
        ) : null}

        {error ? (
          <div style={{ marginBottom: 12 }}>
            <Alert variant="error" title="Can’t complete request">
              <div style={{ lineHeight: 1.6 }}>
                <div>{error}</div>
                <div style={{ marginTop: 6, color: 'rgba(17, 24, 39, 0.72)' }}>
                  Tip: you can click Back and retry, or refresh the page.
                </div>
              </div>
            </Alert>
          </div>
        ) : null}

        {step === 0 ? (
          <div className="grid-2">
            <TextInput
              label="Full name"
              required
              value={customerName}
              onChange={setCustomerName}
              placeholder="e.g., Alex Johnson"
              error={validation.customerName}
            />
            <TextInput
              label="Phone"
              required
              value={phone}
              onChange={setPhone}
              placeholder="e.g., +1 555 123 4567"
              error={validation.phone}
            />
            <TextInput
              label="Email"
              required
              value={email}
              onChange={setEmail}
              placeholder="e.g., alex@example.com"
              type="email"
              error={validation.email}
            />
            <TextArea
              label="Notes (optional)"
              value={notes}
              onChange={setNotes}
              placeholder="Anything we should know? (symptoms, urgency, etc.)"
              error={null}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <Select
              label="Select brand"
              value={brandId}
              onChange={setBrandId}
              options={brandOptions}
              placeholder={loadingBrands ? 'Loading brands...' : 'Choose a brand'}
              disabled={loadingBrands}
              error={validation.brandId}
            />
            <p style={{ margin: 0, color: 'rgba(17, 24, 39, 0.62)' }}>
              {loadingBrands ? 'Fetching brands from server…' : 'Selecting a brand will take you to the next step.'}
            </p>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <Select
              label="Select model"
              value={modelId}
              onChange={setModelId}
              options={modelOptions}
              placeholder={
                !brandId
                  ? 'Select a brand first'
                  : loadingModels
                    ? 'Loading models...'
                    : 'Choose a model'
              }
              disabled={!brandId || loadingModels}
              error={validation.modelId}
            />
            {loadingModels ? (
              <p style={{ margin: '8px 0 0', color: 'rgba(17, 24, 39, 0.62)' }}>Fetching models from server…</p>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <Select
              label="Select problem"
              value={problemId}
              onChange={setProblemId}
              options={problemOptions}
              placeholder={loadingProblems ? 'Loading problems...' : 'Choose a problem'}
              disabled={loadingProblems}
              error={validation.problemId}
            />
            {loadingProblems ? (
              <p style={{ margin: '8px 0 0', color: 'rgba(17, 24, 39, 0.62)' }}>Fetching problems from server…</p>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <div className="grid-2">
              <div>
                <h3 style={{ marginTop: 0 }}>Personal</h3>
                <div style={{ color: 'rgba(17, 24, 39, 0.78)', lineHeight: 1.7 }}>
                  <div><strong>Name:</strong> {customerName || '—'}</div>
                  <div><strong>Phone:</strong> {phone || '—'}</div>
                  <div><strong>Email:</strong> {email || '—'}</div>
                </div>
              </div>
              <div>
                <h3 style={{ marginTop: 0 }}>Device</h3>
                <div style={{ color: 'rgba(17, 24, 39, 0.78)', lineHeight: 1.7 }}>
                  <div><strong>Brand:</strong> {selectedBrand?.name || '—'}</div>
                  <div><strong>Model:</strong> {selectedModel?.name || '—'}</div>
                  <div><strong>Problem:</strong> {selectedProblem?.name || '—'}</div>
                </div>
              </div>
            </div>

            {notes.trim() ? (
              <div style={{ marginTop: 10 }}>
                <h3>Notes</h3>
                <div style={{ color: 'rgba(17, 24, 39, 0.78)', whiteSpace: 'pre-wrap' }}>{notes}</div>
              </div>
            ) : null}

            {(validation.customerName || validation.phone || validation.email || validation.brandId || validation.modelId || validation.problemId) ? (
              <div style={{ marginTop: 12 }}>
                <Alert variant="error" title="Please review">
                  Some fields are missing or invalid. Use Back to fix them.
                </Alert>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <Alert variant="success" title="Ready to submit">
                  Click “Submit booking” to receive your booking ID.
                </Alert>
              </div>
            )}
          </div>
        ) : null}

        <div className="actions">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitLoading}
          >
            Back
          </Button>

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canGoNext() || submitLoading}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting…' : 'Submit booking'}
            </Button>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
