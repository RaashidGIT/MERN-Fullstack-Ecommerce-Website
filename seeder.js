import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: "Jujutsu Kaisen - Vol. 1",
    description: "The beginning of Yuji Itadori's journey into the world of curses.",
    price: 9.99,
    category: "Manga",
    image: "https://m.media-amazon.com/images/I/81TmHlRleJL._SY425_.jpg",
    countInStock: 50,
  },
  {
    name: "Neon Genesis Evangelion: Unit-01 Figurine",
    description: "Highly detailed 6-inch collectible figure with interchangeable hands.",
    price: 45.00,
    category: "Figurine",
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQk83dyDQgPZiTixXZCjKLdvgCm-uvNksqsUt7p_7f52bqWtD4WKUttGk3pI5CzOothEGjKnTiyhYxxIinKsFZD2B9O35xjDPietnz1OOl5DpTQPCist6K9fpBxTd4XbJRfwGSHP_4&usqp=CAc",
    countInStock: 10,
  },
  {
    name: "Pochita Plushie - Chainsaw Man",
    description: "Soft, huggable 12-inch Pochita plush with a cord tail.",
    price: 25.99,
    category: "Plushie",
    image: "https://m.media-amazon.com/images/I/61i+GTCAjCL._SY450_.jpg",
    countInStock: 15,
  },
  {
    name: "Your Name (Kimi no Na wa) Blu-ray",
    description: "Collector's edition featuring the hit film by Makoto Shinkai.",
    price: 19.99,
    category: "Blu-ray",
    image: "https://www.lasering.ee/media/catalog/product/cache/1/image/600x600/9df78eab33525d08d6e5fb8d27136e95/5/0/5037899064290.jpg",
    countInStock: 25,
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing products to avoid duplicates
    await Product.deleteMany();
    
    // Insert the sample list
    await Product.insertMany(sampleProducts);

    console.log('🎁 Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();