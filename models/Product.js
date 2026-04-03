import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  category: { 
    type: String, 
    required: true, 
    enum: ['Manga', 'Blu-ray', 'Figurine', 'Plushie', 'Game'] 
  },
  image: { type: String, required: true }, // URL to the image
  countInStock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

const Product = mongoose.model('Product', productSchema);
export default Product;