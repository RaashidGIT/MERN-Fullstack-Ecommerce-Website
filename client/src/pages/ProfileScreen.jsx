import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/useWishlist';
import ProductCard from '../components/productCard';
import './style/ProfileScreen.css';
import '../App.css';

const ProfileScreen = () => {
  const { userInfo, logout } = useUser();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'wishlist'); // 'profile' | 'wishlist' | 'listings'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Delete modal & loading states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [isDeleting, setIsDeleting] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  // Sort wishlist items
  const sortedWishlist = useMemo(() => {
    if (!Array.isArray(wishlistItems)) return [];

    const items = [...wishlistItems];
    switch (sortBy) {
      case 'price-asc':
        return items.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return items.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name-asc':
        return items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-desc':
        return items.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return items;
    }
  }, [wishlistItems, sortBy]);

  // Fetch products uploaded by this user
  useEffect(() => {
    if (userInfo && activeTab === 'listings') {
      setLoadingListings(true);
      fetch(`http://localhost:5000/api/products?seller=${userInfo._id}`)
        .then((res) => res.json())
        .then((data) => {
          const userProducts = Array.isArray(data)
            ? data.filter((item) => item.user === userInfo._id || item.seller === userInfo._id)
            : [];
          setMyListings(userProducts);
          setLoadingListings(false);
        })
        .catch(() => setLoadingListings(false));
    }
  }, [userInfo, activeTab]);

  // 1-second interval to dynamically re-evaluate the 10-minute cancellation window
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Orders
  const fetchMyOrders = async () => {
    if (!userInfo?.token) return;

    setLoadingOrders(true);
      try {
        const res = await fetch('http://localhost:5000/api/orders/myorders', {
          headers: { 
            Authorization: `Bearer ${userInfo.token}` 
          },
        });
        const data = await res.json();
        console.log('Fetched Orders:', data); // Inspect what returns
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    useEffect(() => {
      if (activeTab === 'orders' && userInfo) {
        fetchMyOrders();
      }
    }, [activeTab, userInfo]);

  // Cancel Order Handler
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

      // Update state directly so the button changes immediately to "Cancelled"
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, isCancelled: true } : order
        )
      );
    } else {
      alert(data.message || 'Failed to cancel order.');
    }
  } catch (err) {
    console.error('Cancel order error:', err);
    alert('Error connecting to server.');
  }
};

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (res.ok) {
        logout();
        navigate('/');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Could not connect to server.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="profile-page-container">
      {/* Profile Sidebar */}
      <aside className="profile-sidebar">
        <div className="user-avatar-badge">
          {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2>{userInfo.name}</h2>
        <p className="user-email-text">{userInfo.email}</p>

        <nav className="profile-nav">
          <button
            type="button"
            className={`profile-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            ❤️ Wishlist ({wishlistItems?.length || 0})
          </button>

          {/* Order History: Only active when activeTab === 'orders' */}
          <button
            type="button"
            className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📜 Order History ({orders?.length || 0})
          </button>

          {/* My Listings: Only active when activeTab === 'listings' */}
          <button
            type="button"
            className={`profile-nav-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            📦 My Listings ({myListings?.length || 0})
          </button>

          {/* About Account: Only active when activeTab === 'profile' */}
          <button
            type="button"
            className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            ⚙️ About Account
          </button>
        </nav>

        <button type="button" className="logout-action-btn" onClick={logout}>
          Sign Out
        </button>
      </aside>

      {/* Content Area */}
      <main className="profile-content-area">
        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="profile-section">
            <div className="section-header-flex">
              <h3>Saved Items ({wishlistItems?.length || 0})</h3>

              <div className="wishlist-sort-wrapper">
                <label htmlFor="wishlist-sort" className="sort-label">
                  Sort by:
                </label>
                <select
                  id="wishlist-sort"
                  className="profile-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  disabled={!wishlistItems || wishlistItems.length === 0}
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {sortedWishlist.length === 0 ? (
              <div className="empty-tab-box">
                <p>Your wishlist is currently empty.</p>
              </div>
            ) : (
              <div className="profile-products-grid">
                {sortedWishlist.map((item) => (
                  <ProductCard key={item._id} product={item} showWishlist={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === 'orders' && (
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

                  return (
                    <div key={order._id} className="order-history-card">
                      <div className="order-header-row">
                        <div>
                          <span className="order-id">Order ID: #{order._id.slice(-8)}</span>
                          <span className="order-date">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="order-status-badge">
                          {order.isCancelled ? (
                            <span className="status-cancelled">Cancelled</span>
                          ) : (
                            <span className="status-placed">Order Confirmed</span>
                          )}
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
                        <span className="order-total">
                          Total: ${order.totalPrice.toFixed(2)}
                        </span>

                        <div className="cancel-action-wrapper">
                          {order.isCancelled ? (
                            <span className="status-cancelled">Cancelled</span>
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
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <section className="profile-section">
            <div className="section-header-flex">
              <h3>Items Listed for Sale</h3>
              <button
                type="button"
                className="create-listing-btn"
                onClick={() => navigate('/add-product')}
              >
                + List New Item
              </button>
            </div>

            {loadingListings ? (
              <p>Loading your listings...</p>
            ) : myListings.length === 0 ? (
              <div className="empty-tab-box">
                <p>You haven't posted any items for sale yet.</p>
                <button
                  type="button"
                  className="create-listing-btn"
                  onClick={() => navigate('/add-product')}
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="profile-products-grid">
                {myListings.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Account Settings Tab */}
        {activeTab === 'profile' && (
          <section className="profile-section">
            <div className="section-header-flex">
              <h3 className="settings-header-title">Account Details</h3>
              <button
                type="button"
                className="delete-account-top-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Delete Account
              </button>
            </div>

            <div className="account-details-box">
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{userInfo.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email Address:</span>
                <span className="detail-value">{userInfo.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="detail-value mono-text">{userInfo._id}</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-alert">⚠️</div>
            <h3>Delete Account?</h3>
            <p>
              Are you sure you want to permanently delete your account? All your saved items, listings, and profile data will be permanently removed.
            </p>
            <div className="modal-action-buttons">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                No, Keep It
              </button>
              <button
                type="button"
                className="modal-btn-confirm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;