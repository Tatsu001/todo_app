import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, Folder, TabType, TodoState } from '../types';
import { useLocalStorage } from './useLocalStorage';

const initialState: TodoState = {
  tasks: [],
  folders: [],
  activeTab: 'all',
};

export function useTodoStore() {
  const [state, setState] = useLocalStorage<TodoState>('todoAppState', initialState);
  
  // 既存データのorderフィールドを初期化（マイグレーション）
  React.useEffect(() => {
    const needsMigration = state.tasks.some(task => typeof task.order === 'undefined') ||
                          state.folders.some(folder => typeof folder.order === 'undefined');
                          
    if (needsMigration) {
      setState(prev => {
        const migratedTasks = prev.tasks.map((task, index) => ({
          ...task,
          order: typeof task.order === 'undefined' ? index : task.order
        }));
        
        const migratedFolders = prev.folders.map((folder, index) => ({
          ...folder,
          order: typeof folder.order === 'undefined' ? index : folder.order
        }));
        
        return {
          ...prev,
          tasks: migratedTasks,
          folders: migratedFolders
        };
      });
    }
  }, [state.tasks, state.folders, setState]);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    taskId: string | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    taskId: null,
  });

  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, [setState]);

  const addTask = useCallback((title: string, parentId: string | null = null) => {
    setState(prev => {
      // 同じ親のタスクの中で最大のorderを取得
      const siblingTasks = prev.tasks.filter(t => t.parentId === parentId);
      const maxOrder = siblingTasks.length > 0 
        ? Math.max(...siblingTasks.map(t => t.order)) 
        : -1;
      
      const newTask: Task = {
        id: uuidv4(),
        title,
        memo: '',
        completed: false,
        tags: [],
        parentId,
        order: maxOrder + 1,
      };
      return { ...prev, tasks: [...prev.tasks, newTask] };
    });
  }, [setState]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  }, [setState]);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
    }));
  }, [setState]);

  const toggleTaskComplete = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  }, [setState]);

  const addTagToTask = useCallback((id: string, tag: 'today' | 'week') => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id && !task.tags.includes(tag)
          ? { ...task, tags: [...task.tags, tag] }
          : task
      ),
    }));
  }, [setState]);

  const removeTagFromTask = useCallback((id: string, tag: 'today' | 'week') => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? { ...task, tags: task.tags.filter(t => t !== tag) }
          : task
      ),
    }));
  }, [setState]);

  const addFolder = useCallback((name: string, parentId: string | null = null) => {
    setState(prev => {
      // 同じ親のフォルダの中で最大のorderを取得
      const siblingFolders = prev.folders.filter(f => f.parentId === parentId);
      const maxOrder = siblingFolders.length > 0 
        ? Math.max(...siblingFolders.map(f => f.order)) 
        : -1;
      
      const newFolder: Folder = {
        id: uuidv4(),
        name,
        parentId,
        order: maxOrder + 1,
      };
      return { ...prev, folders: [...prev.folders, newFolder] };
    });
  }, [setState]);

  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setState(prev => ({
      ...prev,
      folders: prev.folders.map(folder =>
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    }));
  }, [setState]);

  const deleteFolder = useCallback((id: string) => {
    setState(prev => {
      const deleteRecursively = (folderId: string): { taskIds: string[]; folderIds: string[] } => {
        const childFolders = prev.folders.filter(f => f.parentId === folderId);
        const childTasks = prev.tasks.filter(t => t.parentId === folderId);
        
        let allTaskIds = childTasks.map(t => t.id);
        let allFolderIds = [folderId];
        
        childFolders.forEach(child => {
          const result = deleteRecursively(child.id);
          allTaskIds = [...allTaskIds, ...result.taskIds];
          allFolderIds = [...allFolderIds, ...result.folderIds];
        });
        
        return { taskIds: allTaskIds, folderIds: allFolderIds };
      };

      const { taskIds, folderIds } = deleteRecursively(id);
      
      return {
        ...prev,
        tasks: prev.tasks.filter(task => !taskIds.includes(task.id)),
        folders: prev.folders.filter(folder => !folderIds.includes(folder.id)),
      };
    });
  }, [setState]);

  const moveItem = useCallback((itemId: string, newParentId: string | null, itemType: 'task' | 'folder') => {
    setState(prev => {
      if (itemType === 'task') {
        // 新しい親の下での最大orderを取得
        const newSiblings = prev.tasks.filter(t => t.parentId === newParentId && t.id !== itemId);
        const maxOrder = newSiblings.length > 0 
          ? Math.max(...newSiblings.map(t => t.order)) 
          : -1;
        
        return {
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === itemId 
              ? { ...task, parentId: newParentId, order: maxOrder + 1 } 
              : task
          ),
        };
      } else {
        // 新しい親の下での最大orderを取得
        const newSiblings = prev.folders.filter(f => f.parentId === newParentId && f.id !== itemId);
        const maxOrder = newSiblings.length > 0 
          ? Math.max(...newSiblings.map(f => f.order)) 
          : -1;
        
        return {
          ...prev,
          folders: prev.folders.map(folder =>
            folder.id === itemId 
              ? { ...folder, parentId: newParentId, order: maxOrder + 1 } 
              : folder
          ),
        };
      }
    });
  }, [setState]);

  const getFilteredTasks = useCallback((tab: TabType) => {
    switch (tab) {
      case 'today':
        return state.tasks.filter(task => task.tags.includes('today'));
      case 'week':
        return state.tasks.filter(task => 
          task.tags.includes('today') || task.tags.includes('week')
        );
      case 'all':
      default:
        return state.tasks;
    }
  }, [state.tasks]);

  const openContextMenu = useCallback((x: number, y: number, taskId: string) => {
    setContextMenu({ isOpen: true, x, y, taskId });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, x: 0, y: 0, taskId: null });
  }, []);

  const sortItems = useCallback((sortedItems: (Task | Folder)[], itemType: 'task' | 'folder') => {
    setState(prev => {
      if (itemType === 'task') {
        const sortedTasks = sortedItems as Task[];
        // 新しいorder値を設定
        const updatedTasks = sortedTasks.map((task, index) => ({
          ...task,
          order: index
        }));
        
        // 他のタスクとマージ
        const otherTasks = prev.tasks.filter(task => 
          !sortedItems.some(item => item.id === task.id)
        );
        
        return { ...prev, tasks: [...updatedTasks, ...otherTasks] };
      } else {
        const sortedFolders = sortedItems as Folder[];
        // 新しいorder値を設定
        const updatedFolders = sortedFolders.map((folder, index) => ({
          ...folder,
          order: index
        }));
        
        // 他のフォルダとマージ
        const otherFolders = prev.folders.filter(folder => 
          !sortedItems.some(item => item.id === folder.id)
        );
        
        return { ...prev, folders: [...updatedFolders, ...otherFolders] };
      }
    });
  }, [setState]);

  const importData = useCallback((importedData: TodoState, mergeMode: 'replace' | 'merge') => {
    setState(prev => {
      if (mergeMode === 'replace') {
        // 完全置換
        return importedData;
      } else {
        // マージ（既存IDと重複しないもののみ追加）
        const existingTaskIds = new Set(prev.tasks.map(t => t.id));
        const existingFolderIds = new Set(prev.folders.map(f => f.id));
        
        const newTasks = importedData.tasks.filter(task => !existingTaskIds.has(task.id));
        const newFolders = importedData.folders.filter(folder => !existingFolderIds.has(folder.id));
        
        // 新しいアイテムのorder値を調整
        const maxTaskOrder = prev.tasks.length > 0 
          ? Math.max(...prev.tasks.map(t => t.order)) 
          : -1;
        const maxFolderOrder = prev.folders.length > 0 
          ? Math.max(...prev.folders.map(f => f.order)) 
          : -1;
        
        const adjustedTasks = newTasks.map((task, index) => ({
          ...task,
          order: maxTaskOrder + 1 + index
        }));
        
        const adjustedFolders = newFolders.map((folder, index) => ({
          ...folder,
          order: maxFolderOrder + 1 + index
        }));
        
        return {
          ...prev,
          tasks: [...prev.tasks, ...adjustedTasks],
          folders: [...prev.folders, ...adjustedFolders],
          // activeTabは現在のものを保持
        };
      }
    });
  }, [setState]);

  return {
    state,
    contextMenu,
    setActiveTab,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addTagToTask,
    removeTagFromTask,
    addFolder,
    updateFolder,
    deleteFolder,
    moveItem,
    getFilteredTasks,
    openContextMenu,
    closeContextMenu,
    sortItems,
    importData,
  };
}