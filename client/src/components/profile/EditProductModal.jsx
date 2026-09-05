// Here contains the logic for the profile page basic skeleton, including the listings tab, order history tab, wishlist tab, and account tab.

import { useState, useEffect } from 'react';
import './style/EditProductModal.css';

const EditProductModal = ({ product, onClose, onSave }) => {
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    extraImages: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingExtras, setUploadingExtras] = useState(false);

  useEffect(() => {
    if (product) {
      setEditForm({
        name: product.name || '',
        price: product.price || '',
        category: product.category || '',
        image: product.image || '',
        extraImages: Array.isArray(product.images) ? product.images.join(', ') : '',
        description: product.description || '',
      });
    }
  }, [product]);

  // 1. Upload Cover Image File
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadPayload = new FormData();
    uploadPayload.append('image', file);
    setUploadingCover(true);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: uploadPayload,
      });

      if (res.ok) {
        const filePath = await res.text();
        const fullPath = `http://localhost:5000${filePath}`;
        setEditForm((prev) => ({ ...prev, image: fullPath }));
      } else {
        alert('Cover upload failed. Ensure the file is a valid image format.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading file to server.');
    } finally {
      setUploadingCover(false);
    }
  };

  // 2. Upload Multiple Additional Gallery Images
  const handleExtraImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingExtras(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const uploadPayload = new FormData();
        uploadPayload.append('image', file);

        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: uploadPayload,
        });

        if (res.ok) {
          const filePath = await res.text();
          uploadedUrls.push(`http://localhost:5000${filePath}`);
        }
      }

      // Append newly uploaded file URLs to any existing URLs
      setEditForm((prev) => {
        const currentList = prev.extraImages
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);
        const combined = [...currentList, ...uploadedUrls];
        return { ...prev, extraImages: combined.join(', ') };
      });
    } catch (err) {
      console.error('Extra images upload error:', err);
      alert('Error uploading additional images.');
    } finally {
      setUploadingExtras(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const parsedImages = editForm.extraImages
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    await onSave({
      name: editForm.name,
      price: Number(editForm.price),
      category: editForm.category,
      image: editForm.image,
      images: parsedImages,
      description: editForm.description,
    });

    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Listing</h3>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-product-form">
          <label>Product Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />

          <label>Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            required
          />

          <label>Category</label>
          <input
            type="text"
            value={editForm.category}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            required
          />

          {/* Cover Image Section */}
          <div className="modal-upload-group">
            <label>Main Cover Image</label>
            <div className="upload-input-combo">
              <input
                type="text"
                placeholder="https://example.com/cover.jpg"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                required
              />
              <label className="file-upload-btn">
                📁 Upload
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleCoverUpload}
                  hidden
                />
              </label>
            </div>
            {uploadingCover && <span className="upload-status-text">Uploading cover...</span>}
          </div>

          {/* Additional Gallery Images Section */}
          <div className="modal-upload-group">
            <label>Additional Gallery Angles (Comma-separated URLs)</label>
            <div className="upload-input-combo">
              <input
                type="text"
                placeholder="https://.../side.jpg, https://.../back.jpg"
                value={editForm.extraImages}
                onChange={(e) => setEditForm({ ...editForm, extraImages: e.target.value })}
              />
              <label className="file-upload-btn">
                📁 Upload (Multi)
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={handleExtraImagesUpload}
                  hidden
                />
              </label>
            </div>
            {uploadingExtras && (
              <span className="upload-status-text">Uploading gallery images...</span>
            )}
          </div>

          <label>Description</label>
          <textarea
            rows="4"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            required
          />

          <div className="modal-btn-row">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={saving || uploadingCover || uploadingExtras}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;