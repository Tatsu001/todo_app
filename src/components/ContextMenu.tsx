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
        left: x,
        top: y,
      }}
    >
      <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100 mb-1">
        タグ管理
      </div>
      
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
      
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-red-50 text-sm text-red-600"
      >
        削除
      </button>
    </div>
  );
};

export default ContextMenu;