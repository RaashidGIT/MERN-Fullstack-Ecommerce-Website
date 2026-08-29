import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { userInfo } = useUser();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Fetch from DB when user logs in, or fallback to guest localStorage
  useEffect(() => {
    if (userInfo && userInfo.token) {
      setLoadingWishlist(true);
      fetch('http://localhost:5000/api/users/wishlist', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setWishlistItems(Array.isArray(data) ? data : []);
          setLoadingWishlist(false);
        })
        .catch((err) => {
          console.error('Failed to load wishlist from DB:', err);
          setLoadingWishlist(false);
        });
    } else {
      // Guest mode: Read from localStorage
      const guestSaved = localStorage.getItem('guestWishlist');
      setWishlistItems(guestSaved ? JSON.parse(guestSaved) : []);
    }
  }, [userInfo]);

  // Toggle wishlist item handler
  const toggleWishlist = useCallback(
    async (product) => {
      // 1. Authenticated Mode: Send update to MongoDB
      if (userInfo && userInfo.token) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/users/wishlist/${product._id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
              },
            }
          );
          const data = await res.json();
          if (res.ok) {
            setWishlistItems(data);
          }
        } catch (error) {
          console.error('Failed to sync wishlist with DB:', error);
        }
      } else {
        // 2. Guest Mode: Update state and localStorage
        setWishlistItems((prev) => {
          const exists = prev.some((item) => item._id === product._id);
          const updated = exists
            ? prev.filter((item) => item._id !== product._id)
            : [...prev, product];
          localStorage.setItem('guestWishlist', JSON.stringify(updated));
          return updated;
        });
      }
    },
    [userInfo]
  );

  const isInWishlist = (id) => wishlistItems.some((item) => item._id === id);

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, toggleWishlist, isInWishlist, loadingWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};