import React from 'react';
import BookingFormCard from './BookingFormCard';
import './landing.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1580915411954-282cb1c96b2b?auto=format&fit=crop&w=1200&q=80';

// PUBLIC_INTERFACE
export default function Hero() {
  /** Premium hero section: left value props + trust indicators, right glass booking card. */
  return (
    <section className="lp-hero" aria-label="Hero">
      <div className="lp-container lp-hero__inner">
        <div className="lp-hero__left lp-anim lp-anim--up">
          <div className="lp-hero__badge" aria-label="Highlights">
            <span className="lp-pill lp-pill--accent">Up to 6 months warranty</span>
            <span className="lp-pill lp-pill--muted">Doorstep service</span>
            <span className="lp-pill lp-pill--muted">Certified technicians</span>
          </div>

          <h1 className="lp-h1">
            Premium <span className="lp-accent">mobile repairs</span> — fast, safe, and at your doorstep.
          </h1>
          <p className="lp-hero__sub">
            A real, production-grade booking experience: transparent pricing, secure booking, and real-time repair status updates.
          </p>

          <div className="lp-hero__points" aria-label="Why choose us">
            <div className="lp-point">
              <div className="lp-point__dot" aria-hidden="true" />
              Same-day slots in most areas
            </div>
            <div className="lp-point">
              <div className="lp-point__dot" aria-hidden="true" />
              Genuine parts with warranty
            </div>
            <div className="lp-point">
              <div className="lp-point__dot" aria-hidden="true" />
              Secure, hassle-free booking
            </div>
          </div>

          <div className="lp-heroTrust" aria-label="Trust indicators">
            <div className="lp-heroTrust__item">
              <span className="lp-heroTrust__icon" aria-hidden="true">
                ★
              </span>
              4.8/5 rating
            </div>
            <div className="lp-heroTrust__item">
              <span className="lp-heroTrust__icon" aria-hidden="true">
                ✓
              </span>
              125k+ customers
            </div>
            <div className="lp-heroTrust__item">
              <span className="lp-heroTrust__icon" aria-hidden="true">
                🔒
              </span>
              Secure booking
            </div>
          </div>

          <div className="lp-hero__media" aria-hidden="true">
            <img className="lp-hero__image" src={HERO_IMAGE} alt="" loading="lazy" />
            <div className="lp-hero__glow lp-hero__glow--blue" />
            <div className="lp-hero__glow lp-hero__glow--amber" />
          </div>
        </div>

        <div className="lp-hero__right lp-anim lp-anim--up lp-anim--delay">
          <BookingFormCard />
        </div>
      </div>
    </section>
  );
}
