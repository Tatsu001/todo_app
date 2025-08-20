export interface Task {
  id: string;
  title: string;
  memo: string;
  completed: boolean;
  tags: ('today' | 'week')[];
  parentId: string | null;
  order: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
}

export type TabType = 'all' | 'week' | 'today';

export interface TodoState {
  tasks: Task[];
  folders: Folder[];
  activeTab: TabType;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  taskId: string | null;
}

export interface DragItem {
  id: string;
  type: 'task' | 'folder';
  parentId: string | null;
}

export interface DropResult {
  droppableId: string;
  type: 'task' | 'folder';
}