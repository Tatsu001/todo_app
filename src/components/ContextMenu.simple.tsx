import React, { useEffect, useRef } from 'react';
import { Task } from '../types';

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  task: Task | null;
  onClose: () => void;
  onAddTag: (tag: 'today' | 'week') => void;
  onRemoveTag: (tag: 'today' | 'week') => void;
  onDelete: () => void;
  onEdit: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  task,
  onClose,
  onAddTag,
  onRemoveTag,
  onDelete,
  onEdit,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const hasToday = task.tags.includes('today');
  const hasWeek = task.tags.includes('week');

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
      style={{
        left: Math.min(x, window.innerWidth - 180),
        top: Math.min(y, window.innerHeight - 200),
      }}
    >
      {/* タスク編集 */}
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
      >
        <span className="text-blue-500">✏️</span>
        タスクを編集
      </button>
      
      <hr className="my-1 border-gray-100" />
      
      <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100 mb-1">
        タグ管理
      </div>
      
      {/* 今日タグ */}
      {!hasToday ? (
        <button
          onClick={() => {
            onAddTag('today');
            onClose();
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
        >
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          「今日」を追加
        </button>
      ) : (
        <button
          onClick={() => {
            onRemoveTag('today');
            onClose();
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
        >
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          「今日」を削除
        </button>
      )}
      
      {/* 今週タグ */}
      {!hasWeek ? (
        <button
          onClick={() => {
            onAddTag('week');
            onClose();
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
        >
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          「今週」を追加
        </button>
      ) : (
        <button
          onClick={() => {
            onRemoveTag('week');
            onClose();
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
        >
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          「今週」を削除
        </button>
      )}
      
      <hr className="my-1 border-gray-100" />
      
      {/* 削除 */}
      <button
        onClick={() => {
          if (window.confirm(`タスク「${task.title}」を削除しますか？`)) {
            onDelete();
            onClose();
          }
        }}
        className="w-full px-3 py-2 text-left hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
      >
        <span className="text-red-500">🗑️</span>
        削除
      </button>
    </div>
  );
};

export default ContextMenu;