import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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

const NAV_ITEMS = [
  { label: 'Track Status', to: '/track-status' },
  { label: 'Services', to: '/#services', hashOnly: true, hash: '#services' },
  { label: 'Store Locator', to: '/store-locator' },
  { label: 'About Us', to: '/#about', hashOnly: true, hash: '#about' },
  { label: 'Contact Us', to: '/#contact', hashOnly: true, hash: '#contact' },
  { label: 'Blogs', to: '/#blog', hashOnly: true, hash: '#blog' }
];

// Keep this list curated and simple; can be wired to API later if desired.
const BRANDS = [
  { label: 'Apple', to: '/#brands', hashOnly: true, hash: '#brands' },
  { label: 'Samsung', to: '/#brands', hashOnly: true, hash: '#brands' },
  { label: 'Google', to: '/#brands', hashOnly: true, hash: '#brands' },
  { label: 'Xiaomi', to: '/#brands', hashOnly: true, hash: '#brands' },
  { label: 'OnePlus', to: '/#brands', hashOnly: true, hash: '#brands' }
];

function scrollToHash(hash) {
  const id = String(hash || '').replace('#', '');
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function onDown(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      handler(e);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [handler, ref]);
}

// PUBLIC_INTERFACE
export default function Header() {
  /** Premium sticky dark header with full navigation, Brands dropdown, and responsive hamburger menu. */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const brandsRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isOnHome = useMemo(() => location.pathname === '/', [location.pathname]);

  useOnClickOutside(brandsRef, () => setBrandsOpen(false));
  useOnClickOutside(profileRef, () => setProfileOpen(false));

  useEffect(() => {
    // Close menus on route change to avoid stale state.
    setMobileOpen(false);
    setBrandsOpen(false);
    setProfileOpen(false);
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
    setMobileOpen(false);
    setBrandsOpen(false);
    setProfileOpen(false);
  }

  function handleDropdownHashOrRoute(e, item) {
    if (item.hashOnly) return handleHashNav(e, item.hash);
    setMobileOpen(false);
    setBrandsOpen(false);
    setProfileOpen(false);
    return navigate(item.to);
  }

  return (
    <header className="lp-header lp-header--premium" role="navigation" aria-label="Primary">
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
          <NavLink className={({ isActive }) => `lp-nav__link ${isActive ? 'is-active' : ''}`} to="/track-status">
            Track Status
          </NavLink>

          <a className="lp-nav__link" href="#services" onClick={(e) => handleHashNav(e, '#services')}>
            Services
          </a>

          <NavLink className={({ isActive }) => `lp-nav__link ${isActive ? 'is-active' : ''}`} to="/store-locator">
            Store Locator
          </NavLink>

          <div className="lp-dd" ref={brandsRef}>
            <button
              className={`lp-nav__link lp-dd__trigger ${brandsOpen ? 'is-open' : ''}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={brandsOpen}
              onClick={() => setBrandsOpen((v) => !v)}
            >
              Brands <span className="lp-dd__chev" aria-hidden="true">▾</span>
            </button>

            <div className={`lp-dd__menu ${brandsOpen ? 'is-open' : ''}`} role="menu" aria-label="Brands menu">
              <a
                href="#brands"
                className="lp-dd__item"
                role="menuitem"
                onClick={(e) => handleHashNav(e, '#brands')}
              >
                Browse all brands
              </a>
              <div className="lp-dd__sep" role="separator" aria-hidden="true" />
              {BRANDS.map((b) => (
                <a
                  key={b.label}
                  href={b.hash || '#'}
                  className="lp-dd__item"
                  role="menuitem"
                  onClick={(e) => handleDropdownHashOrRoute(e, b)}
                >
                  {b.label}
                </a>
              ))}
            </div>
          </div>

          <a className="lp-nav__link" href="#about" onClick={(e) => handleHashNav(e, '#about')}>
            About Us
          </a>

          <a className="lp-nav__link" href="#contact" onClick={(e) => handleHashNav(e, '#contact')}>
            Contact Us
          </a>

          <a className="lp-nav__link" href="#blog" onClick={(e) => handleHashNav(e, '#blog')}>
            Blogs
          </a>

          <div className="lp-dd" ref={profileRef}>
            <button
              className={`lp-nav__link lp-dd__trigger ${profileOpen ? 'is-open' : ''}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((v) => !v)}
            >
              User Profile <span className="lp-dd__chev" aria-hidden="true">▾</span>
            </button>

            <div className={`lp-dd__menu ${profileOpen ? 'is-open' : ''}`} role="menu" aria-label="User menu">
              <NavLink className="lp-dd__item" role="menuitem" to="/profile">
                Profile
              </NavLink>
              <NavLink className="lp-dd__item" role="menuitem" to="/orders">
                My Bookings
              </NavLink>
              <div className="lp-dd__sep" role="separator" aria-hidden="true" />
              <NavLink className="lp-dd__item" role="menuitem" to="/admin">
                Admin Login
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="lp-header__actions">
          <Link className="lp-btn lp-btn--small lp-btn--primary" to="/booking" aria-label="Go to booking flow">
            Book Now
          </Link>

          <button
            className={`lp-burger ${mobileOpen ? 'is-open' : ''}`}
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((s) => !s)}
          >
            <span className="lp-burger__bar" />
            <span className="lp-burger__bar" />
            <span className="lp-burger__bar" />
          </button>
        </div>
      </div>

      <div className={`lp-mobileNav lp-mobileNav--overlay ${mobileOpen ? 'is-open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="lp-mobileNav__scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />
        <div className="lp-mobileNav__panel" role="dialog" aria-label="Mobile menu">
          <div className="lp-mobileNav__inner">
            <div className="lp-mobileNav__top">
              <div className="lp-mobileNav__title">Menu</div>
              <div className="lp-mobileNav__social">
                <SocialIcons variant="header" />
              </div>
            </div>

            <div className="lp-mobileNav__links" role="menu" aria-label="Mobile menu links">
              <NavLink className="lp-mobileNav__link" to="/track-status" role="menuitem" onClick={() => setMobileOpen(false)}>
                Track Status
              </NavLink>

              <a
                className="lp-mobileNav__link"
                href="#services"
                role="menuitem"
                onClick={(e) => handleHashNav(e, '#services')}
              >
                Services
              </a>

              <NavLink className="lp-mobileNav__link" to="/store-locator" role="menuitem" onClick={() => setMobileOpen(false)}>
                Store Locator
              </NavLink>

              <button
                className={`lp-mobileNav__link lp-mobileNav__ddBtn ${brandsOpen ? 'is-open' : ''}`}
                type="button"
                aria-expanded={brandsOpen}
                onClick={() => setBrandsOpen((v) => !v)}
              >
                Brands <span className="lp-dd__chev" aria-hidden="true">▾</span>
              </button>

              <div className={`lp-mobileNav__dd ${brandsOpen ? 'is-open' : ''}`} aria-label="Brands submenu">
                <a className="lp-mobileNav__subLink" href="#brands" onClick={(e) => handleHashNav(e, '#brands')}>
                  Browse all brands
                </a>
                {BRANDS.map((b) => (
                  <a
                    key={b.label}
                    className="lp-mobileNav__subLink"
                    href={b.hash || '#'}
                    onClick={(e) => handleDropdownHashOrRoute(e, b)}
                  >
                    {b.label}
                  </a>
                ))}
              </div>

              <a className="lp-mobileNav__link" href="#about" role="menuitem" onClick={(e) => handleHashNav(e, '#about')}>
                About Us
              </a>

              <a className="lp-mobileNav__link" href="#contact" role="menuitem" onClick={(e) => handleHashNav(e, '#contact')}>
                Contact Us
              </a>

              <a className="lp-mobileNav__link" href="#blog" role="menuitem" onClick={(e) => handleHashNav(e, '#blog')}>
                Blogs
              </a>

              <button
                className={`lp-mobileNav__link lp-mobileNav__ddBtn ${profileOpen ? 'is-open' : ''}`}
                type="button"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
              >
                User Profile <span className="lp-dd__chev" aria-hidden="true">▾</span>
              </button>

              <div className={`lp-mobileNav__dd ${profileOpen ? 'is-open' : ''}`} aria-label="User submenu">
                <NavLink className="lp-mobileNav__subLink" to="/profile" onClick={() => setMobileOpen(false)}>
                  Profile
                </NavLink>
                <NavLink className="lp-mobileNav__subLink" to="/orders" onClick={() => setMobileOpen(false)}>
                  My Bookings
                </NavLink>
                <NavLink className="lp-mobileNav__subLink" to="/admin" onClick={() => setMobileOpen(false)}>
                  Admin Login
                </NavLink>
              </div>
            </div>

            <div className="lp-mobileNav__cta">
              <Link className="lp-btn lp-btn--primary lp-btn--full" to="/booking" onClick={() => setMobileOpen(false)}>
                Start booking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
