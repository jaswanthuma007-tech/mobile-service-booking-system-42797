import React from 'react';
import { Link } from 'react-router-dom';
import './ui.css';

// PUBLIC_INTERFACE
export function AppShell({ title, children, rightSlot }) {
  /** App shell with top navigation and centered content. */
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="topbar__left">
            <Link className="brand" to="/">
              Mobile Service Booking
            </Link>
            <span className="brand__badge">Ocean Professional</span>
          </div>
          <div className="topbar__right">{rightSlot}</div>
        </div>
      </header>
      <main className="content">{children}</main>
      <footer className="footer">
        <div className="footer__inner">© {new Date().getFullYear()} Service Booking</div>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Card({ children }) {
  /** Simple card container with surface + shadow. */
  return <div className="card">{children}</div>;
}

// PUBLIC_INTERFACE
export function Button({ variant = 'primary', type = 'button', disabled, onClick, children }) {
  /** Button with theme variants. */
  return (
    <button
      type={type}
      className={`btn btn--${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// PUBLIC_INTERFACE
export function TextInput({ label, value, onChange, placeholder, type = 'text', error, required }) {
  /** Controlled text input with label + inline error. */
  return (
    <label className="field">
      <span className="field__label">
        {label} {required ? <span className="req">*</span> : null}
      </span>
      <input
        className={`input ${error ? 'input--error' : ''}`}
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}

// PUBLIC_INTERFACE
export function TextArea({ label, value, onChange, placeholder, error }) {
  /** Controlled textarea with label + inline error. */
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <textarea
        className={`textarea ${error ? 'input--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        aria-invalid={Boolean(error)}
      />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Select({ label, value, onChange, options, placeholder = 'Select...', error, disabled }) {
  /** Controlled select with options [{value,label}] */
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select
        className={`select ${error ? 'input--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Alert({ variant = 'info', title, children }) {
  /** Alert box for info/success/error messages. */
  return (
    <div className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {title ? <div className="alert__title">{title}</div> : null}
      <div className="alert__body">{children}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Stepper({ steps, currentIndex }) {
  /** Booking stepper UI. */
  return (
    <div className="stepper" aria-label="Booking steps">
      {steps.map((s, idx) => {
        const state = idx === currentIndex ? 'current' : idx < currentIndex ? 'done' : 'todo';
        return (
          <div key={s} className={`step step--${state}`}>
            <div className="step__dot" aria-hidden="true" />
            <div className="step__label">{s}</div>
          </div>
        );
      })}
    </div>
  );
}
