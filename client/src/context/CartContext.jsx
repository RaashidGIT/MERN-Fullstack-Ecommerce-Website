// Here contains the logic for the cart context, which manages the state of the shopping cart, including adding, removing, and updating items, as well as persisting the cart state in localStorage.

import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load saved cart from localStorage on initial render
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [notification, setNotification] = useState(null);

  // Save cart to localStorage whenever it updates
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item or increment qty if it already exists
  const addToCart = (product, qty = 1) => {
    const quantityToAdd = Number(qty) || 1;

    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x._id === product._id);
      
      if (existItem) {
        return prevItems.map((x) =>
          x._id === product._id 
            ? { ...existItem, qty: existItem.qty + quantityToAdd } 
            : x
        );
      }
      return [...prevItems, { ...product, qty: quantityToAdd }];
    });

    // Show temporary notification
    const countText = quantityToAdd > 1 ? ` (${quantityToAdd})` : '';
    setNotification(`${product.name}${countText} added to cart! 🚀`);

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Remove item by ID
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  // Increment item quantity
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // Decrement item quantity (minimum 1)
  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id && item.qty > 1 
          ? { ...item, qty: item.qty - 1 } 
          : item
      )
    );
  };

  // Empty the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems,
      addToCart, 
      removeFromCart, 
      notification,
      increaseQty, 
      decreaseQty, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook for accessing cart state
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};