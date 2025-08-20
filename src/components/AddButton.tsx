import React, { useState } from 'react';

interface AddButtonProps {
  onAddTask: (title: string) => void;
  onAddFolder: (name: string) => void;
  className?: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onAddTask, onAddFolder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'task' | 'folder'>('task');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (mode === 'task') {
      onAddTask(inputValue.trim());
    } else {
      onAddFolder(inputValue.trim());
    }

    setInputValue('');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setInputValue('');
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <div className={`bg-white border border-gray-300 rounded-lg p-4 shadow-sm ${className}`}>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('task')}
            className={`px-3 py-1 text-sm rounded ${
              mode === 'task' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            タスク
          </button>
          <button
            onClick={() => setMode('folder')}
            className={`px-3 py-1 text-sm rounded ${
              mode === 'folder' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            フォルダ
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === 'task' ? 'タスクのタイトル' : 'フォルダ名'}
            className="input-field"
            autoFocus
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              追加
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`
        w-full py-3 px-4 border-2 border-dashed border-gray-300 
        rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 
        transition-colors duration-200 flex items-center justify-center gap-2
        ${className}
      `}
    >
      <span className="text-lg">+</span>
      <span>タスクまたはフォルダを追加</span>
    </button>
  );
};

export default AddButton;