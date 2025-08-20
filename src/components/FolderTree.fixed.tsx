import React, { useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Task, Folder, TabType } from '../types';
import { buildTreeStructure, isValidMove } from '../utils/helpers';
import TaskItem from './TaskItem';
import FolderItem from './FolderItem';
import AddButton from './AddButton';

interface FolderTreeProps {
  tasks: Task[];
  folders: Folder[];
  activeTab: TabType;
  onTaskToggle: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskContextMenu: (e: React.MouseEvent, taskId: string) => void;
  onTaskAdd: (title: string, parentId?: string | null) => void;
  onFolderAdd: (name: string, parentId?: string | null) => void;
  onFolderUpdate: (id: string, updates: Partial<Folder>) => void;
  onFolderDelete: (id: string) => void;
  onItemMove: (itemId: string, newParentId: string | null, itemType: 'task' | 'folder') => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  tasks,
  folders,
  activeTab,
  onTaskToggle,
  onTaskClick,
  onTaskContextMenu,
  onTaskAdd,
  onFolderAdd,
  onFolderUpdate,
  onFolderDelete,
  onItemMove,
}) => {
  const renderFolder = useCallback((folder: Folder, depth: number = 0) => {
    const childFolders = buildTreeStructure(folders, folder.id) as Folder[];
    const folderTasks = buildTreeStructure(tasks, folder.id) as Task[];

    return (
      <div key={folder.id} className={`mb-4 ${depth > 0 ? 'ml-6' : ''}`}>
        {/* フォルダヘッダー */}
        <FolderItem
          folder={folder}
          index={0}
          allItems={[...folders, ...tasks]}
          onFolderUpdate={onFolderUpdate}
          onFolderDelete={onFolderDelete}
        />
        
        {/* フォルダの中身 */}
        <div className="ml-6 mt-2">
          <Droppable droppableId={folder.id} type="ITEM">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[20px] ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''}`}
              >
                {/* フォルダ内のタスク */}
                {folderTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    allItems={[...folders, ...tasks]}
                    onToggleComplete={onTaskToggle}
                    onTaskClick={onTaskClick}
                    onContextMenu={onTaskContextMenu}
                  />
                ))}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          {/* フォルダ内の追加ボタン */}
          <AddButton
            onAddTask={(title) => onTaskAdd(title, folder.id)}
            onAddFolder={(name) => onFolderAdd(name, folder.id)}
            className="mt-2 text-sm py-2"
          />
          
          {/* 子フォルダの再帰的レンダリング */}
          {childFolders.map(childFolder => renderFolder(childFolder, depth + 1))}
        </div>
      </div>
    );
  }, [folders, tasks, onTaskToggle, onTaskClick, onTaskContextMenu, onTaskAdd, onFolderAdd, onFolderUpdate, onFolderDelete]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    const newParentId = destination.droppableId === 'root' ? null : destination.droppableId;
    
    const draggedItem = [...tasks, ...folders].find(item => item.id === draggableId);
    if (!draggedItem) return;

    const itemType: 'task' | 'folder' = 'completed' in draggedItem ? 'task' : 'folder';

    if (itemType === 'folder' && !isValidMove(draggableId, newParentId, folders)) {
      return;
    }

    onItemMove(draggableId, newParentId, itemType);
  }, [tasks, folders, onItemMove]);

  const rootFolders = buildTreeStructure(folders, null) as Folder[];
  const rootTasks = buildTreeStructure(tasks, null) as Task[];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-4">
        {tasks.length === 0 && folders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              {activeTab === 'today' && 'まだ今日のタスクがありません'}
              {activeTab === 'week' && 'まだ今週のタスクがありません'}
              {activeTab === 'all' && 'まだタスクがありません'}
            </p>
            <AddButton
              onAddTask={(title) => onTaskAdd(title, null)}
              onAddFolder={(name) => onFolderAdd(name, null)}
            />
          </div>
        ) : (
          <div>
            {/* ルートレベルのフォルダ */}
            {rootFolders.map(folder => renderFolder(folder, 0))}
            
            {/* ルートレベルのタスク */}
            <Droppable droppableId="root" type="ITEM">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[20px] ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''}`}
                >
                  {rootTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      allItems={[...folders, ...tasks]}
                      onToggleComplete={onTaskToggle}
                      onTaskClick={onTaskClick}
                      onContextMenu={onTaskContextMenu}
                    />
                  ))}
                  
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
            {/* ルートレベルの追加ボタン */}
            <AddButton
              onAddTask={(title) => onTaskAdd(title, null)}
              onAddFolder={(name) => onFolderAdd(name, null)}
              className="mt-4"
            />
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default FolderTree;