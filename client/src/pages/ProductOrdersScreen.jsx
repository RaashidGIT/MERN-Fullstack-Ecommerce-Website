import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ShippingLabelModal from '../components/ShippingLabelModal';
import './style/ProductOrdersScreen.css';

const ProductOrdersScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useUser();

  const [orders, setOrders] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [activeLabelOrder, setActiveLabelOrder] = useState(null);

  const GRACE_PERIOD_MS = 10 * 60 * 1000;

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

  const fetchProductOrders = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/orders`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (!res.ok) throw new Error('Failed to load buyers list');
      const data = await res.json();
      setProduct(data.product);
      setOrders(data.orders || []);
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
    fetchProductOrders();
  }, [productId, userInfo, navigate]);

  const handleDispatchOrder = async (ord) => {
    setUpdatingId(ord._id);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${ord._id}/dispatch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || 'Dispatch failed');

      setOrders((prev) =>
        prev.map((o) =>
          o._id === ord._id ? { ...o, isDispatched: true, awbCode: updated.awbCode } : o
        )
      );

      setActiveLabelOrder({
        ...ord,
        productName: product?.name || 'Anime Merch',
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

      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, isDelivered: true, isPaid: true } : ord))
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

      {loading ? (
        <p className="status-text">Loading orders...</p>
      ) : error ? (
        <div className="orders-error-banner">{error}</div>
      ) : (
        <div className="orders-content-card">
          <div className="orders-product-summary">
            {product && (
              <>
                <img src={product.image} alt={product.name} className="summary-thumb" />
                <div className="summary-info">
                  <h2 className="summary-product-name">{product.name}</h2>
                  <p className="summary-subtext">
                    Total Purchases: <strong>{orders.length} order(s)</strong>
                  </p>
                </div>
              </>
            )}
          </div>

          <h3 className="section-title">Buyer Order History</h3>

          {orders.length === 0 ? (
            <p className="no-orders-msg">No orders placed for this item yet.</p>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
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
                  {orders.map((ord) => {
                    const status = getOrderStatus(ord);
                    const orderDate = new Date(ord.createdAt);

                    return (
                      <tr key={ord._id}>
                        <td>#{ord._id.slice(-6)}</td>
                        <td>{ord.buyerName}</td>
                        <td className="cell-truncate">{ord.buyerEmail}</td>
                        <td className="cell-truncate">{ord.city}</td>
                        <td>{ord.postalCode}</td>
                        <td>{ord.country}</td>
                        <td>{ord.qty}</td>
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
                              disabled={updatingId === ord._id}
                              onClick={() => handleDispatchOrder(ord)}
                            >
                              {updatingId === ord._id ? 'Generating...' : '📦 Ship Order'}
                            </button>
                          )}

                          {status.stage === 'IN_TRANSIT' && (
                            <div className="action-button-stack">
                              <button
                                type="button"
                                className="btn-mark-delivered"
                                disabled={updatingId === ord._id}
                                onClick={() => handleMarkDelivered(ord._id)}
                              >
                                ✓ Confirm Delivery
                              </button>
                              <button
                                type="button"
                                className="btn-reprint-label"
                                onClick={() =>
                                  setActiveLabelOrder({
                                    ...ord,
                                    productName: product?.name || 'Anime Merch',
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
      )}

      {activeLabelOrder && (
        <ShippingLabelModal
          order={activeLabelOrder}
          onClose={() => setActiveLabelOrder(null)}
        />
      )}
    </div>
  );
};

export default ProductOrdersScreen;