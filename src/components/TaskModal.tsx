import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setMemo(task.memo);
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;
    
    onSave({
      title: title.trim() || task.title,
      memo: memo.trim(),
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">タスクの編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field"
              placeholder="タスクのタイトル"
            />
          </div>
          
          <div>
            <label htmlFor="task-memo" className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              id="task-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field min-h-[100px] resize-y"
              placeholder="詳細なメモや説明を入力..."
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {task.tags.length > 0 && (
              <div className="flex gap-1">
                <span>タグ:</span>
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-2 py-1 rounded-full text-xs ${
                      tag === 'today' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {tag === 'today' ? '今日' : '今週'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button onClick={handleSave} className="btn-primary">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;