import { useState } from 'react';
import { useTodoStore } from './hooks/useTodoStore';
import TabNavigation from './components/TabNavigation';
import { buildTreeStructure } from './utils/helpers';
import { Task, Folder } from './types';
import ContextMenu from './components/ContextMenu.simple';
import TaskModal from './components/TaskModal.simple';

function App() {
  console.log('App with complete features rendering...');
  
  try {
    const { 
      state, 
      setActiveTab, 
      addTask, 
      addFolder,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      getFilteredTasks,
      moveItem,
      addTagToTask,
      removeTagFromTask
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
    
    // Draggable Task Component
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
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveItem(task.id, null, 'task');
            }}
            className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Move to root"
          >
            ↑ Root
          </button>
          
          {/* 他のフォルダへの移動ボタン */}
          {state.folders
            .filter(f => f.parentId !== task.parentId)
            .slice(0, 2)
            .map(targetFolder => (
              <button
                key={targetFolder.id}
                onClick={(e) => {
                  e.stopPropagation();
                  moveItem(task.id, targetFolder.id, 'task');
                }}
                className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                title={`Move to ${targetFolder.name}`}
              >
                → {targetFolder.name.substring(0, 6)}
              </button>
            ))}
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
          className={`mb-4 ${depth > 0 ? 'ml-6' : ''}`}
        >
          {/* フォルダヘッダー */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-2">
            <div className="flex items-center gap-3">
              <span className="text-blue-500">📁</span>
              <span className="font-medium text-blue-800">{folder.name}</span>
              <span className="text-sm text-blue-600">({folderTasks.length} tasks)</span>
            </div>
            
            {/* フォルダアクション */}
            <div className="flex gap-2">
              <button
                onClick={() => addTask(`Task in ${folder.name}`, folder.id)}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Add task to this folder"
              >
                + Task
              </button>
              <button
                onClick={() => addFolder(`Subfolder of ${folder.name}`, folder.id)}
                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                title="Add subfolder"
              >
                + Folder
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`フォルダ「${folder.name}」とその中身を削除しますか？`)) {
                    // Delete folder logic would go here
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
          <div className="ml-6 space-y-2">
            {folderTasks.map((task) => (
              <TaskComponent key={task.id} task={task} />
            ))}
            
            {folderTasks.length === 0 && (
              <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg border-2 border-dashed">
                No tasks in this folder yet
                <br />
                <span className="text-sm">Click "+ Task" above to add one</span>
              </div>
            )}
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
            <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
            <p className="text-gray-600 mt-1">
              Tasks: {filteredTasks.length}, Folders: {state.folders.length} | Right-click for options
            </p>
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
              <div className="flex gap-3">
                <button
                  onClick={() => addTask(`Task ${Date.now()}`, null)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Root Task
                </button>
                
                <button
                  onClick={() => addFolder(`Folder ${Date.now()}`, null)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Folder
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