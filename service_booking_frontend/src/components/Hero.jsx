import React, { useEffect, useMemo, useRef, useState } from 'react';
import BookingFormCard from './BookingFormCard';
import './landing.css';

/**
 * Note: Using remote images here to avoid adding binary assets. If you later add
 * curated device PNGs into /public/assets, replace these URLs with /assets/... paths.
 */

const SLIDE_INTERVAL_MS = 4500;

// PUBLIC_INTERFACE
export default function Hero() {
  /** Premium hero section with left device slider and right booking card. */
  const slides = useMemo(
    () => [
      {
        key: 'iphone',
        title: '6 Months Warranty on iPhone Displays',
        subtitle: 'Premium display replacement • Certified technicians • Doorstep service',
        imageUrl:
          'https://images.unsplash.com/photo-1510557880182-3fdac13b39c5?auto=format&fit=crop&w=1200&q=80',
        badge: 'iPhone',
      },
      {
        key: 'samsung',
        title: 'Super-fast Samsung Screen Repair',
        subtitle: 'Original-quality parts • Same-day slots • Safe & secure booking',
        imageUrl:
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80',
        badge: 'Samsung',
      },
      {
        key: 'oneplus',
        title: 'OnePlus Display & Battery Experts',
        subtitle: 'Transparent pricing • Warranty included • Doorstep pickup available',
        imageUrl:
          'https://images.unsplash.com/photo-1512499617640-c2f999018b72?auto=format&fit=crop&w=1200&q=80',
        badge: 'OnePlus',
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const activeSlide = slides[activeIndex];

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

  return (
    <section className="lp-hero lp-hero--slider" aria-label="Hero">
      <div className="lp-container lp-hero__inner">
        {/* Left: Slider */}
        <div className="lp-hero__left lp-anim lp-anim--up">
          <div
            className="lp-heroSlider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
            aria-label="Featured device repair offers"
          >
            <div className="lp-heroSlider__bg" aria-hidden="true" />

            <div className="lp-heroSlider__content">
              <div className="lp-heroSlider__top">
                <div className="lp-heroSlider__badgeRow" aria-label="Highlights">
                  <span className="lp-heroSlider__pill lp-heroSlider__pill--accent">{activeSlide.badge}</span>
                  <span className="lp-heroSlider__pill">Doorstep Service</span>
                  <span className="lp-heroSlider__pill">Certified Techs</span>
                </div>

                <h1 className="lp-heroSlider__title">{activeSlide.title}</h1>
                <p className="lp-heroSlider__sub">{activeSlide.subtitle}</p>
              </div>

              <div className="lp-heroSlider__media" aria-hidden="true">
                <img className="lp-heroSlider__image" src={activeSlide.imageUrl} alt="" loading="lazy" />
                <div className="lp-heroSlider__glow lp-heroSlider__glow--pink" />
                <div className="lp-heroSlider__glow lp-heroSlider__glow--blue" />
              </div>
            </div>

            <div className="lp-heroSlider__controls" aria-label="Slider controls">
              <button
                type="button"
                className="lp-heroSlider__arrow"
                onClick={goPrev}
                aria-label="Previous slide"
              >
                ‹
              </button>

              <div className="lp-heroSlider__dots" role="tablist" aria-label="Select a slide">
                {slides.map((s, idx) => (
                  <button
                    // eslint-disable-next-line react/no-array-index-key
                    key={s.key}
                    type="button"
                    className={`lp-heroSlider__dot ${idx === activeIndex ? 'is-active' : ''}`}
                    onClick={() => goTo(idx)}
                    role="tab"
                    aria-selected={idx === activeIndex}
                    aria-label={`Go to ${s.badge} slide`}
                  />
                ))}
              </div>

              <button type="button" className="lp-heroSlider__arrow" onClick={goNext} aria-label="Next slide">
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Right: Booking card (kept on the right) */}
        <div className="lp-hero__right lp-anim lp-anim--up lp-anim--delay">
          <BookingFormCard />
        </div>
      </div>
    </section>
  );
}
