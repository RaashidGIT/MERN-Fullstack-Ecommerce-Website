// Here contains the logic for the Product model, which represents a product listed by a user, including details about the seller, name, description, price, category, image, stock count, and rating.

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // Seller link: stores the creator's user ObjectId
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: {
      type: String,
      required: true,
      enum: [
        'Manga',
        'Blu-ray/Media',
        'Figurine',
        'Plushie',
        'Game',
        'Apparel',
        'Accessory',
        'Other',
      ],
    },
    image: { type: String, required: true } , // Main cover
    images: [{ type: String }],              // Additional gallery images
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    reviews: [reviewSchema],
    numReviews: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;