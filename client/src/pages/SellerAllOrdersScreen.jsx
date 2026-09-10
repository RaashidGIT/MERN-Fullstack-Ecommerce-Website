import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './style/ProductOrdersScreen.css';

const GRACE_PERIOD_MS = 10 * 60 * 1000;

const getOrderStatus = (ord) => {
  const isCancelled = ord.isCancelled === true || ord.isCancelled === 'true';
  const isDelivered = Boolean(ord.isDelivered);
  const isPaid = Boolean(ord.isPaid);
  const isCOD = ord.paymentMethod === 'COD';

  if (isCancelled) return { label: 'Cancelled', className: 'cancelled', canDeliver: false };

  const orderTime = new Date(ord.createdAt).getTime();
  if (Date.now() - orderTime < GRACE_PERIOD_MS) {
    return { label: 'Pending', className: 'pending', canDeliver: false };
  }

  if (isDelivered) return { label: 'Delivered', className: 'delivered', canDeliver: false };
  if (isCOD) return { label: 'COD - Delivery Pending', className: 'cod-pending', canDeliver: true };
  if (isPaid && !isDelivered) return { label: 'Delivery Pending', className: 'delivery-pending', canDeliver: true };

  return { label: 'Payment Pending', className: 'pending', canDeliver: false };
};

const SellerAllOrdersScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const [orderRows, setOrderRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchAllOrders();
  }, [userInfo, navigate]);

  const handleMarkDelivered = async (orderId) => {
    if (!window.confirm('Confirm that this order has reached the customer?')) return;
    setUpdatingId(orderId);

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!res.ok) throw new Error('Could not update status');

      // Update matching rows in the table
      setOrderRows((prev) =>
        prev.map((row) =>
          row.orderId === orderId ? { ...row, isDelivered: true, isPaid: true } : row
        )
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

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
                  <th>Action</th>
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
                      <td>
                        {status.canDeliver ? (
                          <button
                            type="button"
                            className="btn-mark-delivered"
                            disabled={updatingId === row.orderId}
                            onClick={() => handleMarkDelivered(row.orderId)}
                          >
                            {updatingId === row.orderId ? 'Updating...' : 'Mark Delivered'}
                          </button>
                        ) : (
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>—</span>
                        )}
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