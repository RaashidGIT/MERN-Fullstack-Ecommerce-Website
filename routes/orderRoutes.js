// Here contains the logic for order routes, including creating orders, cancelling orders, and managing stock levels in response to order actions.

import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { addOrderItems, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/orders - Creates order, decrements stock & cleans wishlist
router.post('/', protect, addOrderItems);

// GET /api/orders/myorders - Fetch logged-in user's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { user: new mongoose.Types.ObjectId(req.user._id) },
      ],
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/cancel - Cancels order and restores stock
router.put('/:id/cancel', protect, cancelOrder);

export default router;