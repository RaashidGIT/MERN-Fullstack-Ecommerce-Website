// Here contains the logic for the listings tab in the profile page, including fetching user's listed products, sorting them, and handling deletion of listings.

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../productCard';
import './style/ListingsTab.css';

const ListingsTab = ({ userInfo, onListingsCountChange }) => {
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();

  // 1. Fetch user's listed products
  const fetchListings = async () => {
    if (!userInfo?.token) return;
    setLoadingListings(true);

    try {
      const res = await fetch('http://localhost:5000/api/products/mylistings', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setMyListings(items);

      if (onListingsCountChange) {
        onListingsCountChange(items.length);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [userInfo]);

  // 2. Sort listings dynamically
  const sortedListings = useMemo(() => {
    if (!Array.isArray(myListings)) return [];

    const items = [...myListings];
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
  }, [myListings, sortBy]);

  // 3. Delete listing handler
  const handleDeleteListing = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (res.ok) {
        const updated = myListings.filter((p) => p._id !== productId);
        setMyListings(updated);
        if (onListingsCountChange) onListingsCountChange(updated.length);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Could not delete product');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  return (
    <section className="profile-section">
      <div className="section-header-flex">
        <h3>Items Listed for Sale ({myListings.length})</h3>

        {/* Header Controls: Sort Dropdown + Add Button */}
        <div className="header-controls-group">
          <div className="wishlist-sort-wrapper">
            <label htmlFor="listings-sort" className="sort-label">
              Sort by:
            </label>
            <select
              id="listings-sort"
              className="profile-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={myListings.length === 0}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <button
            type="button"
            className="create-listing-btn"
            onClick={() => navigate('/add-product')}
          >
            + List New Item
          </button>
        </div>
      </div>

      {loadingListings ? (
        <p className="loading-text">Loading your listings...</p>
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
          {sortedListings.map((item) => (
            <div key={item._id} className="listing-item-wrapper">
              <ProductCard product={item} showWishlist={false} isSellerView={true} />
              <button
                type="button"
                className="delete-listing-btn"
                onClick={() => handleDeleteListing(item._id)}
              >
                Delete Listing
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ListingsTab;