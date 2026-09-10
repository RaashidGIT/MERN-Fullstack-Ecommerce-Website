// src/components/ShippingLabelModal.jsx
// src/components/ShippingLabelModal.jsx
import React from 'react';
import './style/ShippingLabelModal.css';

const ShippingLabelModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedAmount = Number(order.totalPrice || 0).toFixed(2);

  return (
    <div className="label-modal-backdrop" onClick={onClose}>
      <div className="label-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar with Visible Buttons */}
        <div className="label-modal-header no-print">
          <span className="modal-title-hint">Logistics Dispatch Slip</span>
          <div className="label-actions-group">
            <button type="button" className="btn-print-slip" onClick={handlePrint}>
              🖨️ Print Label
            </button>
            <button type="button" className="btn-close-modal" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Printable Section */}
        <div className="shipping-slip" id="printable-label">
          <div className="slip-top-row">
            <div>
              <h2 className="carrier-logo">DELHIVERY <span>EXPRESS</span></h2>
              <span className="hub-tag">DEL-BLR-STD • B2C SURFACE</span>
            </div>
            <div className="slip-barcode-area">
              <div className="simulated-barcode">||| | |||| | ||| || |||| || | ||| |||| |</div>
              <span className="awb-number">{order.awbCode || 'AWB-PENDING'}</span>
            </div>
          </div>

          <div className="slip-meta-banner">
            <div className="meta-box">
              <span className="meta-label">PAYMENT METHOD</span>
              <span className="meta-value">{order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD)' : 'PREPAID ONLINE'}</span>
            </div>
            <div className="meta-box align-right">
              <span className="meta-label">COLLECTABLE CASH</span>
              <span className="meta-value highlight">
                {order.paymentMethod === 'COD' ? `₹${formattedAmount}` : '₹0.00 (PAID)'}
              </span>
            </div>
          </div>

          <div className="slip-address-container">
            <div className="address-block">
              <span className="block-label">SHIP TO (BUYER)</span>
              <p className="party-name">{order.buyerName}</p>
              <p className="party-address">{order.city}</p>
              <p className="party-address">PIN: {order.postalCode}, {order.country}</p>
              <p className="party-sub">Email: {order.buyerEmail}</p>
            </div>
            <div className="address-block border-left">
              <span className="block-label">SHIPPED FROM (SELLER)</span>
              <p className="party-name">Anime Loot Fulfillment Hub</p>
              <p className="party-address">Hub 4B, Sector 62 Industrial Estate</p>
              <p className="party-address">Bengaluru, KA - 560100</p>
              <p className="party-sub">GSTIN: 29AAAAA0000A1Z5</p>
            </div>
          </div>

          <div className="slip-manifest">
            <table className="slip-table">
              <thead>
                <tr>
                  <th>Product / Manifest Item</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '90px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{order.productName || 'Anime Collectible / Merch'}</td>
                  <td style={{ textAlign: 'center' }}>{order.qty || 1}</td>
                  <td style={{ textAlign: 'right' }}>₹{formattedAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="slip-footer-notes">
            <span>Hand over package only after scanning barcode. Standard 3PL Transit Guidelines Apply.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelModal;