import { useState } from 'react';
import { useTodoStore } from './hooks/useTodoStore';
import TabNavigation from './components/TabNavigation';
import { buildTreeStructure } from './utils/helpers';
import { Task, Folder } from './types';
import ContextMenu from './components/ContextMenu.simple';
import TaskModal from './components/TaskModal.simple';
import NameInputModal from './components/NameInputModal';
import MoveModal from './components/MoveModal';
import SortModal from './components/SortModal';
import DataManagementModal from './components/DataManagementModal';

function App() {
  console.log('App with complete features rendering...');
  
  try {
    const { 
      state, 
      setActiveTab, 
      addTask, 
      addFolder,
      updateTask,
      updateFolder,
      deleteTask,
      deleteFolder,
      toggleTaskComplete,
      getFilteredTasks,
      moveItem,
      addTagToTask,
      removeTagFromTask,
      sortItems,
      importData
    } = useTodoStore();
    
    // Context Menu State
    const [contextMenu, setContextMenu] = useState({
      isOpen: false,
      x: 0,
      y: 0,
      taskId: null as string | null,
    });

    // Modal State
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Folder Editing State
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState('');
    
    // Name Input Modal State
    const [nameInputModal, setNameInputModal] = useState({
      isOpen: false,
      title: '',
      placeholder: '',
      type: '' as 'task' | 'folder',
      parentId: null as string | null,
    });
    
    // Move Modal State
    const [moveModal, setMoveModal] = useState({
      isOpen: false,
      title: '',
      itemId: '',
      itemName: '',
      itemType: '' as 'task' | 'folder',
      currentParentId: null as string | null,
    });
    
    // Sort Modal State
    const [sortModal, setSortModal] = useState({
      isOpen: false,
      title: '',
      items: [] as (Task | Folder)[],
      itemType: '' as 'task' | 'folder',
      parentId: null as string | null,
    });
    
    // Data Management Modal State
    const [dataManagementModal, setDataManagementModal] = useState({
      isOpen: false,
    });
    
    // Folder Editing Handlers
    const startFolderEdit = (folderId: string, currentName: string) => {
      setEditingFolderId(folderId);
      setEditingFolderName(currentName);
    };

    const saveFolderEdit = () => {
      if (!editingFolderId || !editingFolderName.trim()) return;
      
      updateFolder(editingFolderId, { name: editingFolderName.trim() });
      setEditingFolderId(null);
      setEditingFolderName('');
    };

    const cancelFolderEdit = () => {
      setEditingFolderId(null);
      setEditingFolderName('');
    };

    const handleFolderKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveFolderEdit();
      } else if (e.key === 'Escape') {
        cancelFolderEdit();
      }
    };
    
    // Name Input Modal Handlers
    const openNameInputModal = (type: 'task' | 'folder', parentId: string | null = null) => {
      setNameInputModal({
        isOpen: true,
        title: type === 'task' ? '新しいタスクを作成' : '新しいフォルダを作成',
        placeholder: type === 'task' ? 'タスク名を入力してください' : 'フォルダ名を入力してください',
        type,
        parentId,
      });
    };

    const closeNameInputModal = () => {
      setNameInputModal({
        isOpen: false,
        title: '',
        placeholder: '',
        type: '' as 'task' | 'folder',
        parentId: null,
      });
    };

    const handleNameInputSave = (name: string) => {
      if (nameInputModal.type === 'task') {
        addTask(name, nameInputModal.parentId);
      } else {
        addFolder(name, nameInputModal.parentId);
      }
    };
    
    // Move Modal Handlers
    const openMoveModal = (itemId: string, itemName: string, itemType: 'task' | 'folder', currentParentId: string | null) => {
      setMoveModal({
        isOpen: true,
        title: itemType === 'task' ? 'タスクを移動' : 'フォルダを移動',
        itemId,
        itemName,
        itemType,
        currentParentId,
      });
    };

    const closeMoveModal = () => {
      setMoveModal({
        isOpen: false,
        title: '',
        itemId: '',
        itemName: '',
        itemType: '' as 'task' | 'folder',
        currentParentId: null,
      });
    };

    const handleMove = (newParentId: string | null) => {
      moveItem(moveModal.itemId, newParentId, moveModal.itemType);
    };
    
    // Sort Modal Handlers
    const openSortModal = (items: (Task | Folder)[], itemType: 'task' | 'folder', parentId: string | null) => {
      if (items.length <= 1) {
        alert('並べ替えするアイテムが2個以上必要です');
        return;
      }
      
      setSortModal({
        isOpen: true,
        title: itemType === 'task' 
          ? (parentId ? 'フォルダ内タスクの並び替え' : 'ルートタスクの並び替え')
          : (parentId ? 'サブフォルダの並び替え' : 'ルートフォルダの並び替え'),
        items: [...items],
        itemType,
        parentId,
      });
    };

    const closeSortModal = () => {
      setSortModal({
        isOpen: false,
        title: '',
        items: [],
        itemType: '' as 'task' | 'folder',
        parentId: null,
      });
    };

    const handleSort = (sortedItems: (Task | Folder)[]) => {
      sortItems(sortedItems, sortModal.itemType);
    };
    
    // Data Management Modal Handlers
    const openDataManagementModal = () => {
      setDataManagementModal({ isOpen: true });
    };

    const closeDataManagementModal = () => {
      setDataManagementModal({ isOpen: false });
    };

    const handleImportData = (data: any, mergeMode: 'replace' | 'merge') => {
      importData(data, mergeMode);
    };
    
    const filteredTasks = getFilteredTasks(state.activeTab);
    
    // Context Menu Handlers
    const openContextMenu = (e: React.MouseEvent, taskId: string) => {
      e.preventDefault();
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        taskId,
      });
    };

    const closeContextMenu = () => {
      setContextMenu({
        isOpen: false,
        x: 0,
        y: 0,
        taskId: null,
      });
    };

    // Modal Handlers
    const openTaskModal = (task: Task) => {
      setSelectedTask(task);
      setIsModalOpen(true);
    };

    const closeTaskModal = () => {
      setSelectedTask(null);
      setIsModalOpen(false);
    };

    const contextTask = contextMenu.taskId 
      ? filteredTasks.find(t => t.id === contextMenu.taskId) || null
      : null;
    
    // Task Component
    const TaskComponent = ({ task }: { task: Task }) => (
      <div
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => openTaskModal(task)}
        onContextMenu={(e) => openContextMenu(e, task.id)}
      >
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskComplete(task.id);
            }}
            className={`w-5 h-5 rounded border-2 transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {task.completed && '✓'}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            
            {task.memo && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.memo.substring(0, 50)}{task.memo.length > 50 ? '...' : ''}
              </p>
            )}
            
            {task.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-1 text-xs rounded-full ${
                      tag === 'today' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {tag === 'today' ? '今日' : '今週'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* タスク移動ボタン */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openMoveModal(task.id, task.title, 'task', task.parentId);
            }}
            className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            title="タスクを移動"
          >
            📦 移動
          </button>
        </div>
      </div>
    );
    
    // 階層構造でフォルダを表示する関数
    const renderFolder = (folder: Folder, depth: number = 0) => {
      const folderTasks = buildTreeStructure(filteredTasks, folder.id) as Task[];
      const childFolders = buildTreeStructure(state.folders, folder.id) as Folder[];
      
      return (
        <div 
          key={folder.id} 
          className={`mb-4 ${depth > 0 ? 'ml-8' : ''}`}
        >
          {/* フォルダヘッダー */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-2">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-blue-500">📁</span>
              {editingFolderId === folder.id ? (
                <input
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onKeyDown={handleFolderKeyDown}
                  onBlur={saveFolderEdit}
                  className="font-medium text-blue-800 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              ) : (
                <span 
                  className="font-medium text-blue-800 cursor-pointer hover:underline"
                  onClick={() => startFolderEdit(folder.id, folder.name)}
                  title="クリックして名前を編集"
                >
                  {folder.name}
                </span>
              )}
              <span className="text-sm text-blue-600">({folderTasks.length} tasks)</span>
            </div>
            
            {/* フォルダアクション */}
            <div className="flex gap-2">
              <button
                onClick={() => openNameInputModal('task', folder.id)}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Add task to this folder"
              >
                + Task
              </button>
              <button
                onClick={() => openNameInputModal('folder', folder.id)}
                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                title="Add subfolder"
              >
                + Folder
              </button>
              <button
                onClick={() => startFolderEdit(folder.id, folder.name)}
                className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                title="Edit folder name"
              >
                ✏️
              </button>
              <button
                onClick={() => openMoveModal(folder.id, folder.name, 'folder', folder.parentId)}
                className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                title="Move folder"
              >
                📦
              </button>
              <button
                onClick={() => {
                  const siblingFolders = buildTreeStructure(state.folders, folder.parentId) as Folder[];
                  openSortModal(siblingFolders, 'folder', folder.parentId);
                }}
                className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                title="Sort sibling folders"
              >
                ⇅
              </button>
              <button
                onClick={() => {
                  const childFolders = buildTreeStructure(state.folders, folder.id) as Folder[];
                  openSortModal(childFolders, 'folder', folder.id);
                }}
                className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                title="Sort child folders"
              >
                ⇅📁
              </button>
              <button
                onClick={() => {
                  openSortModal(folderTasks, 'task', folder.id);
                }}
                className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                title="Sort tasks in folder"
              >
                ⇅📋
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`フォルダ「${folder.name}」とその中身を削除しますか？`)) {
                    deleteFolder(folder.id);
                  }
                }}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                title="Delete folder"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {/* フォルダ内のタスク */}
          <div className="ml-8 space-y-2">
            {folderTasks.map((task) => (
              <TaskComponent key={task.id} task={task} />
            ))}
          </div>
          
          {/* 子フォルダの再帰的表示 */}
          <div className="mt-2">
            {childFolders.map(childFolder => renderFolder(childFolder, depth + 1))}
          </div>
        </div>
      );
    };
    
    const rootFolders = buildTreeStructure(state.folders, null) as Folder[];
    const rootTasks = buildTreeStructure(filteredTasks, null) as Task[];
    
    return (
      <div className="min-h-screen bg-gray-50" onClick={closeContextMenu}>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
                <p className="text-gray-600 mt-1">
                  Tasks: {filteredTasks.length}, Folders: {state.folders.length} | Right-click for options
                </p>
              </div>
              <button
                onClick={openDataManagementModal}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                title="データのインポート・エクスポート"
              >
                📁 データ管理
              </button>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <TabNavigation 
            activeTab={state.activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <main className="p-8">
            <div className="space-y-6">
              {/* ルートレベルのフォルダ */}
              {rootFolders.map(folder => renderFolder(folder, 0))}
              
              {/* ルートレベルのタスク */}
              {rootTasks.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Root Tasks ({rootTasks.length})</h2>
                  
                  <div className="space-y-3">
                    {rootTasks.map((task) => (
                      <TaskComponent key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* 空の状態 */}
              {rootFolders.length === 0 && rootTasks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <p className="text-gray-500 mb-4">No tasks or folders yet</p>
                  <p className="text-sm text-gray-400">Create some tasks and folders to get started!</p>
                </div>
              )}
              
              {/* 追加ボタン */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => openNameInputModal('task', null)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Root Task
                </button>
                
                <button
                  onClick={() => openNameInputModal('folder', null)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Folder
                </button>
                
                <button
                  onClick={() => openSortModal(rootFolders, 'folder', null)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  ⇅ Sort Folders
                </button>
                
                <button
                  onClick={() => openSortModal(rootTasks, 'task', null)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  ⇅ Sort Tasks
                </button>
              </div>
              
              {/* 使用方法のヒント */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 使い方のヒント</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• タスクをクリックして詳細を編集</li>
                  <li>• タスクを右クリックしてタグ管理</li>
                  <li>• タスクにマウスを乗せて移動ボタンを表示</li>
                  <li>• 「今日」タグ → 全セクションに表示</li>
                  <li>• 「今週」タグ → 全やること・今週やることに表示</li>
                </ul>
              </div>
            </div>
          </main>
        </div>

        {/* Context Menu */}
        <ContextMenu
          isOpen={contextMenu.isOpen}
          x={contextMenu.x}
          y={contextMenu.y}
          task={contextTask}
          onClose={closeContextMenu}
          onAddTag={(tag) => {
            if (contextTask) {
              addTagToTask(contextTask.id, tag);
            }
          }}
          onRemoveTag={(tag) => {
            if (contextTask) {
              removeTagFromTask(contextTask.id, tag);
            }
          }}
          onDelete={() => {
            if (contextTask) {
              deleteTask(contextTask.id);
            }
          }}
          onEdit={() => {
            if (contextTask) {
              openTaskModal(contextTask);
            }
          }}
        />

        {/* Task Modal */}
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={closeTaskModal}
          onSave={(updates) => {
            if (selectedTask) {
              updateTask(selectedTask.id, updates);
            }
          }}
        />

        {/* Name Input Modal */}
        <NameInputModal
          isOpen={nameInputModal.isOpen}
          title={nameInputModal.title}
          placeholder={nameInputModal.placeholder}
          onClose={closeNameInputModal}
          onSave={handleNameInputSave}
        />

        {/* Move Modal */}
        <MoveModal
          isOpen={moveModal.isOpen}
          title={moveModal.title}
          itemName={moveModal.itemName}
          itemId={moveModal.itemId}
          itemType={moveModal.itemType}
          currentParentId={moveModal.currentParentId}
          folders={state.folders}
          onClose={closeMoveModal}
          onMove={handleMove}
        />

        {/* Sort Modal */}
        <SortModal
          isOpen={sortModal.isOpen}
          title={sortModal.title}
          items={sortModal.items}
          itemType={sortModal.itemType}
          onClose={closeSortModal}
          onSave={handleSort}
        />

        {/* Data Management Modal */}
        <DataManagementModal
          isOpen={dataManagementModal.isOpen}
          currentData={state}
          onClose={closeDataManagementModal}
          onImport={handleImportData}
        />
      </div>
    );
    
  } catch (error) {
    console.error('Error in App:', error);
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">App Error</h1>
        <p className="text-red-700 mb-4">{String(error)}</p>
        <pre className="text-sm bg-red-100 p-4 rounded overflow-auto">
          {error instanceof Error ? error.stack : 'Unknown error'}
        </pre>
      </div>
    );
  }
}

export default App;