import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/useWishlist';

// Profile child components
import ProfileSidebar from '../components/profile/ProfileSidebar';
import WishlistTab from '../components/profile/WishlistTab';
import OrderHistoryTab from '../components/profile/OrderHistoryTab';
import ListingsTab from '../components/profile/ListingsTab';
import AccountTab from '../components/profile/AccountTab';

import './style/ProfileScreen.css';
import '../App.css';

// Main profile container coordinating tab navigation
const ProfileScreen = () => {
  const { userInfo, logout } = useUser();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'wishlist');
  const [orderCount, setOrderCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);

  // Authentication guard
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  if (!userInfo) return null;

  return (
    <div className="profile-page-container">
      {/* Sidebar Navigation */}
      <ProfileSidebar
        userInfo={userInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          wishlist: wishlistItems?.length || 0,
          orders: orderCount,
          listings: listingCount,
        }}
        logout={logout}
      />

      {/* Main Tab Content */}
      <main className="profile-content-area">
        {activeTab === 'wishlist' && <WishlistTab wishlistItems={wishlistItems} />}
        {activeTab === 'orders' && (
          <OrderHistoryTab userInfo={userInfo} onOrderCountChange={setOrderCount} />
        )}
        {activeTab === 'listings' && (
          <ListingsTab userInfo={userInfo} onListingsCountChange={setListingCount} />
        )}
        {activeTab === 'profile' && <AccountTab userInfo={userInfo} logout={logout} />}
      </main>
    </div>
  );
};

export default ProfileScreen;