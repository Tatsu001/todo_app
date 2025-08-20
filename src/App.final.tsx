import { useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTodoStore } from './hooks/useTodoStore';
import TabNavigation from './components/TabNavigation';
import { buildTreeStructure, isValidMove } from './utils/helpers';
import { Task, Folder } from './types';

function App() {
  console.log('App with full features rendering...');
  
  try {
    const { 
      state, 
      setActiveTab, 
      addTask, 
      addFolder,
      toggleTaskComplete,
      getFilteredTasks,
      moveItem 
    } = useTodoStore();
    
    console.log('Store loaded successfully');
    
    const filteredTasks = getFilteredTasks(state.activeTab);
    
    const handleDragEnd = useCallback((result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination || (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )) {
        return;
      }

      const newParentId = destination.droppableId === 'root' ? null : destination.droppableId;
      
      const draggedItem = [...filteredTasks, ...state.folders].find(item => item.id === draggableId);
      if (!draggedItem) return;

      const itemType: 'task' | 'folder' = 'completed' in draggedItem ? 'task' : 'folder';

      if (itemType === 'folder' && !isValidMove(draggableId, newParentId, state.folders)) {
        return;
      }

      console.log(`Moving ${itemType} ${draggableId} to ${newParentId || 'root'}`);
      moveItem(draggableId, newParentId, itemType);
    }, [filteredTasks, state.folders, moveItem]);
    
    // ドラッグ可能なタスクコンポーネント
    const DraggableTask = ({ task, index }: { task: Task; index: number }) => (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2 cursor-move transition-shadow ${
              snapshot.isDragging ? 'shadow-lg bg-white' : ''
            }`}
          >
            <div className="text-gray-400">⋮⋮</div>
            
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
                <p className="text-sm text-gray-600 mt-1">{task.memo}</p>
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
                      {tag === 'today' ? 'Today' : 'This Week'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
    
    // ドラッグ可能なフォルダコンポーネント
    const DraggableFolder = ({ folder, index }: { folder: Folder; index: number }) => (
      <Draggable draggableId={folder.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-2 cursor-move transition-shadow ${
              snapshot.isDragging ? 'shadow-lg bg-white' : ''
            }`}
          >
            <div className="text-blue-400">⋮⋮</div>
            <span className="text-blue-500">📁</span>
            <span className="font-medium text-blue-800">{folder.name}</span>
          </div>
        )}
      </Draggable>
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
          {/* フォルダヘッダー（ドラッグ可能） */}
          <DraggableFolder folder={folder} index={0} />
          
          {/* フォルダ内のコンテンツ（ドロップゾーン） */}
          <div className="ml-6">
            <Droppable droppableId={folder.id} type="ITEM">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[40px] p-2 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-100 border-2 border-blue-300 border-dashed' : ''
                  }`}
                >
                  {folderTasks.map((task, index) => (
                    <DraggableTask key={task.id} task={task} index={index} />
                  ))}
                  
                  {provided.placeholder}
                  
                  {/* フォルダ内への追加ボタン */}
                  <button
                    onClick={() => addTask(`Task in ${folder.name}`, folder.id)}
                    className="w-full py-2 px-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm mt-2"
                  >
                    + Add task to this folder
                  </button>
                </div>
              )}
            </Droppable>
            
            {/* 子フォルダの再帰的表示 */}
            <div className="mt-2">
              {childFolders.map(childFolder => renderFolder(childFolder, depth + 1))}
            </div>
          </div>
        </div>
      );
    };
    
    const rootFolders = buildTreeStructure(state.folders, null) as Folder[];
    const rootTasks = buildTreeStructure(filteredTasks, null) as Task[];
    
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-gray-900">Todo App (Final Version)</h1>
              <p className="text-gray-600 mt-1">
                Tasks: {filteredTasks.length}, Folders: {state.folders.length} | Drag & Drop enabled!
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
                <Droppable droppableId="root" type="ITEM">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[100px] p-4 rounded-lg transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'bg-gray-100 border-2 border-gray-300 border-dashed' 
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <h2 className="text-lg font-semibold mb-4">
                        Root Tasks ({rootTasks.length})
                      </h2>
                      
                      {rootTasks.map((task, index) => (
                        <DraggableTask key={task.id} task={task} index={index} />
                      ))}
                      
                      {provided.placeholder}
                      
                      {rootTasks.length === 0 && !snapshot.isDraggingOver && (
                        <p className="text-gray-500 text-center py-8">
                          No root tasks yet. Drag tasks here or add new ones.
                        </p>
                      )}
                    </div>
                  )}
                </Droppable>
                
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
              </div>
            </main>
          </div>
        </div>
      </DragDropContext>
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