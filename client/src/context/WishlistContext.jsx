// Here contains the logic for the wishlist context, which manages the state of the user's wishlist, including adding, removing, and updating items, as well as persisting the wishlist state in localStorage.

import { createContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { userInfo } = useUser();
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = useCallback(() => {
    if (userInfo && userInfo.token) {
      fetch('http://localhost:5000/api/users/wishlist', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      })
        .then((res) => res.json())
        .then((data) => setWishlistItems(Array.isArray(data) ? data : []))
        .catch((err) => console.error('Error fetching wishlist:', err));
    } else {
      const guestSaved = localStorage.getItem('guestWishlist');
      setWishlistItems(guestSaved ? JSON.parse(guestSaved) : []);
    }
  }, [userInfo]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (product) => {
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
          console.error('Failed to update wishlist:', error);
        }
      } else {
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
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}