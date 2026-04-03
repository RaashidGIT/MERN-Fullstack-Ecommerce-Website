import { Routes, Route, Link } from 'react-router-dom';

import HomeScreen from './pages/HomeScreen';
import ProductScreen from './pages/ProductScreen';
import { useCart } from './context/CartContext';
import CartScreen from './pages/CartScreen';
import CheckoutScreen from './pages/CheckoutScreen';
import Toast from './components/Toast';
import './App.css';

function App() {
  const { cartItems } = useCart();

  // Calculate total items (e.g., 2 manga + 1 plushie = 3)
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="shop-container">
      <Toast /> {/* This will show cart notifications */}
      <header className="main-header">
        <h1 onClick={() => window.location.href='/'} className="logo">
          Anime Merch Store
        </h1>
        
        <div className="cart-container">
          <Link to="/cart" className="cart-container">
            <span className="cart-emoji">🛒</span>
            <span className="cart-badge">{cartCount}</span>
          </Link>
        </div>
      </header>

      <main>
        <Routes>
          {/* Path for the main gallery */}
          <Route path="/" element={<HomeScreen />} />
          {/* Path for a single product (using ID as a parameter) */}
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;