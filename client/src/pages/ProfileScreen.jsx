import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/productCard';
import './style/ProfileScreen.css';
import '../App.css';

const ProfileScreen = () => {
  const { userInfo, logout } = useUser();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('wishlist'); // 'profile' | 'wishlist' | 'listings'
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Redirect to login if user is unauthenticated
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  // Fetch products uploaded by this user
  useEffect(() => {
    if (userInfo && activeTab === 'listings') {
      setLoadingListings(true);
      fetch(`http://localhost:5000/api/products?seller=${userInfo._id}`)
        .then((res) => res.json())
        .then((data) => {
          // Fallback filter if backend doesn't filter query params yet
          const userProducts = Array.isArray(data)
            ? data.filter((item) => item.user === userInfo._id || item.seller === userInfo._id)
            : [];
          setMyListings(userProducts);
          setLoadingListings(false);
        })
        .catch(() => setLoadingListings(false));
    }
  }, [userInfo, activeTab]);

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
            ❤️ Wishlist ({wishlistItems.length})
          </button>
          <button
            type="button"
            className={`profile-nav-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            📦 My Listings ({myListings.length})
          </button>
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

      {/* Main Tab Content */}
      <main className="profile-content-area">
        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <section className="profile-section">
            <h3>Saved Items ({wishlistItems.length})</h3>
            {wishlistItems.length === 0 ? (
              <p className="empty-tab-text">
                Your wishlist is empty. <Link to="/">Browse items to save!</Link>
              </p>
            ) : (
              <div className="profile-products-grid">
                {wishlistItems.map((item) => (
                  <div key={item._id} className="wishlist-item-card">
                    <ProductCard product={item} />
                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => toggleWishlist(item)}
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* My Listed Products Tab */}
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

        {/* Account Details Tab */}
        {activeTab === 'profile' && (
          <section className="profile-section">
            <h3>Account Settings</h3>
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

        {/* Add a delete Account button later */}

      </main>
    </div>
  );
};

export default ProfileScreen;