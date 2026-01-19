import React from 'react';
import SocialIcons from './SocialIcons';
import './landing.css';

// PUBLIC_INTERFACE
export default function TopBar() {
  /** Top utility bar with contact details and social icons. */
  return (
    <div className="lp-topbar" role="banner" aria-label="Contact details">
      <div className="lp-container lp-topbar__inner">
        <div className="lp-topbar__left">
          <a className="lp-topbar__link" href="tel:+18001234567" aria-label="Call us">
            <span className="lp-ico" aria-hidden="true">
              ☎
            </span>
            +1 (800) 123-4567
          </a>
          <a className="lp-topbar__link" href="mailto:support@oceanfix.example" aria-label="Email us">
            <span className="lp-ico" aria-hidden="true">
              ✉
            </span>
            support@oceanfix.example
          </a>
          <div className="lp-topbar__meta" aria-label="Working hours">
            <span className="lp-ico" aria-hidden="true">
              ⏱
            </span>
            Mon–Sat: 9:00 AM – 8:00 PM
          </div>
        </div>

        <div className="lp-topbar__right" aria-label="Social links">
          <SocialIcons variant="topbar" />
        </div>
      </div>
    </div>
  );
}
