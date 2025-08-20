import { Task, Folder } from '../types';

export function buildTreeStructure(
  items: (Task | Folder)[],
  parentId: string | null = null
): (Task | Folder)[] {
  return items
    .filter(item => item.parentId === parentId)
    .sort((a, b) => {
      // orderフィールドでソート（優先）
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      
      // タスクの場合は完了状態でセカンダリソート
      if ('completed' in a && 'completed' in b) {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
      }
      
      // 最後は名前でソート
      const aName = 'name' in a ? a.name : 'title' in a ? a.title : '';
      const bName = 'name' in b ? b.name : 'title' in b ? b.title : '';
      
      return aName.localeCompare(bName);
    });
}

export function getChildrenIds(
  items: (Task | Folder)[],
  parentId: string
): string[] {
  const children = items.filter(item => item.parentId === parentId);
  const allIds = children.map(child => child.id);
  
  children.forEach(child => {
    allIds.push(...getChildrenIds(items, child.id));
  });
  
  return allIds;
}

export function isValidMove(
  itemId: string,
  newParentId: string | null,
  folders: Folder[]
): boolean {
  if (itemId === newParentId) return false;
  
  if (newParentId === null) return true;
  
  const childrenIds = getChildrenIds(folders, itemId);
  return !childrenIds.includes(newParentId);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getItemDepth(
  itemId: string,
  items: (Task | Folder)[]
): number {
  const item = items.find(i => i.id === itemId);
  if (!item || !item.parentId) return 0;
  
  return 1 + getItemDepth(item.parentId, items);
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}