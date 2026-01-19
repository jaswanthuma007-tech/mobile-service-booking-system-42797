import React from 'react';
import './landing.css';

function Badge({ title, desc, icon }) {
  return (
    <div className="lp-badge">
      <div className="lp-badge__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="lp-badge__body">
        <div className="lp-badge__title">{title}</div>
        <div className="lp-badge__desc">{desc}</div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function TrustBadges() {
  /** Trust badge grid used on the landing page. */
  return (
    <div className="lp-badges" aria-label="Trust badges">
      <Badge title="SSL Secure" desc="Encrypted booking & payments" icon="🔒" />
      <Badge title="Certified Technicians" desc="Background-verified experts" icon="🛠" />
      <Badge title="Genuine Parts" desc="Quality parts, warranty-backed" icon="✅" />
    </div>
  );
}
