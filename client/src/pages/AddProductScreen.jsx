import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './style/AddProductScreen.css';

const AddProductScreen = () => {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  // Mode toggle: local disk upload vs. direct web link
  const [imageMode, setImageMode] = useState('picker'); // 'picker' | 'url'
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Form field state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Manga',
    countInStock: 1,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Route guard: unauthenticated users cannot access listing creation
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  // Generic controlled input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Keep URL-based preview in sync
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  // Uploads local file to Multer endpoint and stores public path
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadPayload = new FormData();
    uploadPayload.append('image', file);
    setUploading(true);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: uploadPayload,
      });

      if (res.ok) {
        const filePath = await res.text();
        const fullPath = `http://localhost:5000${filePath}`;
        setFormData((prev) => ({ ...prev, image: fullPath }));
        setImagePreview(fullPath);
      } else {
        alert('Image upload failed. Ensure the file is a supported image format.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Error uploading file to server.');
    } finally {
      setUploading(false);
    }
  };

  // Submits product document to backend with seller authorization
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.image) {
      setError('Please provide an image either via upload or direct URL.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(formData),
      });

      // Safely parse JSON or text to avoid HTML 404/500 JSON crash
      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: `Server error (${res.status}): Please check backend route.` };
      }

      if (res.ok) {
        alert('Product listed successfully! 🎉');
        navigate('/profile', { state: { defaultTab: 'listings' } });
      } else {
        setError(responseData.message || 'Failed to list product.');
      }
    } catch (err) {
      console.error('Listing submit error:', err);
      setError('Server connection error. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2>List an Anime Item for Sale</h2>
        <p className="subtitle-text">Fill in the details to publish your product to the store.</p>

        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label htmlFor="name">Product Title</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Chainsaw Man Pochita Plushie"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($USD)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.5"
                placeholder="24.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Manga">Manga</option>
                <option value="Figures">Figures</option>
                <option value="Apparel">Apparel</option>
                <option value="Media">Media / Blu-ray</option>
                <option value="Collectibles">Collectibles</option>
              </select>
            </div>
          </div>

          {/* Dual-Mode Image Input */}
          <div className="form-group image-selection-group">
            <label>Product Image</label>
            <div className="image-mode-toggle">
              <button
                type="button"
                className={`toggle-tab-btn ${imageMode === 'picker' ? 'active' : ''}`}
                onClick={() => setImageMode('picker')}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                className={`toggle-tab-btn ${imageMode === 'url' ? 'active' : ''}`}
                onClick={() => setImageMode('url')}
              >
                🔗 Image URL
              </button>
            </div>

            {imageMode === 'picker' ? (
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                />
                {uploading && <p className="uploading-text">Uploading image...</p>}
              </div>
            ) : (
              <input
                id="image"
                name="image"
                type="text"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={handleChange}
              />
            )}

            {imagePreview && (
              <div className="image-preview-box">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="countInStock">Stock Quantity</label>
            <input
              id="countInStock"
              name="countInStock"
              type="number"
              min="1"
              value={formData.countInStock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Describe condition, dimensions, authenticity..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel-listing"
              onClick={() => navigate('/profile', { state: { defaultTab: 'listings' } })}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit-listing" disabled={loading || uploading}>
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductScreen;