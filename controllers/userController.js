import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get logged-in user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};

// @desc    Toggle add/remove product from user's wishlist
// @route   PUT /api/users/wishlist/:productId
// @access  Private
export const toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure wishlist array exists on older user documents
    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    // Check by comparing string representations of ObjectIds
    const existsIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId.toString()
    );

    if (existsIndex > -1) {
      // Remove item
      user.wishlist.splice(existsIndex, 1);
    } else {
      // Add item
      user.wishlist.push(productId);
    }

    await user.save();

    // Populate full product details
    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ message: error.message || 'Server error updating wishlist' });
  }
};