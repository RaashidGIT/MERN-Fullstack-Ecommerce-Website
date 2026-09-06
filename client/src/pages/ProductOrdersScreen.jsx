// src/pages/ProductOrdersScreen.jsx
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

  const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes

  const getOrderStatus = (ord) => {
  
  const isCancelled = ord.isCancelled === true || ord.isCancelled === 'true';
  const isDelivered = Boolean(ord.isDelivered);
  const isPaid = Boolean(ord.isPaid);

  // 1. Explicitly cancelled by buyer before grace period ends
  if (isCancelled) {
    return { label: 'Cancelled', className: 'cancelled' };
  }

  // 2. Check time elapsed since order creation
  const orderTime = new Date(ord.createdAt).getTime();
  const timeElapsed = Date.now() - orderTime;

  // Still within 10-minute grace period
  if (timeElapsed < GRACE_PERIOD_MS) {
    return { label: 'Pending', className: 'pending' };
  }

  // 3. Grace period passed -> Confirmed purchase -> Delivery pending
  if (isPaid && !isDelivered) {
    return { label: 'Delivery Pending', className: 'delivery-pending' };
  }

  // 4. Grace period passed -> Confirmed purchase -> Delivered
  if (isPaid && isDelivered) {
    return { label: 'Delivered', className: 'delivered' };
  }

  // 5. Fallback if grace period has passed but payment is not complete
  return { label: 'Payment Pending', className: 'pending' };
};

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchProductOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${productId}/orders`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load buyers list');
        }

        const data = await res.json();
        setProduct(data.product);
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductOrders();
  }, [productId, userInfo, navigate]);

  // Direct return to Profile -> Listings Tab
  const handleGoBack = () => {
    navigate('/profile', { state: { defaultTab: 'listings' } });
  };

  return (
    <div className="product-orders-container">
      <div className="orders-header-row">
        <button type="button" className="btn-back-to-listings" onClick={handleGoBack}>
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
                    <th>Buyer Name</th>
                    <th>Email</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td>#{ord._id.slice(-6)}</td>
                      <td>{ord.user?.name || 'Anonymous'}</td>
                      <td>{ord.user?.email || 'N/A'}</td>
                      <td>{ord.qty}</td>
                      <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td>
                        {(() => {
                          const status = getOrderStatus(ord);
                          return (
                            <span className={`order-status-pill ${status.className}`}>
                              {status.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
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