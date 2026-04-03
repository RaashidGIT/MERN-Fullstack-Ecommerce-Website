import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// 1. Load Environment Variables FIRST
dotenv.config();

// 2. Initialize the app
const app = express();

// 3. Global Middleware (Must come BEFORE routes)
app.use(cors());
app.use(express.json());

// 4. Routes 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// 5. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Connection Error:", err));

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});