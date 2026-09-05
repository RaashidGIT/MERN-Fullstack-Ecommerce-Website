// Here contains the logic for the Product screen, which displays detailed information about a specific product, allows users to select quantity, and add the product to their shopping cart.

import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductReviews from '../pages/ProductReviews';
import './style/ProductScreen.css';
import '../App.css';

const ProductScreen = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProduct(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDecrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrease = () => {
    if (qty < product.countInStock) setQty(qty + 1);
  };

  const isOutOfStock = !product || (product.countInStock ?? 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, qty);
  };

  if (loading) return <LoadingSpinner message="Inspecting anime gear..." />;
  if (error) return <div className="error-msg">{error} <Link to="/">Go Back</Link></div>;

  return (
    <div className="product-page">
      <Link to="/" className="back-link">← Back to Collection</Link>

      <div className="product-details-container">
        <div className="product-page-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-page-info">
          <span className="page-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="page-price">${product.price.toFixed(2)}</p>
          <p className="page-description">{product.description}</p>

          <div className="stock-status">
            Status:{' '}
            {!isOutOfStock ? (
              <span className="in-stock">In Stock ({product.countInStock} available)</span>
            ) : (
              <span className="out-of-stock">Currently Sold Out</span>
            )}
          </div>

          {/* Category & Seller Row */}
          <div className="product-meta-header">
            <div className="seller-badge">
              <span>Sold by :</span>
              <strong>{product.user?.name || 'Verified Store'}</strong>
            </div>
          </div>

          {/* Quantity Counter Section */}
          {!isOutOfStock && (
            <div className="qty-picker-container">
              <span className="qty-label">Quantity:</span>
              <div className="qty-controls">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={qty <= 1}
                >
                  -
                </button>
                <span className="qty-num">{qty}</span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={qty >= product.countInStock}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className="add-to-cart-btn"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {!isOutOfStock ? `Add ${qty} to Cart` : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Standalone Modular Reviews Section */}
      <ProductReviews product={product} onReviewAdded={fetchProduct} />
    </div>
  );
};

export default ProductScreen;