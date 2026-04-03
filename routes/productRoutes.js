import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// 1. GET all products (Existing)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching products" });
  }
});

// 2. GET a single product by ID
router.get('/:id', async (req, res) => {
  try {
    // req.params.id matches the ":id" in the URL
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    // This catches "CastErrors" (e.g., if the ID format is totally wrong)
    res.status(500).json({ message: "Invalid Product ID format" });
  }
});

export default router;