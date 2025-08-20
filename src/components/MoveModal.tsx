import React, { useState } from 'react';
import { Folder } from '../types';

interface MoveModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemId: string;
  itemType: 'task' | 'folder';
  currentParentId: string | null;
  folders: Folder[];
  onClose: () => void;
  onMove: (newParentId: string | null) => void;
}

const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  title,
  itemName,
  itemId,
  itemType,
  currentParentId,
  folders,
  onClose,
  onMove
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(currentParentId);
  
  // フォルダの循環参照をチェックする関数
  const wouldCreateCycle = (targetParentId: string | null): boolean => {
    if (itemType !== 'folder' || !targetParentId) return false;
    
    // 移動先が自分自身の場合
    if (targetParentId === itemId) return true;
    
    // 移動先が自分の子孫フォルダの場合
    const checkDescendant = (parentId: string): boolean => {
      const children = folders.filter(f => f.parentId === parentId);
      for (const child of children) {
        if (child.id === itemId) return true;
        if (checkDescendant(child.id)) return true;
      }
      return false;
    };
    
    return checkDescendant(targetParentId);
  };

  const handleMove = () => {
    onMove(selectedParentId);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMove();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // フォルダの階層構造を表示するためのヘルパー関数
  const buildFolderTree = (parentId: string | null, depth: number = 0): JSX.Element[] => {
    const childFolders = folders.filter(f => f.parentId === parentId && f.id !== itemId);
    
    return childFolders.map(folder => {
      const isDisabled = wouldCreateCycle(folder.id);
      
      return (
        <div key={folder.id}>
          <label className={`flex items-center p-2 rounded ${
            isDisabled 
              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
              : 'hover:bg-gray-50 cursor-pointer'
          }`}>
            <input
              type="radio"
              name="parentFolder"
              value={folder.id}
              checked={selectedParentId === folder.id}
              onChange={() => !isDisabled && setSelectedParentId(folder.id)}
              disabled={isDisabled}
              className="mr-3"
            />
            <span style={{ marginLeft: `${depth * 20}px` }} className="flex items-center">
              <span className="text-blue-500 mr-2">📁</span>
              {folder.name}
              {isDisabled && <span className="ml-2 text-xs text-red-500">(循環参照)</span>}
            </span>
          </label>
          {!isDisabled && buildFolderTree(folder.id, depth + 1)}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
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
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              移動するアイテム: <span className="font-medium text-gray-900">{itemName}</span>
            </p>
            <p className="text-sm text-gray-500">
              移動先を選択してください
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg" onKeyDown={handleKeyDown}>
            {/* ルートレベル */}
            <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="parentFolder"
                value=""
                checked={selectedParentId === null}
                onChange={() => setSelectedParentId(null)}
                className="mr-3"
              />
              <span className="flex items-center">
                <span className="text-gray-500 mr-2">🏠</span>
                ルート（最上位）
              </span>
            </label>
            
            {/* フォルダツリー */}
            {buildFolderTree(null)}
          </div>
          
          {selectedParentId === currentParentId && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              ℹ️ 現在と同じ場所が選択されています
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button 
            onClick={onClose} 
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button 
            onClick={handleMove} 
            className="btn-primary"
            disabled={selectedParentId === currentParentId}
          >
            移動
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;