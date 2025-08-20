import React, { useState, useEffect } from 'react';

interface NameInputModalProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  defaultValue?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

const NameInputModal: React.FC<NameInputModalProps> = ({
  isOpen,
  title,
  placeholder,
  defaultValue = '',
  onClose,
  onSave
}) => {
  const [name, setName] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setName(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert('名前は必須です');
      return;
    }
    onSave(trimmedName);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-2">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-field"
            placeholder={placeholder}
            autoFocus
          />
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button 
            onClick={onClose} 
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameInputModal;