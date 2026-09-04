import { Routes, Route, Link } from 'react-router-dom';

import HomeScreen from './pages/HomeScreen';
import ProductScreen from './pages/ProductScreen';
import { useCart } from './context/CartContext';
import { useUser } from './context/UserContext';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import CartScreen from './pages/CartScreen';
import CheckoutScreen from './pages/CheckoutScreen';
import ProfileScreen from './pages/ProfileScreen';
import AddProductScreen from './pages/AddProductScreen';
import Toast from './components/Toast';
import './App.css';

function App() {
  const { userInfo, logout } = useUser();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="shop-container">
      <Toast />
      <header className="main-header">
        <div className="header-links">
          {userInfo ? (
            <div className="user-menu">
              {/* Profile Link with Solid/Filled Profile Icon */}
              <Link to="/profile" className="profile-nav-link">
                <svg
                  className="user-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
                <span>{userInfo.name}</span>
              </Link>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          ) : (
            /* Login Link with Outlined/Non-filled Profile Icon */
            <Link to="/login" className="login-nav-link">
              <svg
                className="user-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Login</span>
            </Link>
          )}
        </div>

        <Link to="/" className="logo-link">
          <h1 className="logo">Anime Merch Store</h1>
        </Link>
        
        <div className="cart-container">
          <Link to="/cart" className="cart-container">
            <span className="cart-emoji">🛒</span>
            <span className="cart-badge">{cartCount}</span>
          </Link>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/add-product" element={<AddProductScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;