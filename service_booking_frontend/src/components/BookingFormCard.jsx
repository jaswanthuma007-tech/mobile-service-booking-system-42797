import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

function isValidName(name) {
  return String(name || '').trim().length > 0;
}

function isValidPhone(phone) {
  const s = String(phone || '').trim();
  return /^\+?\d{10,15}$/.test(s.replace(/\s+/g, ''));
}

function isValidPincode(pin) {
  const s = String(pin || '').trim();
  return /^\d{5,6}$/.test(s);
}

// PUBLIC_INTERFACE
export default function BookingFormCard() {
  /** Booking card on hero section; validates inputs and routes to /booking with prefills. */
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false, pincode: false });

  const errors = useMemo(() => {
    const e = {};
    if (!isValidName(name)) e.name = 'Name is required.';
    if (!phone.trim()) e.phone = 'Phone number is required.';
    else if (!isValidPhone(phone)) e.phone = 'Enter 10–15 digits (optionally starts with +).';
    if (!pincode.trim()) e.pincode = 'Pincode is required.';
    else if (!isValidPincode(pincode)) e.pincode = 'Pincode must be 5 or 6 digits.';
    return e;
  }, [name, phone, pincode]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  function submit(e) {
    e.preventDefault();
    setTouched({ name: true, phone: true, pincode: true });
    if (!canSubmit) return;

    const qs = new URLSearchParams({
      name: name.trim(),
      phone: phone.trim(),
      pincode: pincode.trim()
    }).toString();

    navigate(`/booking?${qs}`);
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
            className={`lp-input ${touched.name && errors.name ? 'lp-input--error' : ''}`}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
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
            className={`lp-input ${touched.phone && errors.phone ? 'lp-input--error' : ''}`}
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="e.g., +1 5551234567"
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
            className={`lp-input ${touched.pincode && errors.pincode ? 'lp-input--error' : ''}`}
            value={pincode}
            onChange={(ev) => setPincode(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, pincode: true }))}
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

        <button className="lp-btn lp-btn--primary lp-btn--full" type="submit" disabled={!canSubmit}>
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
