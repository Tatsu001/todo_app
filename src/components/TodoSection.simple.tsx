import React, { useState } from 'react';
import { Task, Folder, TabType } from '../types';
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
  activeTab: _activeTab,
  contextMenu,
  onTaskToggle,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onFolderAdd,
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
    <div className="p-4">
      {/* Simple Task List */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">タスク ({tasks.length})</h2>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="task-item cursor-pointer"
            onClick={() => handleTaskClick(task)}
            onContextMenu={(e) => handleContextMenu(e, task.id)}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskToggle(task.id);
                }}
                className={`
                  flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 transition-colors duration-200
                  ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }
                `}
              >
                {task.completed && '✓'}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                
                {task.memo && (
                  <p className="text-sm text-gray-600 mt-1">{task.memo}</p>
                )}
                
                {task.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 text-xs rounded-full ${
                          tag === 'today' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {tag === 'today' ? '今日' : '今週'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Folder List */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">フォルダ ({folders.length})</h2>
        {folders.map((folder) => (
          <div key={folder.id} className="folder-item">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-blue-500">📁</div>
              <span className="font-medium text-blue-800">{folder.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add buttons */}
      <div className="space-x-2">
        <button 
          onClick={() => onTaskAdd('新しいタスク', null)}
          className="btn-primary"
        >
          タスク追加
        </button>
        <button 
          onClick={() => onFolderAdd('新しいフォルダ', null)}
          className="btn-secondary"
        >
          フォルダ追加
        </button>
      </div>

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
    </div>
  );
};

export default TodoSection;