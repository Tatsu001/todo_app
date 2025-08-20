import { useState, useCallback } from 'react';
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
    const newTask: Task = {
      id: uuidv4(),
      title,
      memo: '',
      completed: false,
      tags: [],
      parentId,
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    return newTask.id;
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
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      parentId,
    };
    setState(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
    return newFolder.id;
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
        return {
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === itemId ? { ...task, parentId: newParentId } : task
          ),
        };
      } else {
        return {
          ...prev,
          folders: prev.folders.map(folder =>
            folder.id === itemId ? { ...folder, parentId: newParentId } : folder
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
  };
}