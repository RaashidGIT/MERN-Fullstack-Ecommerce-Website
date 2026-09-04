import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../productCard';
import './style/ListingsTab.css';

const ListingsTab = ({ userInfo, onListingsCountChange }) => {
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [restockInputs, setRestockInputs] = useState({});
  const [updatingMap, setUpdatingMap] = useState({});
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

  // 3. Counter helpers
  const getQty = (id) => restockInputs[id] || 1;

  const handleQtyChange = (id, delta) => {
    const current = getQty(id);
    const next = Math.max(1, current + delta);
    setRestockInputs((prev) => ({ ...prev, [id]: next }));
  };

  // 4. Send restock patch to backend
  const handleRestock = async (productId) => {
    const addCount = getQty(productId);
    setUpdatingMap((prev) => ({ ...prev, [productId]: true }));

    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/restock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ restockQty: addCount }),
      });

      const updated = await res.json();

      if (res.ok) {
        setMyListings((prev) =>
          prev.map((item) => (item._id === productId ? updated : item))
        );
        setRestockInputs((prev) => ({ ...prev, [productId]: 1 }));
      } else {
        alert(updated.message || 'Failed to restock product');
      }
    } catch (err) {
      console.error('Restock error:', err);
      alert('Error updating product stock');
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // 5. Delete listing handler
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
              <ProductCard product={item} showWishlist={false} isSellerView={true}>
                {/* Restock UI sitting in the empty card space */}
                <div className="seller-restock-box">
                  <span className="current-stock-label">
                    Stock: <strong>{item.countInStock}</strong>
                  </span>

                  <div className="restock-stepper-row">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => handleQtyChange(item._id, -1)}
                      disabled={getQty(item._id) <= 1}
                    >
                      -
                    </button>
                    <span className="stepper-count">{getQty(item._id)}</span>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => handleQtyChange(item._id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn-restock"
                    onClick={() => handleRestock(item._id)}
                    disabled={updatingMap[item._id]}
                  >
                    {updatingMap[item._id] ? 'Restocking...' : 'Restock'}
                  </button>
                </div>
              </ProductCard>

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