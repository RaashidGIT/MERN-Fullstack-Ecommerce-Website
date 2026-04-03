import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './style/ProductCard.css';
import '../App.css';  

const ProductCard = ({ product }) => {
  const { addToCart } = useCart(); // Grab the function from the cloud

  return (
    <div className="product-card">
      {/* Link to the specific product ID */}
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
        <button className="add-to-cart" 
          onClick={() => {
            console.log("0. Button Clicked!"); // DEBUG 0
            addToCart(product);
          }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;