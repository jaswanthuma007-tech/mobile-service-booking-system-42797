import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Alert, Button, Card } from '../components/UI';

// PUBLIC_INTERFACE
export default function BookingConfirmation() {
  /** Confirmation page after successful booking submission. */
  const navigate = useNavigate();
  const location = useLocation();

  const bookingId = location.state?.bookingId;
  const summary = location.state?.summary;

  return (
    <AppShell
      rightSlot={
        <Button variant="ghost" onClick={() => navigate('/')}>
          Home
        </Button>
      }
    >
      <Card>
        <h2 style={{ marginTop: 0, letterSpacing: '-0.02em' }}>Booking confirmed</h2>

        {bookingId ? (
          <Alert variant="success" title="Your booking ID">
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
              #{bookingId}
            </div>
            <div style={{ color: 'rgba(17, 24, 39, 0.75)', marginTop: 6 }}>
              Please keep this ID for reference.
            </div>
          </Alert>
        ) : (
          <Alert variant="info" title="No booking ID found">
            It looks like you opened this page directly. Please start a new booking.
          </Alert>
        )}

        {summary ? (
          <div style={{ marginTop: 14 }}>
            <h3 style={{ marginTop: 0 }}>Summary</h3>
            <div style={{ color: 'rgba(17, 24, 39, 0.78)', lineHeight: 1.75 }}>
              <div><strong>Name:</strong> {summary.customer_name}</div>
              <div><strong>Phone:</strong> {summary.phone}</div>
              <div><strong>Email:</strong> {summary.email}</div>
              <div><strong>Brand:</strong> {summary.brand_name}</div>
              <div><strong>Model:</strong> {summary.model_name}</div>
              <div><strong>Problem:</strong> {summary.problem_name}</div>
              {summary.notes ? <div><strong>Notes:</strong> {summary.notes}</div> : null}
            </div>
          </div>
        ) : null}

        <div className="actions__right">
          <Link to={bookingId ? `/track-status?id=${encodeURIComponent(String(bookingId))}` : '/track-status'}>
            <Button variant="primary">Track</Button>
          </Link>
          <Link to="/booking">
            <Button variant="secondary">Book a new repair</Button>
          </Link>
        </div>
      </Card>
    </AppShell>
  );
}
