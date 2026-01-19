import React, { useEffect, useMemo, useRef, useState } from 'react';
import BookingFormCard from './BookingFormCard';
import './landing.css';

const SLIDE_INTERVAL_MS = 4500;

/**
 * Note: Using remote images here to avoid adding binary assets. If you later add
 * curated device PNGs into /public/assets, replace these URLs with /assets/... paths.
 */

// PUBLIC_INTERFACE
export default function Hero() {
  /** Premium hero section: left headline/badges + right product image slider + booking card preserved. */
  const slides = useMemo(
    () => [
      {
        key: 'iphone-1',
        alt: 'iPhone in soft pink lighting',
        imageUrl:
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1400&q=80',
      },
      {
        key: 'iphone-2',
        alt: 'Close-up of a smartphone display',
        imageUrl:
          'https://images.unsplash.com/photo-1510557880182-3fdac13b39c5?auto=format&fit=crop&w=1400&q=80',
      },
      {
        key: 'iphone-3',
        alt: 'Premium smartphone on a desk',
        imageUrl:
          'https://images.unsplash.com/photo-1512499617640-c2f999018b72?auto=format&fit=crop&w=1400&q=80',
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const goTo = (index) => {
    const next = (index + slides.length) % slides.length;
    setActiveIndex(next);
  };

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  useEffect(() => {
    // Auto-slide, paused on hover/focus for better UX.
    if (isPaused) return undefined;

    intervalRef.current = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPaused, slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <section className="lp-hero lp-hero--slider" aria-label="Hero">
      <div className="lp-container lp-hero__inner lp-hero__inner--new">
        {/* Left: Text + badges */}
        <div className="lp-hero__copy lp-anim lp-anim--up">
          <div className="lp-hero__badgeRow" aria-label="Highlights">
            <span className="lp-hero__badge lp-hero__badge--hot">6 Months Warranty</span>
            <span className="lp-hero__badge">Doorstep Service</span>
            <span className="lp-hero__badge">Secure Booking</span>
          </div>

          <h1 className="lp-h1 lp-hero__headline">
            Premium iPhone repairs,
            <br />
            at your doorstep.
          </h1>

          <p className="lp-hero__subhead">
            Certified technicians, high-quality parts, and smooth pickup & delivery. Get your device fixed fast with
            transparent pricing.
          </p>

          <ul className="lp-hero__points" aria-label="Trust points">
            <li className="lp-hero__point">
              <span className="lp-hero__pointIco" aria-hidden="true">
                ✓
              </span>
              Same-day slots in most areas
            </li>
            <li className="lp-hero__point">
              <span className="lp-hero__pointIco" aria-hidden="true">
                ✓
              </span>
              100% genuine / original-quality parts
            </li>
            <li className="lp-hero__point">
              <span className="lp-hero__pointIco" aria-hidden="true">
                ✓
              </span>
              Trusted by thousands of customers
            </li>
          </ul>

          <div className="lp-inlineActions">
            <a className="lp-btn lp-btn--primary" href="#book">
              Book now
            </a>
            <a className="lp-btn lp-btn--ghost" href="/track">
              Track status
            </a>
          </div>
        </div>

        {/* Right: Image slider + booking card (booking card stays present) */}
        <div className="lp-hero__rightRail lp-anim lp-anim--up lp-anim--delay">
          <div
            className="lp-heroImageSlider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
            aria-label="Featured iPhone images"
          >
            <div className="lp-heroImageSlider__bg" aria-hidden="true" />

            <div className="lp-heroImageSlider__viewport" aria-live="polite">
              <img className="lp-heroImageSlider__img" src={activeSlide.imageUrl} alt={activeSlide.alt} loading="lazy" />
            </div>

            <div className="lp-heroImageSlider__controls" aria-label="Slider controls">
              <button type="button" className="lp-heroImageSlider__arrow" onClick={goPrev} aria-label="Previous slide">
                ‹
              </button>

              <div className="lp-heroImageSlider__dots" role="tablist" aria-label="Select a slide">
                {slides.map((s, idx) => (
                  <button
                    key={s.key}
                    type="button"
                    className={`lp-heroImageSlider__dot ${idx === activeIndex ? 'is-active' : ''}`}
                    onClick={() => goTo(idx)}
                    role="tab"
                    aria-selected={idx === activeIndex}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button type="button" className="lp-heroImageSlider__arrow" onClick={goNext} aria-label="Next slide">
                ›
              </button>
            </div>
          </div>

          <div className="lp-hero__bookingWrap" aria-label="Booking card">
            <BookingFormCard />
          </div>
        </div>
      </div>
    </section>
  );
}
