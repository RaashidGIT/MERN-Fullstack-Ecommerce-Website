import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/useWishlist';
import './style/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorited = isInWishlist(product._id);

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

        {/* Buttons in a single row */}
        <div className="product-actions">
          <button
            type="button"
            className="add-to-cart"
            onClick={() => {
              console.log("0. Button Clicked!");
              addToCart(product);
            }}
          >
            Add to Cart
          </button>

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
              fill={isFavorited ? '#ff4757' : 'none'}
              stroke={isFavorited ? '#ff4757' : '#a4b0be'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;