import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../productCard';

// Displays products put up for sale by the current user
const ListingsTab = ({ userInfo, onListingsCountChange }) => {
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const navigate = useNavigate();

  // Load user listings
  useEffect(() => {
    if (!userInfo?._id) return;
    setLoadingListings(true);

    fetch(`http://localhost:5000/api/products?seller=${userInfo._id}`)
      .then((res) => res.json())
      .then((data) => {
        const userProducts = Array.isArray(data)
          ? data.filter((item) => item.user === userInfo._id || item.seller === userInfo._id)
          : [];
        setMyListings(userProducts);
        if (onListingsCountChange) onListingsCountChange(userProducts.length);
        setLoadingListings(false);
      })
      .catch(() => setLoadingListings(false));
  }, [userInfo]);

  return (
    <section className="profile-section">
      <div className="section-header-flex">
        <h3>Items Listed for Sale</h3>
        <button
          type="button"
          className="create-listing-btn"
          onClick={() => navigate('/add-product')}
        >
          + List New Item
        </button>
      </div>

      {loadingListings ? (
        <p>Loading your listings...</p>
      ) : myListings.length === 0 ? (
        <div className="empty-tab-box">
          <p>You haven't posted any items for sale yet.</p>
          <button
            type="button"
            className="create-listing-btn"
            onClick={() => navigate('/add-product')}
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="profile-products-grid">
          {myListings.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ListingsTab;