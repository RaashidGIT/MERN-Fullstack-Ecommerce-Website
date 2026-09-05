// Here contains the logic for the profile page basic skeleton, including the listings tab, order history tab, wishlist tab, and account tab.
import { useState, useEffect } from 'react';

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

          <label>Main Cover Image URL</label>
          <input
            type="text"
            value={editForm.image}
            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
            required
          />

          <label>Additional Angles / Views (comma-separated URLs)</label>
          <input
            type="text"
            value={editForm.extraImages}
            placeholder="https://.../side.jpg, https://.../back.jpg"
            onChange={(e) => setEditForm({ ...editForm, extraImages: e.target.value })}
          />

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
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;