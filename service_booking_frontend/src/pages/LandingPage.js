import React from 'react';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import Hero from '../components/Hero';
import TrustSocialProof from '../components/TrustSocialProof';
import ServicesGrid from '../components/ServicesGrid';
import BrandsGrid from '../components/BrandsGrid';
import Footer from '../components/Footer';
import LiveChatWidget from '../components/LiveChatWidget';

import '../components/landing.css';

// PUBLIC_INTERFACE
export default function LandingPage() {
  /** Commercial-style landing page for the mobile repair service. */
  return (
    <div className="lp">
      <a className="lp__skip" href="#main">
        Skip to content
      </a>

      <TopBar />
      <Header />

      <main id="main" className="lp__main">
        <Hero />
        <TrustSocialProof />
        <ServicesGrid />
        <BrandsGrid />

        <section className="lp-cta" aria-label="Book your repair call-to-action">
          <div className="lp-container lp-cta__inner">
            <div className="lp-cta__copy">
              <h2 className="lp-h2">Ready to fix your phone today?</h2>
              <p className="lp-muted">
                Same-day service available in most areas. Book now to get a confirmed slot and real-time updates.
              </p>
            </div>
            <div className="lp-cta__actions">
              <a className="lp-btn lp-btn--primary" href="#book">
                Book a repair
              </a>
              <a className="lp-btn lp-btn--ghost" href="/track-status">
                Track status
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
