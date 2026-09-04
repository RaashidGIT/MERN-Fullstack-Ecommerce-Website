// Here contains the logic for the wishlist context, which manages the state of the user's wishlist, including adding, removing, and updating items, as well as persisting the wishlist state in localStorage.

import { useContext } from 'react';
import { WishlistContext } from './WishlistContext';

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};