// Here contains the logic for the product card component, which displays individual product details and provides options to add to cart or wishlist.

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/useWishlist';
import './style/ProductCard.css';

const ProductCard = ({ product, showWishlist = true, isSellerView = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = typeof isInWishlist === 'function' ? isInWishlist(product._id) : false;
  const isOutOfStock = (product.countInStock ?? 0) <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart({ ...product, qty: 1 });
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`}>
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
      </Link>

      <div className="product-info">
        <span className="category">{product.category}</span>
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>{product.name}</h3>
        </Link>
        <p className="price">${product.price.toFixed(2)}</p>

        {/* Action Controls */}
        <div className="product-card-actions">
          {!isSellerView && (
            <button
              type="button"
              className={`add-to-cart ${isOutOfStock ? 'disabled-out-of-stock' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}

          {showWishlist && !isSellerView && (
            <button
              type="button"
              className={`wishlist-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product);
              }}
              title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill={isFavorited ? '#ffffff' : 'none'}
                stroke={isFavorited ? '#ffffff' : '#a4b0be'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;