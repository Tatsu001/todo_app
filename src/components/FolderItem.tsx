import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Folder, Task } from '../types';
// import { getItemDepth } from '../utils/helpers';

interface FolderItemProps {
  folder: Folder;
  index: number;
  allItems: (Task | Folder)[];
  onFolderUpdate: (id: string, updates: Partial<Folder>) => void;
  onFolderDelete: (id: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  index,
  allItems: _allItems,
  onFolderUpdate,
  onFolderDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleSubmit = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== folder.name) {
      onFolderUpdate(folder.id, { name: trimmedName });
    }
    setIsEditing(false);
    setEditName(folder.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(folder.name);
    }
  };

  return (
    <Draggable draggableId={folder.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            folder-item mb-2 select-none
            ${snapshot.isDragging ? 'shadow-lg rotate-1' : ''}
          `}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-blue-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSubmit}
                className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <span
                className="flex-1 font-medium text-blue-800 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {folder.name}
              </span>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="フォルダ名を編集"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm(`フォルダ「${folder.name}」とその中身を削除しますか？`)) {
                    onFolderDelete(folder.id);
                  }
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="フォルダを削除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <div className="text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default FolderItem;