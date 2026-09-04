// Here contains the entry point of the React application, which sets up the root rendering, wraps the application with necessary context providers for user, cart, and wishlist management, and enables routing using BrowserRouter.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext';
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider> 
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
)