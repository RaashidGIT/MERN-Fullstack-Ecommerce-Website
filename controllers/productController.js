// POST /api/products/:id/reviews
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 1. Prevent duplicate reviews by the same user
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // 2. Add review
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    // 3. Recalculate average rating & count
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit review' });
  }
};

// Individual product orders tracking for sellers
// GET /api/products/:id/orders
// Access: Private (Seller only)
export const getProductOrders = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify the requester owns this listing
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized as seller of this product' });
    }

    // Find all orders containing this specific product
    const orders = await Order.find({ 'orderItems.product': req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Extract specific item quantities if orders contain multiple products
    const formattedOrders = orders.map((order) => {
      const item = order.orderItems.find(
        (i) => i.product.toString() === req.params.id
      );
      return {
        _id: order._id,
        buyerName: order.shippingAddress?.fullName || order.user?.name || 'Anonymous',
        buyerEmail: order.user?.email || 'N/A',
        city: order.shippingAddress?.city || 'N/A',
        postalCode: order.shippingAddress?.postalCode || 'N/A',
        country: order.shippingAddress?.country || 'N/A',
        qty: item ? item.qty : 1,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod || 'COD',
        isPaid: Boolean(order.isPaid),
        isCancelled: Boolean(order.isCancelled),
        isDelivered: Boolean(order.isDelivered),
      };
    });

    res.json({ product, orders: formattedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Entire product orders tracking for sellers
// controllers/orderController.js
export const getSellerAllOrders = async (req, res) => {
  try {
    const sellerId = req.user._id.toString();

    // 1. Find all active product IDs created by this user
    const sellerProducts = await Product.find({ user: req.user._id }).select('_id');
    const sellerProductIds = sellerProducts.map((p) => p._id.toString());

    // 2. Find orders matching these product IDs or containing a seller field
    const orders = await Order.find({
      $or: [
        { 'orderItems.product': { $in: sellerProductIds } },
        { 'orderItems.seller': req.user._id },
      ],
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const formattedRows = [];

    orders.forEach((order) => {
      if (!Array.isArray(order.orderItems)) return;

      order.orderItems.forEach((item) => {
        const itemProdId = item.product ? item.product.toString() : null;
        const itemSellerId = item.seller ? item.seller.toString() : null;

        // Include item if it belongs to this seller
        const isMyProduct = 
          (itemProdId && sellerProductIds.includes(itemProdId)) ||
          itemSellerId === sellerId;

        if (isMyProduct) {
          formattedRows.push({
            orderId: order._id.toString(),
            productName: item.name || 'Delisted Item',
            productImage: item.image || '',
            buyerName: order.shippingAddress?.fullName || order.user?.name || 'Anonymous',
            buyerEmail: order.user?.email || 'N/A',
            city: order.shippingAddress?.city || 'N/A',
            postalCode: order.shippingAddress?.postalCode || 'N/A',
            country: order.shippingAddress?.country || 'N/A',
            qty: item.qty || 1,
            price: item.price || 0,
            total: ((item.qty || 1) * (item.price || 0)).toFixed(2),
            createdAt: order.createdAt,
            paymentMethod: order.paymentMethod || 'COD',
            isPaid: Boolean(order.isPaid),
            isDelivered: Boolean(order.isDelivered),
            isCancelled: Boolean(order.isCancelled),
          });
        }
      });
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('getSellerAllOrders Error:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching orders' });
  }
};