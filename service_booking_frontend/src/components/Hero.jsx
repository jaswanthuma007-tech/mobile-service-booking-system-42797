import React from 'react';
import BookingFormCard from './BookingFormCard';
import './landing.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1580915411954-282cb1c96b2b?auto=format&fit=crop&w=1200&q=80';

// PUBLIC_INTERFACE
export default function Hero() {
  /** Hero section with headline, value props, and booking form card. */
  return (
    <section className="lp-hero" aria-label="Hero">
      <div className="lp-container lp-hero__inner">
        <div className="lp-hero__left lp-anim lp-anim--up">
          <div className="lp-hero__badge">
            <span className="lp-pill lp-pill--accent">Upto 6 months warranty</span>
            <span className="lp-pill lp-pill--muted">Doorstep service</span>
            <span className="lp-pill lp-pill--muted">Genuine parts</span>
          </div>

          <h1 className="lp-h1">
            Fast, trusted <span className="lp-accent">mobile repairs</span> — at your doorstep.
          </h1>
          <p className="lp-hero__sub lp-muted">
            Book in seconds. Certified technicians, transparent pricing, and a smooth repair experience that feels truly
            commercial-grade.
          </p>

          <div className="lp-hero__points" aria-label="Value propositions">
            <div className="lp-point">
              <div className="lp-point__dot" aria-hidden="true" />
              Same-day slots in most areas
            </div>
            <div className="lp-point">
              <div className="lp-point__dot" aria-hidden="true" />
              Free diagnosis with repair
            </div>
            <div className="lp-point">
              <div className="lp-point__dot" aria-hidden="true" />
              Secure online booking
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
