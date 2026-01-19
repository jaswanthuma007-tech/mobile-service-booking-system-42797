import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminListBookings, adminUpdateStatus } from '../api/client';
import { AppShell, Alert, Button, Card, Select, TextInput } from '../components/UI';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

function formatDateTime(s) {
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString();
  } catch {
    return s;
  }
}

function statusChipStyle(status) {
  const common = {
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid rgba(17, 24, 39, 0.10)',
    fontSize: 12,
    fontWeight: 800,
    display: 'inline-block'
  };
  if (status === 'completed') return { ...common, background: 'rgba(245, 158, 11, 0.16)' };
  if (status === 'in_progress') return { ...common, background: 'rgba(37, 99, 235, 0.12)' };
  if (status === 'cancelled') return { ...common, background: 'rgba(239, 68, 68, 0.12)' };
  return { ...common, background: 'rgba(17, 24, 39, 0.06)' };
}

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  /** Admin dashboard listing bookings and allowing status updates. */
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [updatingIds, setUpdatingIds] = useState(() => new Set());

  const filterOptions = useMemo(
    () => [{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS],
    []
  );

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await adminListBookings({
        status: statusFilter || undefined,
        search: search || undefined,
        limit: 100,
        offset: 0
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpdateStatus(bookingId, newStatus) {
    setError('');

    // Optimistic update
    const prev = items;
    const next = items.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
    setItems(next);

    setUpdatingIds((s) => {
      const ns = new Set(s);
      ns.add(bookingId);
      return ns;
    });

    try {
      const res = await adminUpdateStatus(bookingId, newStatus);
      if (!res?.updated) throw new Error('Update was not applied.');
    } catch (e) {
      // Roll back on error
      setItems(prev);
      setError(e.message || 'Failed to update booking status.');
    } finally {
      setUpdatingIds((s) => {
        const ns = new Set(s);
        ns.delete(bookingId);
        return ns;
      });
    }
  }

  return (
    <AppShell
      rightSlot={
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Button variant="primary" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      }
    >
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6, letterSpacing: '-0.02em' }}>Admin dashboard</h2>
            <div style={{ color: 'rgba(17, 24, 39, 0.70)' }}>
              Showing <strong>{items.length}</strong> of <strong>{total}</strong> bookings
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 260px', gap: 12, width: 'min(100%, 540px)' }}>
            <Select
              label="Status filter"
              value={statusFilter}
              onChange={setStatusFilter}
              options={filterOptions}
              placeholder="All statuses"
            />
            <TextInput
              label="Search"
              value={search}
              onChange={setSearch}
              placeholder="Name/email/phone"
            />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={load} disabled={loading}>
                Apply filters
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 12 }}>
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          </div>
        ) : null}

        <div style={{ marginTop: 14, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {['ID', 'Customer', 'Phone', 'Brand', 'Model', 'Problem', 'Status', 'Created', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      fontSize: 12,
                      color: 'rgba(17, 24, 39, 0.65)',
                      padding: '10px 10px',
                      borderBottom: '1px solid rgba(17, 24, 39, 0.10)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: 14, color: 'rgba(17, 24, 39, 0.70)' }}>
                    Loading bookings…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 14, color: 'rgba(17, 24, 39, 0.70)' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : (
                items.map((b) => {
                  const isUpdating = updatingIds.has(b.id);
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(17, 24, 39, 0.06)' }}>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', fontWeight: 800 }}>
                        #{b.id}
                      </td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>{b.customer_name}</td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>{b.phone}</td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>{b.brand_name}</td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>{b.model_name}</td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>{b.problem_name}</td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <span style={statusChipStyle(b.status)}>{b.status}</span>
                      </td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        {formatDateTime(b.created_at)}
                      </td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          disabled={isUpdating}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 12,
                            border: '1px solid rgba(17, 24, 39, 0.12)',
                            background: 'rgba(255,255,255,0.9)',
                            fontWeight: 700
                          }}
                          aria-label={`Update status for booking ${b.id}`}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
