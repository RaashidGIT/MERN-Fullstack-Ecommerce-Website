import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './style/ProductScreen.css';
import '../App.css';  

const ProductScreen = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
        } else {
          setError(data.message);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch product");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
            Status: {product.countInStock > 0 ? (
              <span className="in-stock">In Stock ({product.countInStock} available)</span>
            ) : (
              <span className="out-of-stock">Currently Sold Out</span>
            )}
          </div>

          <button 
            className="add-to-cart-btn" 
            disabled={product.countInStock === 0}
            onClick={() => addToCart(product)}
          >
            {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;