import React, { useState } from 'react';
import { Task, Folder, TabType } from '../types';
import FolderTree from './FolderTree.fixed';
import TaskModal from './TaskModal';
import ContextMenu from './ContextMenu';

interface TodoSectionProps {
  tasks: Task[];
  folders: Folder[];
  activeTab: TabType;
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    taskId: string | null;
  };
  onTaskToggle: (id: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskDelete: (id: string) => void;
  onTaskAdd: (title: string, parentId?: string | null) => void;
  onFolderAdd: (name: string, parentId?: string | null) => void;
  onFolderUpdate: (id: string, updates: Partial<Folder>) => void;
  onFolderDelete: (id: string) => void;
  onItemMove: (itemId: string, newParentId: string | null, itemType: 'task' | 'folder') => void;
  onTagAdd: (id: string, tag: 'today' | 'week') => void;
  onTagRemove: (id: string, tag: 'today' | 'week') => void;
  onContextMenuOpen: (x: number, y: number, taskId: string) => void;
  onContextMenuClose: () => void;
}

const TodoSection: React.FC<TodoSectionProps> = ({
  tasks,
  folders,
  activeTab,
  contextMenu,
  onTaskToggle,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onFolderAdd,
  onFolderUpdate,
  onFolderDelete,
  onItemMove,
  onTagAdd,
  onTagRemove,
  onContextMenuOpen,
  onContextMenuClose,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSave = (updates: Partial<Task>) => {
    if (selectedTask) {
      onTaskUpdate(selectedTask.id, updates);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    onContextMenuOpen(e.clientX, e.clientY, taskId);
  };

  const contextTask = contextMenu.taskId 
    ? tasks.find(t => t.id === contextMenu.taskId) || null
    : null;

  return (
    <>
      <FolderTree
        tasks={tasks}
        folders={folders}
        activeTab={activeTab}
        onTaskToggle={onTaskToggle}
        onTaskClick={handleTaskClick}
        onTaskContextMenu={handleContextMenu}
        onTaskAdd={onTaskAdd}
        onFolderAdd={onFolderAdd}
        onFolderUpdate={onFolderUpdate}
        onFolderDelete={onFolderDelete}
        onItemMove={onItemMove}
      />

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleTaskSave}
      />

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        task={contextTask}
        onClose={onContextMenuClose}
        onAddTag={(tag) => {
          if (contextTask) {
            onTagAdd(contextTask.id, tag);
          }
        }}
        onRemoveTag={(tag) => {
          if (contextTask) {
            onTagRemove(contextTask.id, tag);
          }
        }}
        onDelete={() => {
          if (contextTask) {
            onTaskDelete(contextTask.id);
          }
        }}
      />
    </>
  );
};

export default TodoSection;