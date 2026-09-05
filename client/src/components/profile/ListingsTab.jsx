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

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  // 1. Fetch Listings
  const fetchListings = async () => {
    if (!userInfo?.token) return;
    setLoadingListings(true);

    try {
      const res = await fetch('http://localhost:5000/api/products/mylistings', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setMyListings(items);
      if (onListingsCountChange) onListingsCountChange(items.length);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [userInfo]);

  // 2. Sort Listings
  const sortedListings = useMemo(() => {
    if (!Array.isArray(myListings)) return [];
    const items = [...myListings];
    switch (sortBy) {
      case 'price-asc': return items.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc': return items.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name-asc': return items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-desc': return items.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default: return items;
    }
  }, [myListings, sortBy]);

  // 3. Restock Handlers
  const getQty = (id) => restockInputs[id] || 1;

  const handleQtyChange = (id, delta) => {
    const current = getQty(id);
    setRestockInputs((prev) => ({ ...prev, [id]: Math.max(1, current + delta) }));
  };

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
        setMyListings((prev) => prev.map((item) => (item._id === productId ? updated : item)));
        setRestockInputs((prev) => ({ ...prev, [productId]: 1 }));
      } else {
        alert(updated.message || 'Failed to restock');
      }
    } catch (err) {
      alert('Error updating product stock');
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // 4. Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
    });
  };

  // 5. Submit Edited Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setEditSaving(true);

    try {
      const res = await fetch(`http://localhost:5000/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          ...editForm,
          price: Number(editForm.price),
        }),
      });

      const updated = await res.json();

      if (res.ok) {
        setMyListings((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? updated : p))
        );
        setEditingProduct(null);
      } else {
        alert(updated.message || 'Failed to update listing');
      }
    } catch (err) {
      alert('Error updating listing');
    } finally {
      setEditSaving(false);
    }
  };

  // 6. Delete Handler
  const handleDeleteListing = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` },
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
            <label htmlFor="listings-sort" className="sort-label">Sort by:</label>
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
                    <span className="stepper-count">+{getQty(item._id)}</span>
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

              {/* Seller Action Controls */}
              <div className="listing-action-row">
                <button
                  type="button"
                  className="edit-listing-btn"
                  onClick={() => handleOpenEdit(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="delete-listing-btn"
                  onClick={() => handleDeleteListing(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Listing</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setEditingProduct(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="edit-product-form">
              <label>Product Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />

              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                required
              />

              <label>Category</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                required
              />

              <label>Image URL</label>
              <input
                type="text"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                required
              />

              <label>Description</label>
              <textarea
                rows="4"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                required
              />

              <div className="modal-btn-row">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ListingsTab;