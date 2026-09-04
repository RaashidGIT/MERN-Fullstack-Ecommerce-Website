// import mongoose from 'mongoose';

// router.get('/myorders', protect, async (req, res) => {
//   try {
//     console.log('Fetching orders for user ID:', req.user._id);

//     // Search by ObjectId or string ID
//     const orders = await Order.find({
//       $or: [
//         { user: req.user._id },
//         { user: new mongoose.Types.ObjectId(req.user._id) },
//       ],
//     }).sort({ createdAt: -1 });

//     console.log('Found orders in DB:', orders.length);
//     res.json(orders);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ message: error.message });
//   }
// });