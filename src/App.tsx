import { useEffect } from 'react';
import { useTodoStore } from './hooks/useTodoStore';
import TabNavigation from './components/TabNavigation';
import TodoSection from './components/TodoSection';

function App() {
  const {
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
  } = useTodoStore();

  const filteredTasks = getFilteredTasks(state.activeTab);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.isOpen) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.isOpen, closeContextMenu]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
          <p className="text-gray-600 mt-1">タスクとフォルダを管理できるTodoアプリ</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <TabNavigation 
          activeTab={state.activeTab} 
          onTabChange={setActiveTab} 
        />

        <main className="pb-8">
          <TodoSection
            tasks={filteredTasks}
            folders={state.folders}
            activeTab={state.activeTab}
            contextMenu={contextMenu}
            onTaskToggle={toggleTaskComplete}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onTaskAdd={addTask}
            onFolderAdd={addFolder}
            onFolderUpdate={updateFolder}
            onFolderDelete={deleteFolder}
            onItemMove={moveItem}
            onTagAdd={addTagToTask}
            onTagRemove={removeTagFromTask}
            onContextMenuOpen={openContextMenu}
            onContextMenuClose={closeContextMenu}
          />
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 Todo App - React + TypeScript + Tailwind CSS</p>
          <p className="mt-1">GitHub Pages対応 | ローカルストレージでデータ永続化</p>
        </div>
      </footer>
    </div>
  );
}

export default App;