import React, { useEffect, useMemo, useRef, useState } from 'react';
import BookingFormCard from './BookingFormCard';
import './landing.css';

import { preloadImages, resolveDeviceImageUrl } from '../api/deviceImages';

const SLIDE_INTERVAL_MS = 4500;

// Local, always-available fallback SVG (inline data URI). We use this only if all CDN
// candidates fail AND we want to avoid broken-image icons.
// This is intentionally transparent/clean and contains no debug/checkerboard layers.
const FALLBACK_DEVICE_SVG_DATA_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="860" viewBox="0 0 420 860">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff69b4" stop-opacity="0.35"/>
          <stop offset="1" stop-color="#a855f7" stop-opacity="0.25"/>
        </linearGradient>
      </defs>
      <rect x="70" y="30" rx="56" ry="56" width="280" height="800" fill="rgba(7,16,31,0.12)" />
      <rect x="86" y="60" rx="42" ry="42" width="248" height="740" fill="url(#g)" />
      <rect x="166" y="46" rx="10" ry="10" width="88" height="10" fill="rgba(7,16,31,0.18)"/>
    </svg>`
  );

// PUBLIC_INTERFACE
export default function Hero() {
  /** Premium hero section: left headline/badges + right product image slider + booking card preserved. */

  const slides = useMemo(
    () => [
      {
        key: 'apple',
        alt: 'Apple iPhone device',
        // Use the provided transparent PNG fallback (the resolver will try primary first).
        fallbackSrc: 'https://www.gizmochina.com/wp-content/uploads/2022/09/iPhone-14-Pro-Front.png',
      },
      {
        key: 'samsung',
        alt: 'Samsung Galaxy device',
        fallbackSrc: 'https://www.gizmochina.com/wp-content/uploads/2023/02/Samsung-Galaxy-S23-Ultra-front.png',
      },
      {
        key: 'oneplus',
        alt: 'OnePlus device',
        fallbackSrc: 'https://www.gizmochina.com/wp-content/uploads/2023/01/OnePlus-11-front.png',
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
    // Robust fallback chain:
    // 1) slide fallback URL (usually the provided transparent PNG)
    // 2) global fallback URL
    // 3) inline transparent SVG (prevents broken-image icon/white box in worst case)
    //
    // Prevent infinite loops by only setting when different.
    const img = event.currentTarget;

    const urlFallback = activeSlide?.fallbackSrc || globalFallbackSrc;
    if (urlFallback && img.src !== urlFallback) {
      img.src = urlFallback;
      return;
    }

    if (img.src !== FALLBACK_DEVICE_SVG_DATA_URI) {
      img.src = FALLBACK_DEVICE_SVG_DATA_URI;
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
