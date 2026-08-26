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
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Show all products if searchTerm is empty; otherwise filter
  const filteredProducts = searchTerm.trim() === ""
    ? products
    : products.filter((item) => {
        const term = searchTerm.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(term);
        const categoryMatch = item.category?.toLowerCase().includes(term);
        return nameMatch || categoryMatch;
      });

  return (
    <div className="home-container">
      <div className="search-section">
        <input
          type="text"
          value={searchTerm}
          placeholder="Search by name or category (e.g. Manga)..."
          className="search-bar"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading loot..." />
      ) : (
        <div className="product-grid">
        {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))
          ) : searchTerm.trim() !== "" ? (
            <p className="no-products-msg">No matches found for "{searchTerm}"</p>
          ) : (
            <p className="no-products-msg">No products available in the store right now.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomeScreen;