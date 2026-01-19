import React from 'react';
import './landing.css';

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Oppo', 'Vivo', 'Realme', 'Motorola', 'Nokia'];

function BrandPill({ name }) {
  return (
    <div className="lp-brandPill" role="listitem" aria-label={`Supported brand ${name}`}>
      <span className="lp-brandPill__dot" aria-hidden="true" />
      {name}
    </div>
  );
}

// PUBLIC_INTERFACE
export default function BrandsGrid() {
  /** Supported brands section. */
  return (
    <section className="lp-section lp-section--alt" aria-label="Supported brands" id="brands">
      <div className="lp-container">
        <div className="lp-section__head">
          <h2 className="lp-h2">Supported brands</h2>
          <p className="lp-muted">We service most major brands. If you don’t see yours, book anyway—we’ll confirm.</p>
        </div>

        <div className="lp-brands" role="list">
          {BRANDS.map((b) => (
            <BrandPill key={b} name={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
