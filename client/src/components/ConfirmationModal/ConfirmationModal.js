import React from 'react';
import './confirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal">
        <h1>Da li ste sigurni?</h1>
        <p>{message}</p>
        <div className="confirmation-modal-actions">
          <button onClick={onClose} className="confirmation-modal-button-cancel">Otkaži</button>
          <button onClick={onConfirm} className="confirmation-modal-button-confirm">Potvrdi</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
