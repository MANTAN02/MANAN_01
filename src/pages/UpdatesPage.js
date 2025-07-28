import React, { useEffect, useState } from 'react';
import { useAuth, callBackendFunction } from '../AuthContext';
import Button from '../components/Button';
import '../styles.css';

export default function UpdatesPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const swaps = await callBackendFunction('getUserSwaps', 'GET');
        // Only show completed/accepted swaps
        const completed = swaps.filter(s => s.status === 'accepted' || s.status === 'completed');
        setHistory(completed);
      } catch (e) {
        setError('Failed to load order/swap history');
      }
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#c00' }}>{error}</div>;
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Sign In Required</h2>
        <p>You must be logged in to view your order/swap history.</p>
        <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
      </div>
    );
  }
  if (!history || history.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.05)', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📦</div>
          <h2 style={{ fontWeight: 800, fontSize: 28, color: '#232F3E', marginBottom: 16 }}>
            No Completed Swaps/Orders
          </h2>
          <p style={{ color: '#666', marginBottom: 24, fontSize: '1.1rem' }}>
            You have no completed swaps or orders yet. Start swapping or buying!
          </p>
          <Button variant="premium" onClick={() => window.location.href = '/browse'}>
            Browse Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.05)', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: '#232F3E' }}>
            Order / Swap History
          </h2>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            View all your completed swaps and orders
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#f7faff' }}>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Swap/Order ID</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Your Item</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Other Item</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Net Amount</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Status</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e0e7ff' }}>
                  <td style={{ padding: 10 }}>{order.id}</td>
                  <td style={{ padding: 10 }}>{order.itemOfferedId || '-'}</td>
                  <td style={{ padding: 10 }}>{order.itemRequestedId || '-'}</td>
                  <td style={{ padding: 10, fontWeight: 600, color: order.netAmount > 0 ? '#ff4d6d' : order.netAmount < 0 ? '#22a06b' : '#232F3E' }}>
                    {order.netAmount === 0 ? 'Even' : order.netAmount > 0 ? `Pay ₹${order.netAmount}` : `Receive ₹${Math.abs(order.netAmount)}`}
                  </td>
                  <td style={{ padding: 10, fontWeight: 600, color: order.status === 'accepted' ? '#22a06b' : order.status === 'declined' ? '#c00' : '#a259f7' }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </td>
                  <td style={{ padding: 10 }}>{order.createdAt ? new Date(order.createdAt._seconds ? order.createdAt._seconds * 1000 : order.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Button variant="secondary" onClick={() => window.location.href = '/browse'}>
            Back to Browse
          </Button>
        </div>
      </div>
    </div>
  );
}
