// Here contains the logic for the Home screen, which displays a list of products fetched from the backend API, allows users to search, filter by category, and sort the products based on different criteria.

import { useState, useEffect } from 'react';
import ProductCard from '../components/productCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './style/HomeScreen.css';
import '../App.css';

function HomeScreen({ searchTerm = '' }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  // Extract unique categories dynamically from products
  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // 1. Filter by search term and selected category
  const filteredProducts = products.filter((item) => {
    const term = (searchTerm || '').toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(term);
    const categoryMatch = item.category?.toLowerCase().includes(term);
    const matchesSearch = term.trim() === '' || nameMatch || categoryMatch;

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // 2. Sort the filtered list
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name-az') return a.name.localeCompare(b.name);
    if (sortBy === 'name-za') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="home-container">
      {/* Filter and Sort Controls */}
      <div className="filter-controls-container">
        {/* Category Chips */}
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="sort-wrapper">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="default">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A to Z</option>
            <option value="name-za">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <LoadingSpinner message="Loading loot..." />
      ) : (
        <div className="product-grid">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))
          ) : (searchTerm || '').trim() !== '' || selectedCategory !== 'All' ? (
            <p className="no-products-msg">No products found matching your criteria.</p>
          ) : (
            <p className="no-products-msg">No products available in the store right now.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomeScreen;