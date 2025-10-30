import React, { useState, useEffect } from 'react';

interface AdminConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const AdminConfirmationDialog: React.FC<AdminConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  description = 'To proceed, please enter the key word.'
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setUsername('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (username.toLowerCase() === 'one punch') {
      onConfirm();
    } else {
      setError('Incorrect keyword. Please try again.');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleConfirm();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-indigo-500/30 transform transition-all scale-100 opacity-100">
        <h2 id="dialog-title" className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{description}</p>

        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="keyword..."
            autoFocus
          />
        </div>
        
        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmationDialog;
