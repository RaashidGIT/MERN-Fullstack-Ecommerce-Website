import mongoose from 'mongoose';

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
    image: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;