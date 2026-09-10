import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
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

      // Locally update state to reflect delivery immediately
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
                <div>
                  <h2>{product.name}</h2>
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
                  {orders.map((ord) => {
                    const status = getOrderStatus(ord);
                    const orderDate = new Date(ord.createdAt);

                    return (
                      <tr key={ord._id}>
                        <td>#{ord._id.slice(-6)}</td>
                        <td>{ord.buyerName}</td>
                        <td>{ord.buyerEmail}</td>
                        <td>{ord.city}</td>
                        <td>{ord.postalCode}</td>
                        <td>{ord.country}</td>
                        <td>{ord.qty}</td>
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
                              disabled={updatingId === ord._id}
                              onClick={() => handleMarkDelivered(ord._id)}
                            >
                              {updatingId === ord._id ? 'Updating...' : 'Mark Delivered'}
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
      )}
    </div>
  );
};

export default ProductOrdersScreen;