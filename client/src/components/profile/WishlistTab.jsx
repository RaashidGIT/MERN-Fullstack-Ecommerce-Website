import { useState, useMemo } from 'react';
import { useWishlist } from '../../context/useWishlist';
import ProductCard from '../productCard';
import './style/WishlistTab.css';

const WishlistTab = ({ wishlistItems }) => {
  const wishlistContext = useWishlist() || {};
  const [sortBy, setSortBy] = useState('default');

  // Fallback to prop if context doesn't supply array directly
  const itemsList = wishlistContext.wishlist || wishlistContext.wishlistItems || wishlistItems || [];

  // Safely find the removal/toggle function provided by your context
  const handleRemove = (product) => {
    if (!window.confirm('Remove this item from your wishlist?')) return;

    if (typeof wishlistContext.removeFromWishlist === 'function') {
      wishlistContext.removeFromWishlist(product._id);
    } else if (typeof wishlistContext.toggleWishlist === 'function') {
      wishlistContext.toggleWishlist(product);
    } else if (typeof wishlistContext.setWishlist === 'function') {
      wishlistContext.setWishlist((prev) => prev.filter((item) => item._id !== product._id));
    } else {
      console.warn('No supported removal function found in WishlistContext. Available keys:', Object.keys(wishlistContext));
    }
  };

  const sortedWishlist = useMemo(() => {
    if (!Array.isArray(itemsList)) return [];
    const items = [...itemsList];

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
  }, [itemsList, sortBy]);

  return (
    <div className="profile-section">
      <div className="section-header-flex">
        <h3>Saved Items ({itemsList.length})</h3>

        <div className="wishlist-sort-wrapper">
          <label htmlFor="wishlist-sort" className="sort-label">Sort by:</label>
          <select
            id="wishlist-sort"
            className="profile-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            disabled={itemsList.length === 0}
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {itemsList.length === 0 ? (
        <div className="empty-tab-box">
          <p>Your wishlist is currently empty.</p>
        </div>
      ) : (
        <div className="profile-products-grid">
          {sortedWishlist.map((item) => (
            <div key={item._id} className="wishlist-item-wrapper">
              <ProductCard product={item} showWishlist={false} />
              <button
                type="button"
                className="wishlist-remove-btn"
                onClick={() => handleRemove(item)}
              >
                Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistTab;