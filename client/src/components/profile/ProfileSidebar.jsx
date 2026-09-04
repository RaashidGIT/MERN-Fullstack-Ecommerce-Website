// Renders the profile summary and manages active tab switching

import './style/ProfileSidebar.css';

const ProfileSidebar = ({ userInfo, activeTab, setActiveTab, counts, logout }) => {
  return (
    <aside className="profile-sidebar">
      {/* User Avatar Badge */}
      <div className="user-avatar-badge">
        {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
      </div>
      <h2>{userInfo.name}</h2>
      <p className="user-email-text">{userInfo.email}</p>

      {/* Navigation Buttons */}
      <nav className="profile-nav">
        <button
          type="button"
          className={`profile-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          ❤️ Wishlist ({counts.wishlist})
        </button>

        <button
          type="button"
          className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📜 Order History ({counts.orders})
        </button>

        <button
          type="button"
          className={`profile-nav-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          📦 My Listings ({counts.listings})
        </button>

        <button
          type="button"
          className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          ⚙️ About Account
        </button>
      </nav>

      {/* Logout Trigger */}
      <button type="button" className="logout-action-btn" onClick={logout}>
        Sign Out
      </button>
    </aside>
  );
};

export default ProfileSidebar;