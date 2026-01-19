import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell, Card, Button } from '../components/UI';

// PUBLIC_INTERFACE
export default function Home() {
  /** Legacy landing page (kept for reference); the commercial landing is now at '/'. */
  return (
    <AppShell
      rightSlot={
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/booking">
            <Button variant="primary">Book service</Button>
          </Link>
          <Link to="/admin">
            <Button variant="secondary">Admin</Button>
          </Link>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, alignItems: 'start' }}>
        <Card>
          <h1 style={{ margin: 0, letterSpacing: '-0.03em' }}>Fast, friendly mobile repair booking</h1>
          <p style={{ color: 'rgba(17, 24, 39, 0.70)', lineHeight: 1.6 }}>
            This is the legacy home page. The new commercial landing experience is now available at{' '}
            <Link to="/" style={{ fontWeight: 900 }}>“/”</Link>.
          </p>
          <div className="actions__right">
            <Link to="/booking">
              <Button variant="primary">Start booking</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost">Go to admin</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>What you’ll need</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(17, 24, 39, 0.75)', lineHeight: 1.7 }}>
            <li>Your name, email, and phone</li>
            <li>Device brand & model</li>
            <li>The problem you’re facing</li>
            <li>Optional notes</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
