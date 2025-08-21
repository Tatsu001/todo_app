import { TodoState } from '../types';

export interface ExportData extends TodoState {
  exportedAt: string;
  version: string;
  appName: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: TodoState;
  errors?: string[];
}

/**
 * 全データをJSONとしてエクスポート
 */
export function exportData(state: TodoState): void {
  const exportData: ExportData = {
    ...state,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    appName: 'Todo App'
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  // ダウンロードを実行
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // メモリを解放
  URL.revokeObjectURL(link.href);
}

/**
 * JSONファイルからデータをインポート
 */
export function validateImportData(jsonData: any): ImportResult {
  const errors: string[] = [];
  
  try {
    // 基本構造のチェック
    if (!jsonData || typeof jsonData !== 'object') {
      return {
        success: false,
        message: 'Invalid JSON format',
        errors: ['ファイルの形式が正しくありません']
      };
    }
    
    // 必須フィールドのチェック
    if (!Array.isArray(jsonData.tasks)) {
      errors.push('tasks フィールドが配列ではありません');
    }
    
    if (!Array.isArray(jsonData.folders)) {
      errors.push('folders フィールドが配列ではありません');
    }
    
    if (!jsonData.activeTab || !['all', 'week', 'today'].includes(jsonData.activeTab)) {
      errors.push('activeTab フィールドが正しくありません');
    }
    
    // タスクの構造チェック
    if (Array.isArray(jsonData.tasks)) {
      jsonData.tasks.forEach((task: any, index: number) => {
        if (!task.id || typeof task.id !== 'string') {
          errors.push(`タスク ${index + 1}: ID が正しくありません`);
        }
        if (!task.title || typeof task.title !== 'string') {
          errors.push(`タスク ${index + 1}: タイトルが正しくありません`);
        }
        if (typeof task.completed !== 'boolean') {
          errors.push(`タスク ${index + 1}: 完了状態が正しくありません`);
        }
        if (!Array.isArray(task.tags)) {
          errors.push(`タスク ${index + 1}: タグが配列ではありません`);
        }
        // order フィールドが数値でない場合はデフォルト値を設定
        if (typeof task.order !== 'number') {
          task.order = index;
        }
      });
    }
    
    // フォルダの構造チェック
    if (Array.isArray(jsonData.folders)) {
      jsonData.folders.forEach((folder: any, index: number) => {
        if (!folder.id || typeof folder.id !== 'string') {
          errors.push(`フォルダ ${index + 1}: ID が正しくありません`);
        }
        if (!folder.name || typeof folder.name !== 'string') {
          errors.push(`フォルダ ${index + 1}: 名前が正しくありません`);
        }
        // order フィールドが数値でない場合はデフォルト値を設定
        if (typeof folder.order !== 'number') {
          folder.order = index;
        }
      });
    }
    
    if (errors.length > 0) {
      return {
        success: false,
        message: 'データに問題があります',
        errors
      };
    }
    
    // 成功時はクリーンなTodoStateを返す
    const cleanData: TodoState = {
      tasks: jsonData.tasks,
      folders: jsonData.folders,
      activeTab: jsonData.activeTab
    };
    
    return {
      success: true,
      message: 'データが正常に読み込まれました',
      data: cleanData
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'ファイルの解析に失敗しました',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * ファイルを読み込んでJSONとしてパース
 */
export function readFileAsJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('JSON形式が正しくありません'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsText(file);
  });
}