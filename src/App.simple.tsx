import { useTodoStore } from './hooks/useTodoStore';
import TabNavigation from './components/TabNavigation';

function App() {
  console.log('App rendering...');
  
  try {
    const { 
      state, 
      setActiveTab, 
      addTask, 
      addFolder,
      toggleTaskComplete,
      getFilteredTasks 
    } = useTodoStore();
    
    console.log('Store loaded successfully');
    
    const filteredTasks = getFilteredTasks(state.activeTab);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Todo App (Working Version)</h1>
            <p className="text-gray-600 mt-1">Tasks: {filteredTasks.length}, Folders: {state.folders.length}</p>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <TabNavigation 
            activeTab={state.activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <main className="p-8">
            <div className="space-y-4">
              {/* Task List */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Tasks ({filteredTasks.length})</h2>
                
                {filteredTasks.length === 0 ? (
                  <p className="text-gray-500 py-8 text-center">No tasks yet</p>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
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
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => addTask(`Task ${Date.now()}`)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
              
              {/* Folder List */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Folders ({state.folders.length})</h2>
                
                {state.folders.length === 0 ? (
                  <p className="text-gray-500 py-8 text-center">No folders yet</p>
                ) : (
                  <div className="space-y-2">
                    {state.folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <span className="text-blue-500">📁</span>
                        <span className="font-medium text-blue-800">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => addFolder(`Folder ${Date.now()}`)}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Folder
                </button>
              </div>
            </div>
          </main>
        </div>
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