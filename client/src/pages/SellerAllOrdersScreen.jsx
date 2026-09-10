import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ShippingLabelModal from '../components/ShippingLabelModal';
import './style/ProductOrdersScreen.css';

const GRACE_PERIOD_MS = 10 * 60 * 1000;

const SellerAllOrdersScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const [orderRows, setOrderRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [activeLabelOrder, setActiveLabelOrder] = useState(null);

  const getOrderStatus = (ord) => {
    const isCancelled = ord.isCancelled === true || ord.isCancelled === 'true';
    const isDelivered = Boolean(ord.isDelivered);
    const isDispatched = Boolean(ord.isDispatched);
    const isPaid = Boolean(ord.isPaid);
    const isCOD = ord.paymentMethod === 'COD';

    if (isCancelled) return { label: 'Cancelled', className: 'cancelled', stage: 'CANCELLED' };
    if (isDelivered) return { label: 'Delivered', className: 'delivered', stage: 'DELIVERED' };

    const orderTime = new Date(ord.createdAt).getTime();
    if (Date.now() - orderTime < GRACE_PERIOD_MS) {
      return { label: 'Pending', className: 'pending', stage: 'GRACE' };
    }

    if (isDispatched) {
      return { label: 'In Transit', className: 'in-transit', stage: 'IN_TRANSIT' };
    }

    if (isCOD) {
      return { label: 'COD - Ready to Ship', className: 'cod-pending', stage: 'READY_TO_SHIP' };
    }

    if (isPaid) {
      return { label: 'Ready to Ship', className: 'delivery-pending', stage: 'READY_TO_SHIP' };
    }

    return { label: 'Payment Pending', className: 'pending', stage: 'UNPAID' };
  };

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

  const handleDispatchOrder = async (row) => {
    setUpdatingId(row.orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${row.orderId}/dispatch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || 'Dispatch failed');

      setOrderRows((prev) =>
        prev.map((r) =>
          r.orderId === row.orderId ? { ...r, isDispatched: true, awbCode: updated.awbCode } : r
        )
      );

      setActiveLabelOrder({
        ...row,
        _id: row.orderId,
        awbCode: updated.awbCode,
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

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
                  <th>Address</th>
                  <th>Postal Code</th>
                  <th>Country</th>
                  <th>Qty</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', minWidth: '160px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((row, idx) => {
                  const status = getOrderStatus(row);
                  const orderDate = new Date(row.createdAt);

                  return (
                    <tr key={`${row.orderId}-${idx}`}>
                      <td>#{row.orderId.slice(-6)}</td>
                      <td className="cell-truncate-title">{row.productName}</td>
                      <td>{row.buyerName}</td>
                      <td className="cell-truncate">{row.buyerEmail}</td>
                      <td className="cell-truncate">{row.city}</td>
                      <td>{row.postalCode}</td>
                      <td>{row.country}</td>
                      <td>{row.qty}</td>
                      <td>
                        <div className="date-time-cell">
                          <span>{orderDate.toLocaleDateString()}</span>
                          <span className="sub-time">
                            {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`order-status-pill ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {status.stage === 'READY_TO_SHIP' && (
                          <button
                            type="button"
                            className="btn-dispatch-ship"
                            disabled={updatingId === row.orderId}
                            onClick={() => handleDispatchOrder(row)}
                          >
                            {updatingId === row.orderId ? 'Generating...' : '📦 Ship Order'}
                          </button>
                        )}

                        {status.stage === 'IN_TRANSIT' && (
                          <div className="action-button-stack">
                            <button
                              type="button"
                              className="btn-mark-delivered"
                              disabled={updatingId === row.orderId}
                              onClick={() => handleMarkDelivered(row.orderId)}
                            >
                              ✓ Confirm Delivery
                            </button>
                            <button
                              type="button"
                              className="btn-reprint-label"
                              onClick={() =>
                                setActiveLabelOrder({
                                  ...row,
                                  _id: row.orderId,
                                })
                              }
                            >
                              📄 View Slip
                            </button>
                          </div>
                        )}

                        {['GRACE', 'DELIVERED', 'CANCELLED', 'UNPAID'].includes(status.stage) && (
                          <span style={{ color: '#666', fontSize: '0.85rem' }}>—</span>
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

      {activeLabelOrder && (
        <ShippingLabelModal
          order={activeLabelOrder}
          onClose={() => setActiveLabelOrder(null)}
        />
      )}
    </div>
  );
};

export default SellerAllOrdersScreen;