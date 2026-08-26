import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [notification, setNotification] = useState(null);

    // Accept qty with a fallback default of 1
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

        // Trigger notification with quantity count
        const countText = quantityToAdd > 1 ? ` (${quantityToAdd})` : '';
        setNotification(`${product.name}${countText} added to cart! 🚀`);

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

// Custom hook for easy use
export const useCart = () => {
    const context = useContext(CartContext);
    
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    
    return context;
};