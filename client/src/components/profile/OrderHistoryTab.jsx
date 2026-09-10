import { useState, useEffect } from 'react';
import './style/OrderHistoryTab.css';

const OrderHistoryTab = ({ userInfo, onOrderCountChange }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMyOrders = async () => {
    if (!userInfo?.token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders/myorders', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      const orderList = Array.isArray(data) ? data : [];
      setOrders(orderList);
      if (onOrderCountChange) onOrderCountChange(orderList.length);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [userInfo]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        alert('Order cancelled successfully.');
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, isCancelled: true } : order))
        );
      } else {
        alert(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('Error connecting to server.');
    }
  };

  const getBuyerOrderStatus = (order) => {
    if (order.isCancelled) {
      return { label: 'Cancelled', className: 'status-cancelled' };
    }
    if (order.isDelivered) {
      return { label: 'Delivered', className: 'status-delivered' };
    }

    const orderDate = new Date(order.createdAt).getTime();
    const diffMinutes = (currentTime - orderDate) / (1000 * 60);
    if (diffMinutes < 10) {
      return { label: 'Order Confirmed', className: 'status-placed' };
    }

    if (order.paymentMethod === 'COD') {
      return { label: 'Delivery Pending (COD)', className: 'status-shipping' };
    }

    if (order.isPaid) {
      return { label: 'Delivery Pending', className: 'status-shipping' };
    }

    return { label: 'Payment Pending', className: 'status-pending' };
  };

  return (
    <section className="profile-section">
      <h3 className="settings-header-title">Order History</h3>

      {loadingOrders ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="empty-tab-box">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt).getTime();
            const diffMinutes = (currentTime - orderDate) / (1000 * 60);
            const isExpired = diffMinutes >= 10;
            const minutesLeft = Math.max(0, Math.ceil(10 - diffMinutes));
            const status = getBuyerOrderStatus(order);

            return (
              <div key={order._id} className="order-history-card">
                <div className="order-header-row">
                  <div>
                    <span className="order-id">Order ID: #{order._id.slice(-8)}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="order-status-badge">
                    <span className={`status-pill ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="order-items-grid">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="order-item-inline">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p className="order-item-title">{item.name}</p>
                        <p className="order-item-details">
                          {item.qty} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer-row">
                  <span className="order-total">Total: ${order.totalPrice.toFixed(2)}</span>
                  <div className="cancel-action-wrapper">
                    {order.isCancelled ? (
                      <span className="status-cancelled-text">Order Cancelled</span>
                    ) : order.isDelivered ? (
                      <span className="status-delivered-text">Delivered on {new Date(order.deliveredAt || Date.now()).toLocaleDateString()}</span>
                    ) : isExpired ? (
                      <button type="button" className="cancel-order-btn-disabled" disabled>
                        Order cannot be cancelled anymore
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="cancel-order-btn-active"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel Order ({minutesLeft}m left)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OrderHistoryTab;