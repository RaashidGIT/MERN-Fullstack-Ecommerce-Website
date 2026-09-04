import { useState, useMemo } from 'react';
import './style/WishlistTab.css';
import ProductCard from '../productCard';

// Handles wishlist item sorting and displays the product grid
const WishlistTab = ({ wishlistItems }) => {
  const [sortBy, setSortBy] = useState('default');

  // In-memory sorting based on price or product title
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

  return (
    <div className="profile-section">
      <div className="section-header-flex">
        <h3>Saved Items ({wishlistItems?.length || 0})</h3>

        {/* Sorting Dropdown */}
        <div className="wishlist-sort-wrapper">
          <label htmlFor="wishlist-sort" className="sort-label">Sort by:</label>
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

      {/* Grid rendering */}
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
  );
};

export default WishlistTab;