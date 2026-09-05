// Here contains the logic for the Product screen, which displays detailed information about a specific product, allows users to select quantity, and add the product to their shopping cart.

import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionOverflowing, setDescriptionOverflowing] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [imageHeight, setImageHeight] = useState(null);

  const imageRef = useRef(null);

  // Gallery & Zoom State
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const descriptionRef = useRef(null);

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

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageHeight(imageRef.current.clientHeight);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

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

  useEffect(() => {
  if (!descriptionRef.current || !product?.description) return;

  const element = descriptionRef.current;

  setDescriptionOverflowing(element.scrollHeight > element.clientHeight);
}, [product]);

  if (loading) return <LoadingSpinner message="Inspecting anime gear..." />;
  if (error) return <div className="error-msg">{error} <Link to="/">Go Back</Link></div>;

  const allImages = product
    ? [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean)
    : [];

  const currentImage = allImages[activeImgIndex] || product?.image || '';

  return (
    <div className="product-page">
      <Link to="/" className="back-link">← Back to Collection</Link>

      <div
        className={`product-details-container ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
        style={!isExpanded && imageHeight ? { minHeight: `${imageHeight + 80}px` } : {}}
      >
        {/* Left Gallery Column */}
        <div className="product-gallery-column">
          <div className="main-image-viewport" onClick={() => setIsZoomed(true)}>
            <img
              ref={imageRef}
              src={currentImage}
              alt={product.name}
              onLoad={handleImageLoad}
              className="gallery-main-img"
            />

            {/* Left / Right Arrow Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow-btn left"
                  onClick={handlePrevImage}
                  title="Previous image"
                >
                  &#10094;
                </button>
                <button
                  type="button"
                  className="gallery-arrow-btn right"
                  onClick={handleNextImage}
                  title="Next image"
                >
                  &#10095;
                </button>
              </>
            )}

            <div className="zoom-hint">Expand🔍</div>
          </div>

          {/* Small Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="thumbnail-strip">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  className={`thumbnail-btn ${activeImgIndex === index ? 'active-thumb' : ''}`}
                  onClick={() => setActiveImgIndex(index)}
                >
                  <img src={imgUrl} alt={`View ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Product Details Column */}
        <div className="product-page-info">
          <span className="page-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="page-price">${product.price.toFixed(2)}</p>
          <div className={`description-container ${descriptionExpanded ? 'expanded' : ''}`}>
            <p ref={descriptionRef} className="page-description">
              {product.description}
            </p>

            {descriptionOverflowing && (
              <button
                type="button"
                className="description-toggle"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              >
                {descriptionExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>

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

      {/* Fullscreen Lightbox Zoom Modal */}
      {isZoomed && (
        <div className="zoom-modal-backdrop" onClick={() => setIsZoomed(false)}>
          <button
            type="button"
            className="zoom-close-btn"
            onClick={() => setIsZoomed(false)}
          >
            ✕
          </button>
          <img
            src={currentImage}
            alt={`${product.name} zoomed`}
            className="zoom-modal-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Standalone Modular Reviews Section */}
      <ProductReviews product={product} onReviewAdded={fetchProduct} />
    </div>
  );
};

export default ProductScreen;