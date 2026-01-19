import React, { useEffect, useMemo, useRef, useState } from 'react';
import './landing.css';

function formatCompact(n) {
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    return String(n);
  }
}

// PUBLIC_INTERFACE
export default function Counter({ target, durationMs = 1200, suffix = '' }) {
  /** Animated counter that starts when visible (intersection observer). */
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [value, setValue] = useState(0);

  const display = useMemo(() => `${formatCompact(value)}${suffix}`, [value, suffix]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;

    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, durationMs]);

  return (
    <span ref={ref} className="lp-counter" aria-label={`Counter ${target}${suffix}`}>
      {display}
    </span>
  );
}
