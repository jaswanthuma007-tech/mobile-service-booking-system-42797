import React from 'react';
import { Link } from 'react-router-dom';
import SocialIcons from './SocialIcons';
import './landing.css';

// PUBLIC_INTERFACE
export default function Footer() {
  /** Dark footer with quick links, contact info, and social links. */
  return (
    <footer className="lp-footer" id="contact" aria-label="Footer">
      <div className="lp-container lp-footer__inner">
        <div className="lp-footer__col">
          <div className="lp-footer__brand">
            <div className="lp-footer__name">OceanFix</div>
            <div className="lp-footer__tag">Mobile Repair • Warranty-backed</div>
          </div>
          <p className="lp-footer__muted">
            Professional mobile repair services with fast response, genuine parts, and transparent pricing.
          </p>
          <SocialIcons variant="footer" />
        </div>

        <div className="lp-footer__col">
          <div className="lp-footer__title">Quick links</div>
          <div className="lp-footer__links">
            <Link className="lp-footer__link" to="/track-status">
              Track Status
            </Link>
            <a className="lp-footer__link" href="/#services">
              Services
            </a>
            <Link className="lp-footer__link" to="/store-locator">
              Store Locator
            </Link>
            <a className="lp-footer__link" href="/#brands">
              Brands
            </a>
            <Link className="lp-footer__link" to="/admin">
              Login
            </Link>
          </div>
        </div>

        <div className="lp-footer__col">
          <div className="lp-footer__title">Contact</div>
          <div className="lp-footer__muted">Phone: +1 (800) 123-4567</div>
          <div className="lp-footer__muted">Email: support@oceanfix.example</div>
          <div className="lp-footer__muted">Hours: Mon–Sat, 9 AM – 8 PM</div>

          <div className="lp-footer__cta">
            <a className="lp-btn lp-btn--small lp-btn--primary" href="/#book">
              Book Now
            </a>
            <Link className="lp-btn lp-btn--small lp-btn--ghost" to="/booking">
              Booking flow
            </Link>
          </div>
        </div>
      </div>

      <div className="lp-footer__bottom">
        <div className="lp-container lp-footer__bottomInner">
          <div>© {new Date().getFullYear()} OceanFix. All rights reserved.</div>
          <div className="lp-footer__bottomLinks" aria-label="Footer legal links">
            <a className="lp-footer__bottomLink" href="/#about">
              About
            </a>
            <a className="lp-footer__bottomLink" href="/#blog">
              Blog
            </a>
            <a className="lp-footer__bottomLink" href="/#contact">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
