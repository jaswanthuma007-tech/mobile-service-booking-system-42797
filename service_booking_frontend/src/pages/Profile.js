import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import '../components/landing.css';

// PUBLIC_INTERFACE
export default function Profile() {
  /** Stub user profile page to support header navigation. */
  return (
    <div className="lp">
      <TopBar />
      <Header />

      <main className="lp__main" id="main">
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-card">
              <h1 className="lp-h2" style={{ marginTop: 0 }}>
                User Profile
              </h1>
              <p className="lp-muted">
                This is a placeholder profile page. You can extend this later with authentication and account details.
              </p>

              <div className="lp-inlineActions">
                <Link className="lp-btn lp-btn--primary" to="/orders">
                  View my bookings
                </Link>
                <Link className="lp-btn lp-btn--ghost" to="/">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
