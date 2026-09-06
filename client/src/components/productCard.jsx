import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/useWishlist';
import StarRating from './StarRating';
import './style/ProductCard.css';

const ProductCard = ({ 
  product, 
  showWishlist = true, 
  isSellerView = false, 
  children 
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = typeof isInWishlist === 'function' ? isInWishlist(product._id) : false;
  const isOutOfStock = (product.countInStock ?? 0) <= 0;
  const isLongTitle = product.name.length > 28;

  // Branch link target: Sellers go to orders list, buyers go to public store page
  const targetLink = isSellerView 
    ? `/seller/product/${product._id}/orders` 
    : `/product/${product._id}`;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart({ ...product, qty: 1 });
    }
  };

  return (
    <div className="product-card">
      {/* 1. Use targetLink on the image */}
      <Link to={targetLink}>
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
      </Link>

      <div className="product-info">
        <span className="category">{product.category}</span>

        {/* 2. Use targetLink on the title */}
        <Link to={targetLink} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className={`product-name ${isLongTitle ? 'long-title' : ''}`}>
            {isLongTitle ? (
              <span className="marquee-track">
                <span className="marquee-text">{product.name}</span>
                <span className="marquee-text" aria-hidden="true">{product.name}</span>
              </span>
            ) : (
              product.name
            )}
          </h3>
        </Link>

        {/* Aggregate Rating Section */}
        <StarRating 
          rating={product.rating || 0} 
          numReviews={product.numReviews || 0} 
          idPrefix={product._id} 
        />

        <p className="price">${product.price.toFixed(2)}</p>

        {/* Regular Buyer Controls */}
        {!isSellerView && (
          <div className="product-card-actions">
            <button
              type="button"
              className={`add-to-cart ${isOutOfStock ? 'disabled-out-of-stock' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {showWishlist && (
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
        )}

        {/* Seller Restock Controls Injected Into Blank Card Space */}
        {isSellerView && children}
      </div>
    </div>
  );
};

export default ProductCard;