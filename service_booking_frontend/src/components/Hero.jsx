import React, { useEffect, useMemo, useRef, useState } from 'react';
import BookingFormCard from './BookingFormCard';
import './landing.css';

import iphone15Png from '../assets/hero/iphone-15.png';
import galaxyS24UltraPng from '../assets/hero/galaxy-s24-ultra.png';
import pixel6ProPng from '../assets/hero/pixel-6-pro.png';

import { preloadImages, resolveDeviceImageUrl } from '../api/deviceImages';

const SLIDE_INTERVAL_MS = 4500;

// PUBLIC_INTERFACE
export default function Hero() {
  /** Premium hero section: left headline/badges + right product image slider + booking card preserved. */

  const slides = useMemo(
    () => [
      {
        key: 'apple',
        alt: 'Apple iPhone device',
        fallbackSrc: iphone15Png,
      },
      {
        key: 'samsung',
        alt: 'Samsung Galaxy device',
        fallbackSrc: galaxyS24UltraPng,
      },
      {
        key: 'google',
        alt: 'Google Pixel device',
        fallbackSrc: pixel6ProPng,
      },
    ],
    []
  );

  // Deterministic local fallback to avoid blank states if anything goes wrong.
  const globalFallbackSrc = slides[0]?.fallbackSrc;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [resolvedUrls, setResolvedUrls] = useState(() => {
    // Initialize with local fallbacks so the UI is instantly ready.
    const map = {};
    slides.forEach((s) => {
      map[s.key] = s.fallbackSrc;
    });
    return map;
  });

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

  useEffect(() => {
    // Preload local fallbacks once (always safe).
    preloadImages(slides.map((s) => s.fallbackSrc));
  }, [slides]);

  useEffect(() => {
    // Resolve remote images with caching (localStorage) + fallbacks.
    let cancelled = false;

    async function run() {
      const entries = await Promise.all(
        slides.map(async (s) => {
          const url = await resolveDeviceImageUrl({
            brandKey: s.key,
            fallbackSrc: s.fallbackSrc,
          });
          return [s.key, url];
        })
      );

      if (cancelled) return;

      const nextMap = {};
      entries.forEach(([k, v]) => {
        nextMap[k] = v;
      });
      setResolvedUrls(nextMap);

      // Best-effort preload resolved URLs too for smooth transitions.
      preloadImages(entries.map(([, v]) => v));
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [slides]);

  useEffect(() => {
    // Preload neighbor slides around the active index (helps when assets are large).
    const next = slides[(activeIndex + 1) % slides.length];
    const prev = slides[(activeIndex - 1 + slides.length) % slides.length];

    preloadImages([resolvedUrls?.[next?.key], resolvedUrls?.[prev?.key]].filter(Boolean));
  }, [activeIndex, slides, resolvedUrls]);

  const activeSlide = slides[activeIndex];
  const activeSrc = resolvedUrls?.[activeSlide.key] || activeSlide.fallbackSrc;

  const handleImgError = (event) => {
    // Robust fallback: if a remote image fails for any reason, swap to a known-good local asset.
    // Prevent infinite loops by only setting when different.
    const img = event.currentTarget;

    const localFallback = activeSlide?.fallbackSrc || globalFallbackSrc;
    if (localFallback && img.src !== localFallback) {
      img.src = localFallback;
    }
  };

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

        {/* Right: Image slider + booking card */}
        <div className="lp-hero__rightRail lp-anim lp-anim--up lp-anim--delay">
          <div
            className="lp-heroImageSlider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
            aria-label="Featured device images"
          >
            <div className="lp-heroImageSlider__bg" aria-hidden="true" />

            <div className="lp-heroImageSlider__viewport" aria-live="polite">
              <img
                key={activeSlide.key}
                className="lp-heroImageSlider__img"
                src={activeSrc}
                alt={activeSlide.alt}
                onError={handleImgError}
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
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
