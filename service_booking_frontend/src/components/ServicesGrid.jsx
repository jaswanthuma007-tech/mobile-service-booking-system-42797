import React from 'react';
import './landing.css';

const SERVICES = [
  { title: 'Screen Repair', desc: 'Cracked glass? Touch not working? We replace with quality parts.', icon: '📱' },
  { title: 'Battery Replacement', desc: 'Fast drain or swelling battery? Safe replacement in minutes.', icon: '🔋' },
  { title: 'Water Damage', desc: 'Liquid spill treatment with professional cleaning and diagnostics.', icon: '💧' },
  { title: 'Diagnostics', desc: 'Accurate diagnosis before repair. Clear pricing, no surprises.', icon: '🧪' },
  { title: 'Doorstep Service', desc: 'Technician comes to you. Convenient, quick, and reliable.', icon: '🏠' },
  { title: 'Speaker/Mic Fix', desc: 'Low volume, noisy audio, or mic issues—fixed by experts.', icon: '🎙️' }
];

function ServiceCard({ title, desc, icon }) {
  return (
    <div className="lp-card lp-serviceCard">
      <div className="lp-serviceCard__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="lp-serviceCard__title">{title}</div>
      <div className="lp-serviceCard__desc">{desc}</div>
      <a className="lp-link" href="#book">
        Book this service →
      </a>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function ServicesGrid() {
  /** Services section with production-like cards. */
  return (
    <section className="lp-section" aria-label="Services" id="services">
      <div className="lp-container">
        <div className="lp-section__head">
          <h2 className="lp-h2">Popular services</h2>
          <p className="lp-muted">From screens to batteries, we handle the most common repairs with warranty included.</p>
        </div>

        <div className="lp-grid lp-grid--3 lp-anim lp-anim--up">
          {SERVICES.map((s) => (
            <ServiceCard key={s.title} title={s.title} desc={s.desc} icon={s.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
