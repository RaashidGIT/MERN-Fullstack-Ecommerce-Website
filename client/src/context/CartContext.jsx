import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // 1. Add a new state for the message
    const [notification, setNotification] = useState(null);

    // Add to Cart Logic
    const addToCart = (product) => {
    console.log("1. Add to Cart triggered for:", product.name); // DEBUG 1
    
    setCartItems((prevItems) => {
        const existItem = prevItems.find((x) => x._id === product._id);
        
        if (existItem) {
        console.log("2. Item exists, increasing qty"); // DEBUG 2
        return prevItems.map((x) =>
            x._id === product._id ? { ...existItem, qty: existItem.qty + 1 } : x
        );
        }
        
        console.log("3. New item added to cart"); // DEBUG 3
        return [...prevItems, { ...product, qty: 1 }];
    });

    // Trigger the notification
        setNotification(`${product.name} added to cart! 🚀`);

        // 3. Auto-hide after 3 seconds
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    // Remove from Cart
    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((x) => x._id !== id));
    };

    // 1. Increase Qty
    const increaseQty = (id) => {
    setCartItems(prev =>
        prev.map(item =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
        )
    );
    };

    // 2. Decrease Qty
    const decreaseQty = (id) => {
    setCartItems(prev =>
        prev.map(item =>
        item._id === id && item.qty > 1 
            ? { ...item, qty: item.qty - 1 } 
            : item
        )
    );
    };

    // 3. Clear Cart
    const clearCart = () => {
        setCartItems([]);
    };

    return (
    <CartContext.Provider value={{ 
        cartItems,        // <--- Make sure this is here!
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

// Custom hook for easy use
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context; // This returns EVERYTHING in the 'value' prop of the Provider
};