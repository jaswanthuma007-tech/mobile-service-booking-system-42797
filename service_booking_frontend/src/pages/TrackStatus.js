import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../components/landing.css';

// PUBLIC_INTERFACE
export default function TrackStatus() {
  /** Minimal Track Status stub page; can be wired to backend booking lookup in a future iteration. */
  const [bookingId, setBookingId] = useState('');

  const helper = useMemo(() => {
    if (!bookingId.trim()) return '';
    if (!/^\d{1,10}$/.test(bookingId.trim())) return 'Enter a numeric booking ID (e.g., 12345).';
    return 'Tracking is a stub in this version — please contact support for updates.';
  }, [bookingId]);

  return (
    <div className="lp">
      <TopBar />
      <Header />
      <main className="lp__main">
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-section__head">
              <h1 className="lp-h1">Track repair status</h1>
              <p className="lp-muted">
                Enter your booking ID to view progress. (Demo stub: no backend tracking wired yet.)
              </p>
            </div>

            <div className="lp-card" style={{ maxWidth: 520 }}>
              <label className="lp-field">
                <span className="lp-field__label">Booking ID</span>
                <input
                  className="lp-input"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="e.g., 10234"
                  inputMode="numeric"
                />
              </label>

              {helper ? <div className="lp-field__hint">{helper}</div> : null}

              <div className="lp-inlineActions">
                <Link className="lp-btn lp-btn--ghost" to="/">
                  Back to home
                </Link>
                <Link className="lp-btn lp-btn--primary" to="/booking">
                  Book a new repair
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
