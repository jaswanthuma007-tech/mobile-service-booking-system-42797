import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import SocialIcons from './SocialIcons';
import './landing.css';

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect x="8" y="6" width="32" height="36" rx="8" fill="url(#g1)" opacity="0.95" />
      <rect x="14" y="12" width="20" height="24" rx="4" fill="rgba(17,24,39,0.18)" />
      <circle cx="24" cy="35" r="2" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

const NAV = [
  { label: 'Track Status', to: '/track-status' },
  { label: 'Services', to: '/#services', hashOnly: true, hash: '#services' },
  { label: 'Store Locator', to: '/store-locator' },
  { label: 'Brands', to: '/#brands', hashOnly: true, hash: '#brands' },
  { label: 'About Us', to: '/#about', hashOnly: true, hash: '#about' },
  { label: 'Contact', to: '/#contact', hashOnly: true, hash: '#contact' },
  { label: 'Blog', to: '/#blog', hashOnly: true, hash: '#blog' },
  { label: 'Login', to: '/admin' }
];

function scrollToHash(hash) {
  const id = String(hash || '').replace('#', '');
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// PUBLIC_INTERFACE
export default function Header() {
  /** Sticky dark header with primary navigation and responsive hamburger menu. */
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isOnHome = useMemo(() => location.pathname === '/', [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOnHome && location.hash) {
      // Smooth-scroll to section when hash exists.
      scrollToHash(location.hash);
    }
  }, [isOnHome, location.hash]);

  function handleHashNav(e, hash) {
    if (!hash) return;
    if (!isOnHome) return; // let routing happen (to "/#...")
    e.preventDefault();
    scrollToHash(hash);
    setOpen(false);
  }

  return (
    <header className="lp-header" role="navigation" aria-label="Primary">
      <div className="lp-container lp-header__inner">
        <Link className="lp-brand" to="/" aria-label="OceanFix home">
          <span className="lp-brand__logo">
            <LogoMark />
          </span>
          <span className="lp-brand__text">
            <span className="lp-brand__name">OceanFix</span>
            <span className="lp-brand__tag">Mobile Repair</span>
          </span>
        </Link>

        <nav className="lp-nav" aria-label="Main menu">
          {NAV.map((item) => {
            if (item.hashOnly) {
              return (
                <a
                  key={item.label}
                  className="lp-nav__link"
                  href={item.hash}
                  onClick={(e) => handleHashNav(e, item.hash)}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <NavLink
                key={item.label}
                className={({ isActive }) => `lp-nav__link ${isActive ? 'is-active' : ''}`}
                to={item.to}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="lp-header__actions">
          <Link className="lp-btn lp-btn--small lp-btn--primary" to="/booking" aria-label="Go to booking flow">
            Book Now
          </Link>

          <button
            className="lp-burger"
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
          >
            <span className="lp-burger__bar" />
            <span className="lp-burger__bar" />
            <span className="lp-burger__bar" />
          </button>
        </div>
      </div>

      <div className={`lp-mobileNav ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="lp-mobileNav__inner">
          <div className="lp-mobileNav__top">
            <div className="lp-mobileNav__title">Menu</div>
            <div className="lp-mobileNav__social">
              <SocialIcons variant="header" />
            </div>
          </div>

          <div className="lp-mobileNav__links" role="menu" aria-label="Mobile menu links">
            {NAV.map((item) => {
              if (item.hashOnly) {
                return (
                  <a
                    key={item.label}
                    className="lp-mobileNav__link"
                    href={item.hash}
                    onClick={(e) => handleHashNav(e, item.hash)}
                    role="menuitem"
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <NavLink
                  key={item.label}
                  className="lp-mobileNav__link"
                  to={item.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="lp-mobileNav__cta">
            <Link className="lp-btn lp-btn--primary lp-btn--full" to="/booking" onClick={() => setOpen(false)}>
              Start booking
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
