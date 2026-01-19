import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

function isValidName(name) {
  return String(name || '').trim().length > 0;
}

/**
 * Strict UX validation: exactly 10 digits.
 * (We still allow users to type spaces/dashes; we validate against digits only.)
 */
function isValidPhone10(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return /^\d{10}$/.test(digits);
}

/** Strict UX validation: exactly 6 digits. */
function isValidPincode6(pin) {
  const digits = String(pin || '').replace(/\D/g, '');
  return /^\d{6}$/.test(digits);
}

// PUBLIC_INTERFACE
export default function BookingFormCard() {
  /** Booking card on hero section; validates inputs and routes to /booking with prefills. */
  const navigate = useNavigate();

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const pinRef = useRef(null);
  const bookBtnRef = useRef(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false, pincode: false });

  // Auto-focus first field when mounted (and when card is navigated to via anchor).
  useEffect(() => {
    const t = window.setTimeout(() => {
      nameRef.current?.focus?.();
    }, 50);
    return () => window.clearTimeout(t);
  }, []);

  const errors = useMemo(() => {
    const e = {};
    if (!isValidName(name)) e.name = 'Name is required.';

    if (!phone.trim()) e.phone = 'Phone number is required.';
    else if (!isValidPhone10(phone)) e.phone = 'Phone must be exactly 10 digits.';

    if (!pincode.trim()) e.pincode = 'Pincode is required.';
    else if (!isValidPincode6(pincode)) e.pincode = 'Pincode must be exactly 6 digits.';

    return e;
  }, [name, phone, pincode]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // Once pincode becomes valid, smoothly move focus to the Book Now button.
  useEffect(() => {
    if (!isValidPincode6(pincode)) return;

    const t = window.setTimeout(() => {
      bookBtnRef.current?.focus?.();
    }, 160); // small delay to allow the last keystroke repaint + transition
    return () => window.clearTimeout(t);
  }, [pincode]);

  function submit(e) {
    e.preventDefault();
    setTouched({ name: true, phone: true, pincode: true });
    if (!canSubmit) return;

    // For downstream flow, pass digits-only phone/pincode for consistency.
    const qs = new URLSearchParams({
      name: name.trim(),
      phone: String(phone).replace(/\D/g, ''),
      pincode: String(pincode).replace(/\D/g, '')
    }).toString();

    navigate(`/booking?${qs}`);
  }

  function focusWithMotion(el) {
    if (!el?.focus) return;
    // Use rAF to make focus transitions feel smoother on some browsers.
    window.requestAnimationFrame(() => el.focus());
  }

  function handleEnterToAdvance(e, nextEl, markTouchedKey) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (markTouchedKey) setTouched((t) => ({ ...t, [markTouchedKey]: true }));
    focusWithMotion(nextEl);
  }

  return (
    <div id="book" className="lp-card lp-card--form" aria-label="Booking form">
      <div className="lp-card__head">
        <div className="lp-card__eyebrow">Instant Booking</div>
        <h2 className="lp-h3">Book a repair</h2>
        <p className="lp-muted" style={{ marginTop: 6 }}>
          Share your details. We’ll confirm availability and guide you through the next steps.
        </p>
      </div>

      <form onSubmit={submit} noValidate>
        <label className="lp-field">
          <span className="lp-field__label">
            Name <span className="lp-req">*</span>
          </span>
          <input
            ref={nameRef}
            className={`lp-input lp-focusMotion ${touched.name && errors.name ? 'lp-input--error' : ''}`}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            onKeyDown={(e) => handleEnterToAdvance(e, phoneRef.current, 'name')}
            placeholder="e.g., Alex Johnson"
            autoComplete="name"
            aria-invalid={Boolean(touched.name && errors.name)}
          />
          {touched.name && errors.name ? <span className="lp-field__error">{errors.name}</span> : null}
        </label>

        <label className="lp-field">
          <span className="lp-field__label">
            Phone Number <span className="lp-req">*</span>
          </span>
          <input
            ref={phoneRef}
            className={`lp-input lp-focusMotion ${touched.phone && errors.phone ? 'lp-input--error' : ''}`}
            value={phone}
            onChange={(ev) => {
              // Keep as typed (allow spaces/dashes), but cap digits to 10 for better UX.
              const raw = ev.target.value;
              const digits = raw.replace(/\D/g, '').slice(0, 10);

              // Rebuild string in a simple readable format without being too opinionated.
              // If user is pasting, this ensures we don't exceed 10 digits.
              setPhone(digits);
              setTouched((t) => ({ ...t, phone: true })); // real-time validation feedback
            }}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            onKeyDown={(e) => handleEnterToAdvance(e, pinRef.current, 'phone')}
            placeholder="e.g., 9876543210"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(touched.phone && errors.phone)}
          />
          {touched.phone && errors.phone ? <span className="lp-field__error">{errors.phone}</span> : null}
        </label>

        <label className="lp-field">
          <span className="lp-field__label">
            Pincode <span className="lp-req">*</span>
          </span>
          <input
            ref={pinRef}
            className={`lp-input lp-focusMotion ${touched.pincode && errors.pincode ? 'lp-input--error' : ''}`}
            value={pincode}
            onChange={(ev) => {
              const digits = String(ev.target.value || '').replace(/\D/g, '').slice(0, 6);
              setPincode(digits);
              setTouched((t) => ({ ...t, pincode: true })); // real-time validation feedback
            }}
            onBlur={() => setTouched((t) => ({ ...t, pincode: true }))}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              setTouched((t) => ({ ...t, pincode: true }));
              if (isValidPincode6(pincode)) {
                focusWithMotion(bookBtnRef.current);
              }
            }}
            placeholder="e.g., 560001"
            inputMode="numeric"
            aria-invalid={Boolean(touched.pincode && errors.pincode)}
            aria-describedby="pincode-help"
          />
          <span id="pincode-help" className="lp-field__hint">
            We use this to confirm service availability in your area.
          </span>
          {touched.pincode && errors.pincode ? <span className="lp-field__error">{errors.pincode}</span> : null}
        </label>

        <button
          ref={bookBtnRef}
          className="lp-btn lp-btn--primary lp-btn--full lp-focusMotion"
          type="submit"
          disabled={!canSubmit}
        >
          Book Now
        </button>

        <div className="lp-card__trust" aria-label="Trust note">
          <div className="lp-miniTrust">
            <span className="lp-miniTrust__dot" aria-hidden="true" />
            Secure booking
          </div>
          <div className="lp-miniTrust">
            <span className="lp-miniTrust__dot" aria-hidden="true" />
            Transparent pricing
          </div>
          <div className="lp-miniTrust">
            <span className="lp-miniTrust__dot" aria-hidden="true" />
            Warranty included
          </div>
        </div>
      </form>
    </div>
  );
}
