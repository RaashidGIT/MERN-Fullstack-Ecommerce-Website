import mongoose from 'mongoose';

import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new order & remove purchased items from wishlist
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;
    
    // Log to terminal to confirm the user ID is reaching the controller
    console.log('User creating order:', req.user?._id);

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // 1. Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod: paymentMethod || 'Cash on Delivery',
    });

    const savedOrder = await order.save();

    // 2. Remove purchased items from the user's wishlist in MongoDB
    const purchasedProductIds = orderItems.map((item) => item.product.toString());
    const user = await User.findById(req.user._id);

    if (user && Array.isArray(user.wishlist)) {
      user.wishlist = user.wishlist.filter(
        (wishId) => !purchasedProductIds.includes(wishId.toString())
      );
      await user.save();
    }

    // Re-fetch the populated user wishlist
    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.status(201).json({
      order: savedOrder,
      updatedWishlist: updatedUser ? updatedUser.wishlist : [],
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Error processing order' });
  }
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    console.log('Fetching orders for user ID:', req.user._id);

    // Search by ObjectId or string ID
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { user: new mongoose.Types.ObjectId(req.user._id) },
      ],
    }).sort({ createdAt: -1 });

    console.log('Found orders in DB:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Cancel order within 10 minutes
// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.isCancelled) {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // 10-Minute server check
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const tenMinutesInMs = 10 * 60 * 1000;

    if (currentTime - orderTime > tenMinutesInMs) {
      return res.status(400).json({ message: 'Order cannot be cancelled anymore' });
    }

    // Explicitly update and save in MongoDB
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { isCancelled: true } },
      { new: true } // Returns the updated document
    );

    console.log('Order successfully cancelled in DB:', updatedOrder);
    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    console.error('Cancel order DB error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;