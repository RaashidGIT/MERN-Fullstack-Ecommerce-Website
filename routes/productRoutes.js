// Here contains the logic for product routes, including creating, fetching, and deleting products, as well as fetching user-specific listings.

import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 1. POST create a new product (// routes/productRoutes.js)
router.post('/', protect, async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;

    const product = new Product({
      user: req.user._id,
      name,
      price: Number(price),
      user: req.user._id,
      seller: req.user._id,
      image,
      category,
      countInStock: Number(countInStock) || 1,
      description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET mylistings for the logged-in user
router.get('/mylistings', protect, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user listings' });
  }
});

// 2. GET single product by ID (MUST be AFTER /mylistings)
router.get('/:id', async (req, res) => {
  try {
    // Populates the user field with just their name and email
    const product = await Product.findById(req.params.id).populate('user', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE mylistings (/api/products/:id)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure the requester owns the listing or is an admin
    const ownerId = (product.user || product.seller)?.toString();
    const requesterId = req.user._id?.toString();

    if (ownerId !== requesterId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message || 'Server error deleting listing' });
  }
});

export default router;