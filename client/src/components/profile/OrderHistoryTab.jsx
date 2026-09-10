// src/pages/OrderHistoryTab.jsx
import { useState, useEffect } from 'react';
import './style/OrderHistoryTab.css';

const OrderHistoryTab = ({ userInfo, onOrderCountChange }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [expandedTrackerId, setExpandedTrackerId] = useState(null);

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
      setOrders(Array.isArray(data) ? data : []);
      if (onOrderCountChange) onOrderCountChange(data.length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [userInfo]);

  const toggleTracker = (orderId) => {
    setExpandedTrackerId((prev) => (prev === orderId ? null : orderId));
  };

  // Calculates active step index (0 to 4)
  const getTrackingStepIndex = (order) => {
    if (order.isDelivered) return 4;
    if (order.isDispatched) return 2; // Handed over to courier
    const orderTime = new Date(order.createdAt).getTime();
    if ((currentTime - orderTime) / (1000 * 60) >= 10) return 1; // Packed
    return 0; // Order Placed
  };

  const trackingSteps = [
    { title: 'Order Placed', subtext: 'Received & Confirmed' },
    { title: 'Packed', subtext: 'Ready for Courier Pickup' },
    { title: 'In Transit', subtext: 'Carrier Pickup Completed' },
    { title: 'Out for Delivery', subtext: 'Arriving Today' },
    { title: 'Delivered', subtext: 'Package Handed Over' },
  ];

  return (
    <section className="profile-section">
      <h3 className="settings-header-title">Order History</h3>

      {loadingOrders ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="empty-tab-box"><p>No orders placed yet.</p></div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => {
            const currentStep = getTrackingStepIndex(order);
            const isTrackingOpen = expandedTrackerId === order._id;

            return (
              <div key={order._id} className="order-history-card">
                <div className="order-header-row">
                  <div>
                    <span className="order-id">Order ID: #{order._id.slice(-8)}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {order.awbCode && <span className="awb-badge">{order.awbCode}</span>}
                    <button
                      type="button"
                      className="btn-track-toggle"
                      onClick={() => toggleTracker(order._id)}
                    >
                      {isTrackingOpen ? '▲ Hide Tracking' : '📍 Track Package'}
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE STEPPER */}
                {isTrackingOpen && (
                  <div className="tracking-stepper-container">
                    <div className="tracking-bar-wrapper">
                      {trackingSteps.map((step, idx) => {
                        const isCompleted = idx <= currentStep && !order.isCancelled;
                        const isCurrent = idx === currentStep && !order.isCancelled;

                        return (
                          <div key={idx} className={`tracking-step ${isCompleted ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                            <div className="step-node">{isCompleted ? '✓' : idx + 1}</div>
                            <div className="step-info">
                              <span className="step-title">{step.title}</span>
                              <span className="step-subtext">
                                {idx === 2 && order.awbCode ? `${order.courierPartner || 'Delhivery'}` : step.subtext}
                              </span>
                            </div>
                            {idx < trackingSteps.length - 1 && <div className="step-connector" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ORDER ITEMS GRID */}
                <div className="order-items-grid">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="order-item-inline">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p className="order-item-title">{item.name}</p>
                        <p className="order-item-details">{item.qty} × ₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer-row">
                  <span className="order-total">Total: ₹{order.totalPrice.toFixed(2)} ({order.paymentMethod})</span>
                  {order.isDelivered && (
                    <span className="status-delivered-text">✓ Delivered</span>
                  )}
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