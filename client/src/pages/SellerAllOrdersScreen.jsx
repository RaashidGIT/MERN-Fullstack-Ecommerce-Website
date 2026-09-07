// src/pages/SellerAllOrdersScreen.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './style/ProductOrdersScreen.css';

const GRACE_PERIOD_MS = 10 * 60 * 1000;

const getOrderStatus = (ord) => {
  if (ord.isCancelled) return { label: 'Cancelled', className: 'cancelled' };
  const timeElapsed = Date.now() - new Date(ord.createdAt).getTime();
  if (timeElapsed < GRACE_PERIOD_MS) return { label: 'Pending', className: 'pending' };
  if (ord.isPaid && ord.isDelivered) return { label: 'Delivered', className: 'delivered' };
  if (ord.isPaid && !ord.isDelivered) return { label: 'Delivery Pending', className: 'delivery-pending' };
  return { label: 'Payment Pending', className: 'pending' };
};

const SellerAllOrdersScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const [orderRows, setOrderRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchAllOrders = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/orders/seller/all-orders', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        setOrderRows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [userInfo, navigate]);

  return (
    <div className="product-orders-container">
      <div className="orders-header-row">
        <button
          type="button"
          className="btn-back-to-listings"
          onClick={() => navigate('/profile', { state: { defaultTab: 'listings' } })}
        >
          ← Back to My Listings
        </button>
      </div>

      <div className="orders-content-card">
        <h2 style={{ marginBottom: '16px' }}>Master Order History (All Items)</h2>

        {loading ? (
          <p className="loading-text">Loading order records...</p>
        ) : error ? (
          <div className="orders-error-banner">{error}</div>
        ) : orderRows.length === 0 ? (
          <p className="no-orders-msg">No sales records found.</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
                <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Buyer</th>
                    <th>Email</th>
                    <th>Address Line 1</th>
                    <th>Postal Code</th>
                    <th>Country</th>
                    <th>Qty</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {orderRows.map((row, idx) => {
                    const status = getOrderStatus(row);
                    const orderDate = new Date(row.createdAt);

                    return (
                    <tr key={`${row.orderId}-${idx}`}>
                        <td>#{row.orderId.slice(-6)}</td>
                        <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{row.productName}</span>
                        </div>
                        </td>
                        <td>{row.buyerName}</td>
                        <td>{row.buyerEmail}</td>
                        <td>{row.city}</td>
                        <td>{row.postalCode}</td>
                        <td>{row.country}</td>
                        <td>{row.qty}</td>
                        <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                            <span>{orderDate.toLocaleDateString()}</span>
                            <span style={{ color: '#888' }}>
                            {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        </td>
                        <td>
                        <span className={`order-status-pill ${status.className}`}>
                            {status.label}
                        </span>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default SellerAllOrdersScreen;