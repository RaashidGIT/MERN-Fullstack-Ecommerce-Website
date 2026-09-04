// Here contains the logic for order routes, including creating orders, cancelling orders, and managing stock levels in response to order actions.

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

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
      paymentMethod: paymentMethod || 'Cash on Delivery',
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