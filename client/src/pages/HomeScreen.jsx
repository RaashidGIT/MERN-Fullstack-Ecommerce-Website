import { useState, useEffect } from 'react';
import ProductCard from '../components/productCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './style/HomeScreen.css';
import '../App.css';  

function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching products..."); // Debug 1
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("Data received:", data); // Debug 2
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err); // Debug 3
        setLoading(false);
      });
  }, []);

  // Logic to filter products based on name or category
  const filteredProducts = Array.isArray(products) 
  ? products.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
  : []; // If products isn't an array, just return an empty list

  return (
    <div className="home-container">
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by name or category (e.g. Manga)..."
          className="search-bar"
          onChange={(e) => setSearchTerm(e.target.value)} // 3. Update state on type
        />
      </div>

        {loading ? (
        <LoadingSpinner message="Loading loot..." /> // <--- Pass the text here
        ) : (
        <div className="product-grid">
            {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
            ))
            ) : (
            <p>No matches found for "{searchTerm}"</p>
            )}
        </div>
        )}
    </div>
  );
}
export default HomeScreen;