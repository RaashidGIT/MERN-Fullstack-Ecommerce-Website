// Here contains the logic for the account tab in the profile page, including account deletion confirmation modal

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/AccountTab.css';

// Displays account settings and handles the account deletion confirmation modal
const AccountTab = ({ userInfo, logout }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Permanently delete user profile
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (res.ok) {
        logout();
        navigate('/');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Could not connect to server.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <section className="profile-section">
      <div className="section-header-flex">
        <h3 className="settings-header-title">Account Details</h3>
        <button
          type="button"
          className="delete-account-top-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          🗑️ Delete Account
        </button>
      </div>

      {/* Account Info Details */}
      <div className="account-details-box">
        <div className="detail-row">
          <span className="detail-label">Full Name:</span>
          <span className="detail-value">{userInfo.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Email Address:</span>
          <span className="detail-value">{userInfo.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">User ID:</span>
          <span className="detail-value mono-text">{userInfo._id}</span>
        </div>
      </div>

      {/* Deletion Warning Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-alert">⚠️</div>
            <h3>Delete Account?</h3>
            <p>
              Are you sure you want to permanently delete your account? All your saved items, listings, and profile data will be permanently removed.
            </p>
            <div className="modal-action-buttons">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                No, Keep It
              </button>
              <button
                type="button"
                className="modal-btn-confirm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountTab;