import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../components/landing.css';

// PUBLIC_INTERFACE
export default function StoreLocator() {
  /** Minimal Store Locator stub page; can be expanded with maps and store data later. */
  return (
    <div className="lp">
      <TopBar />
      <Header />
      <main className="lp__main">
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-section__head">
              <h1 className="lp-h1">Store locator</h1>
              <p className="lp-muted">
                We currently offer doorstep repair in many locations. Store locator is a stub in this version.
              </p>
            </div>

            <div className="lp-grid lp-grid--2">
              <div className="lp-card">
                <h2 className="lp-h3">Doorstep coverage</h2>
                <p className="lp-muted">
                  Enter your pincode during booking to confirm availability in your area.
                </p>
                <Link className="lp-btn lp-btn--primary" to="/">
                  Go to booking form
                </Link>
              </div>
              <div className="lp-card">
                <h2 className="lp-h3">Need help?</h2>
                <p className="lp-muted">
                  Use the live chat widget on the bottom-right or call us from the top bar.
                </p>
                <Link className="lp-btn lp-btn--ghost" to="/track-status">
                  Track status
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
