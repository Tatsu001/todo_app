import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, Folder } from '../types';

interface SortModalProps {
  isOpen: boolean;
  title: string;
  items: (Task | Folder)[];
  itemType: 'task' | 'folder';
  onClose: () => void;
  onSave: (sortedItems: (Task | Folder)[]) => void;
}

const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  title,
  items,
  itemType,
  onClose,
  onSave
}) => {
  const [sortedItems, setSortedItems] = useState<(Task | Folder)[]>([]);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      setSortedItems([...items]);
    }
  }, [isOpen, items]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const newItems = Array.from(sortedItems);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setSortedItems(newItems);
  };

  const handleSave = () => {
    onSave(sortedItems);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedItems.length - 1) return;

    const newItems = [...sortedItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setSortedItems(newItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        
        <div className="p-4" onKeyDown={handleKeyDown}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              ドラッグ&ドロップまたは矢印ボタンで順序を変更してください
            </p>
            <p className="text-xs text-gray-500">
              💡 上が先頭、下が末尾になります
            </p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sort-items">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`max-h-96 overflow-y-auto border-2 border-dashed rounded-lg p-3 ${
                    snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  {sortedItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg border transition-all ${
                            snapshot.isDragging 
                              ? 'shadow-lg rotate-1 border-blue-300 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {/* ドラッグハンドル */}
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4h14M3 10h14M3 16h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            
                            {/* アイテム情報 */}
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {itemType === 'folder' ? '📁' : '📝'}
                              </span>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {itemType === 'folder' 
                                    ? (item as Folder).name 
                                    : (item as Task).title
                                  }
                                </div>
                                {itemType === 'task' && (item as Task).memo && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {(item as Task).memo.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-400 ml-auto">
                              #{index + 1}
                            </div>
                          </div>
                          
                          {/* 矢印ボタン */}
                          <div className="flex flex-col gap-1 ml-3">
                            <button
                              onClick={() => moveItem(index, 'up')}
                              disabled={index === 0}
                              className={`text-xs p-1 rounded ${
                                index === 0
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                              }`}
                              title="上に移動"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveItem(index, 'down')}
                              disabled={index === sortedItems.length - 1}
                              className={`text-xs p-1 rounded ${
                                index === sortedItems.length - 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                              }`}
                              title="下に移動"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {sortedItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      並べ替えするアイテムがありません
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {sortedItems.length}個のアイテム
          </div>
          <div className="flex gap-2">
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
              保存 (Ctrl+Enter)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortModal;