// Here contains the logic for order routes, including creating orders, cancelling orders, and managing stock levels in response to order actions.

import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Helper function that initializes only when called
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials missing from environment variables');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/orders/razorpay/create-order
// Access: Private
// POST /api/orders/razorpay/create-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: error.message || 'Failed to initiate Razorpay order' });
  }
};

// POST /api/orders/razorpay/verify
// Access: Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // MongoDB _id
    } = req.body;

    // Cryptographic HMAC SHA256 Signature Verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature! Fraud detected.' });
    }

    // Update the existing order in MongoDB
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'succeeded',
      update_time: Date.now(),
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();
    res.status(200).json({ message: 'Payment verified successfully', order: updatedOrder });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// POST /api/orders - Create order, decrement stock & clean user wishlist
export const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Validate inventory before modifying anything
    for (const item of orderItems) {
      const productId = item.product || item._id;
      const requestedQty = Number(item.qty || item.quantity || 1);

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: `Product "${item.name}" not found.` });
      }

      if (product.countInStock < requestedQty) {
        return res.status(400).json({
          message: product.countInStock <= 0
            ? `"${product.name}" is out of stock.`
            : `Only ${product.countInStock} left in stock for "${product.name}".`,
        });
      }
    }

    // 1. Create and save the order
    const order = new Order({
      orderItems: orderItems.map((item) => ({
        name: item.name,
        qty: Number(item.qty || item.quantity || 1),
        image: item.image,
        price: item.price,
        product: item.product || item._id, // Ensure Product ObjectId is saved
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod: order.paymentMethod || 'COD',
      totalPrice,
    });

    const createdOrder = await order.save();

    // 2. Decrement stock for each purchased item
    for (const item of orderItems) {
      const productId = item.product || item._id;
      const qtyPurchased = Number(item.qty || item.quantity || 1);

      await Product.findByIdAndUpdate(
        productId,
        { $inc: { countInStock: -qtyPurchased } },
        { new: true }
      );
    }

    // 3. Remove purchased items from the user's wishlist
    const purchasedProductIds = orderItems.map((item) => (item.product || item._id).toString());
    const user = await User.findById(req.user._id);

    if (user && Array.isArray(user.wishlist)) {
      user.wishlist = user.wishlist.filter(
        (wishId) => !purchasedProductIds.includes(wishId.toString())
      );
      await user.save();
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Add order items error:', error);
    res.status(500).json({ message: error.message || 'Failed to add order items' });
  }
};

// PUT /api/orders/:id/cancel - Restores stock if within 10-minute window
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.isCancelled) {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // 10-minute cancellation grace period
    const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
    const GRACE_PERIOD_MS = 10 * 60 * 1000;

    if (orderAgeMs > GRACE_PERIOD_MS) {
      return res.status(400).json({
        message: 'Order cancellation window has expired (10 minutes max).',
      });
    }

    // 1. Mark order as cancelled
    order.isCancelled = true;
    order.cancelledAt = Date.now();
    const updatedOrder = await order.save();

    // 2. Increment stock back for all items in the order
    for (const item of order.orderItems) {
      const productId = item.product || item._id;
      const qtyRestored = Number(item.qty || item.quantity || 1);

      console.log(`Restocking Product ${productId} by +${qtyRestored}`);

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { countInStock: qtyRestored } },
        { new: true }
      );

      console.log(
        'Product restocked:',
        updatedProduct ? `${updatedProduct.name} - New Stock: ${updatedProduct.countInStock}` : 'NOT FOUND'
      );
    }

    res.json({ message: 'Order cancelled and stock restored successfully', order: updatedOrder });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel order' });
  }
};

// PUT /api/orders/:id/deliver
// Access: Private (Seller / Admin)
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Set delivery state
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    // If COD, delivery confirms cash collection -> mark as paid
    if (order.paymentMethod === 'COD') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Delivery update error:', error);
    res.status(500).json({ message: error.message || 'Failed to update delivery status' });
  }
};