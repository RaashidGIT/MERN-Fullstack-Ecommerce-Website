import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './style/AddProductScreen.css';

const AddProductScreen = () => {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  // Mode toggles: 'picker' | 'url'
  const [coverMode, setCoverMode] = useState('picker');
  const [galleryMode, setGalleryMode] = useState('picker');

  // Loading states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingExtras, setUploadingExtras] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Gallery URLs (array internally for previews/sync)
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Manga',
    countInStock: 1,
    description: '',
  });

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Single Cover Upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const payload = new FormData();
    payload.append('image', file);
    setUploadingCover(true);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: payload,
      });

      if (res.ok) {
        const filePath = await res.text();
        setFormData((prev) => ({ ...prev, image: `http://localhost:5000${filePath}` }));
      } else {
        alert('Cover upload failed. Ensure the file is an image format.');
      }
    } catch (err) {
      alert('Error uploading cover to server.');
    } finally {
      setUploadingCover(false);
    }
  };

  // 2. Multi-Image Gallery Upload
  const handleGalleryFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingExtras(true);
    const newUrls = [];

    try {
      for (const file of files) {
        const payload = new FormData();
        payload.append('image', file);

        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: payload,
        });

        if (res.ok) {
          const filePath = await res.text();
          newUrls.push(`http://localhost:5000${filePath}`);
        }
      }

      setGalleryImages((prev) => {
        const updated = [...prev, ...newUrls];
        setGalleryUrlInput(updated.join(', '));
        return updated;
      });
    } catch (err) {
      alert('Error uploading additional images.');
    } finally {
      setUploadingExtras(false);
    }
  };

  // Sync manual comma-separated text input to gallery array
  const handleGalleryUrlChange = (e) => {
    const val = e.target.value;
    setGalleryUrlInput(val);
    const parsed = val
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
    setGalleryImages(parsed);
  };

  const removeGalleryImage = (indexToRemove) => {
    setGalleryImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      setGalleryUrlInput(updated.join(', '));
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.image) {
      setError('Please provide a primary cover image.');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      countInStock: Number(formData.countInStock),
      images: galleryImages,
    };

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: `Server error (${res.status})` };
      }

      if (res.ok) {
        alert('Product listed successfully! 🎉');
        navigate('/profile', { state: { defaultTab: 'listings' } });
      } else {
        setError(responseData.message || 'Failed to list product.');
      }
    } catch (err) {
      setError('Server connection error. Please verify backend is running.');
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

          <div className="form-row-three">
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
              <label htmlFor="countInStock">Stock</label>
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
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Manga">Manga</option>
                <option value="Blu-ray/Media">Blu-ray/Media</option>
                <option value="Figurine">Figurine</option>
                <option value="Plushie">Plushie</option>
                <option value="Game">Game</option>
                <option value="Apparel">Apparel</option>
                <option value="Accessory">Accessory</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* 1. Primary Cover Image Section */}
          <div className="form-group image-selection-group">
            <label>Primary Cover Image</label>
            <div className="image-mode-toggle">
              <button
                type="button"
                className={`toggle-tab-btn ${coverMode === 'picker' ? 'active' : ''}`}
                onClick={() => setCoverMode('picker')}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                className={`toggle-tab-btn ${coverMode === 'url' ? 'active' : ''}`}
                onClick={() => setCoverMode('url')}
              >
                🔗 Image URL
              </button>
            </div>

            {coverMode === 'picker' ? (
              <div className="file-input-wrapper">
                <label htmlFor="coverFile" className="file-choose-label">
                  📁 Choose File
                </label>
                <input
                  type="file"
                  id="coverFile"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleCoverUpload}
                />
                <span className="file-chosen-name">
                  {uploadingCover
                    ? 'Uploading image...'
                    : formData.image
                    ? formData.image.split('/').pop()
                    : 'No file chosen'}
                </span>
              </div>
            ) : (
              <input
                id="image"
                name="image"
                type="text"
                placeholder="https://example.com/cover.jpg"
                value={formData.image}
                onChange={handleChange}
              />
            )}

            {formData.image && (
              <div className="image-preview-box">
                <img src={formData.image} alt="Cover Preview" />
              </div>
            )}
          </div>

          {/* 2. Additional Gallery Images Section */}
          <div className="form-group image-selection-group">
            <label>Additional Gallery Angles (Optional)</label>
            <div className="image-mode-toggle">
              <button
                type="button"
                className={`toggle-tab-btn ${galleryMode === 'picker' ? 'active' : ''}`}
                onClick={() => setGalleryMode('picker')}
              >
                📁 Upload Files (Multi)
              </button>
              <button
                type="button"
                className={`toggle-tab-btn ${galleryMode === 'url' ? 'active' : ''}`}
                onClick={() => setGalleryMode('url')}
              >
                🔗 Image URLs
              </button>
            </div>

            {galleryMode === 'picker' ? (
              <div className="file-input-wrapper">
                <label htmlFor="galleryFiles" className="file-choose-label">
                  📁 Choose Files
                </label>
                <input
                  type="file"
                  id="galleryFiles"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={handleGalleryFilesUpload}
                />
                <span className="file-chosen-name">
                  {uploadingExtras
                    ? 'Uploading images...'
                    : galleryImages.length > 0
                    ? `${galleryImages.length} image(s) selected`
                    : 'No files chosen'}
                </span>
              </div>
            ) : (
              <input
                id="extraImages"
                type="text"
                placeholder="Comma-separated image URLs (e.g. https://.../1.jpg, https://.../2.jpg)"
                value={galleryUrlInput}
                onChange={handleGalleryUrlChange}
              />
            )}

            {/* Gallery Thumbnails List */}
            {galleryImages.length > 0 && (
              <div className="gallery-previews-container">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="preview-chip">
                    <img src={url} alt={`Angle ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-chip-btn"
                      onClick={() => removeGalleryImage(idx)}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
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
            <button
              type="submit"
              className="btn-submit-listing"
              disabled={loading || uploadingCover || uploadingExtras}
            >
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductScreen;