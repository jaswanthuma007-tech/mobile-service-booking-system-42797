import React from 'react';
import './landing.css';

function Icon({ children, title }) {
  return (
    <span className="lp-social__icon" aria-hidden="true" title={title}>
      {children}
    </span>
  );
}

function SocialLink({ href, label, icon }) {
  return (
    <a className="lp-social__link" href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {icon}
    </a>
  );
}

// PUBLIC_INTERFACE
export default function SocialIcons({ variant = 'footer' }) {
  /** Social icon links for Facebook/Instagram/X/LinkedIn. */
  return (
    <div className={`lp-social lp-social--${variant}`}>
      <SocialLink
        href="https://facebook.com"
        label="Facebook"
        icon={
          <Icon title="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 8.5V7.2c0-1 .7-1.2 1.1-1.2H17V3h-2.6C12.1 3 11 4.6 11 7v1.5H9v3h2V21h3v-9.5h2.3l.4-3H14Z"
                fill="currentColor"
              />
            </svg>
          </Icon>
        }
      />
      <SocialLink
        href="https://instagram.com"
        label="Instagram"
        icon={
          <Icon title="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6ZM18 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-6 3a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
                fill="currentColor"
              />
            </svg>
          </Icon>
        }
      />
      <SocialLink
        href="https://x.com"
        label="Twitter / X"
        icon={
          <Icon title="X">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18.9 3H22l-6.8 7.8L23 21h-6.6l-5.2-6.7L5.4 21H2.2l7.4-8.5L1 3h6.8l4.7 6.1L18.9 3Zm-1.2 16h1.7L6.2 4.9H4.4L17.7 19Z"
                fill="currentColor"
              />
            </svg>
          </Icon>
        }
      />
      <SocialLink
        href="https://linkedin.com"
        label="LinkedIn"
        icon={
          <Icon title="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.5 6.6a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM4.6 21V8.4h3.8V21H4.6Zm6.2-12.6h3.6v1.7h.1c.5-1 1.7-2 3.6-2 3.9 0 4.6 2.5 4.6 5.8V21h-3.8v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21h-3.8V8.4Z"
                fill="currentColor"
              />
            </svg>
          </Icon>
        }
      />
    </div>
  );
}
