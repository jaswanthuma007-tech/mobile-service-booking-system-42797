import React from 'react';
import TrustBadges from './TrustBadges';
import Counter from './Counter';
import './landing.css';

function Stars({ value = 4.8 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className="lp-stars" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const state = idx <= full ? 'full' : half && idx === full + 1 ? 'half' : 'empty';
        return <span key={idx} className={`lp-star lp-star--${state}`} aria-hidden="true" />;
      })}
      <span className="lp-stars__text">
        <strong>{value.toFixed(1)}</strong>/5
      </span>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function TrustSocialProof() {
  /** Trust badges + rating + animated counters section under hero. */
  return (
    <section className="lp-section lp-section--tight" aria-label="Trust and social proof">
      <div className="lp-container">
        <div className="lp-proof lp-anim lp-anim--up">
          <TrustBadges />

          <div className="lp-proof__rating">
            <div className="lp-proof__label">Verified customer rating</div>
            <Stars value={4.8} />
            <div className="lp-muted">4.8/5 from 12k+ reviews</div>
          </div>

          <div className="lp-proof__counters" aria-label="Live customer counters">
            <div className="lp-counterCard">
              <div className="lp-counterCard__value">
                <Counter target={125000} suffix="+" />
              </div>
              <div className="lp-counterCard__label">Customers served</div>
            </div>

            <div className="lp-counterCard">
              <div className="lp-counterCard__value">
                <Counter target={9800} suffix="+" />
              </div>
              <div className="lp-counterCard__label">5-star reviews</div>
            </div>

            <div className="lp-counterCard">
              <div className="lp-counterCard__value">
                <Counter target={60} suffix=" min" />
              </div>
              <div className="lp-counterCard__label">Avg. response time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
