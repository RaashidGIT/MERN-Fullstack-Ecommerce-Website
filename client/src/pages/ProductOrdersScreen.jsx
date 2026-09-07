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

  const GRACE_PERIOD_MS = 10 * 60 * 1000;

  const getOrderStatus = (ord) => {
    const isCancelled = ord.isCancelled === true || ord.isCancelled === 'true';
    const isDelivered = Boolean(ord.isDelivered);
    const isPaid = Boolean(ord.isPaid);

    if (isCancelled) return { label: 'Cancelled', className: 'cancelled' };

    const orderTime = new Date(ord.createdAt).getTime();
    const timeElapsed = Date.now() - orderTime;

    if (timeElapsed < GRACE_PERIOD_MS) return { label: 'Pending', className: 'pending' };
    if (isPaid && isDelivered) return { label: 'Delivered', className: 'delivered' };
    if (isPaid && !isDelivered) return { label: 'Delivery Pending', className: 'delivery-pending' };

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