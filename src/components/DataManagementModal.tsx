import React, { useState, useRef } from 'react';
import { TodoState } from '../types';
import { exportData, validateImportData, readFileAsJSON, ImportResult } from '../utils/dataExport';

interface DataManagementModalProps {
  isOpen: boolean;
  currentData: TodoState;
  onClose: () => void;
  onImport: (data: TodoState, mergeMode: 'replace' | 'merge') => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  currentData,
  onClose,
  onImport
}) => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportData(currentData);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const jsonData = await readFileAsJSON(file);
      const result = validateImportData(jsonData);
      
      setImportResult(result);
      
      if (result.success && result.data) {
        // すぐにインポートするのではなく、確認を求める
        if (window.confirm(
          mergeMode === 'replace' 
            ? '現在のデータを置き換えますか？この操作は元に戻せません。'
            : '新しいデータを追加しますか？'
        )) {
          onImport(result.data, mergeMode);
          onClose();
        }
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'ファイルの処理に失敗しました',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setImporting(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">データ管理</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        
        <div className="p-6" onKeyDown={handleKeyDown}>
          {/* エクスポート機能 */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-800 mb-3">📥 データのエクスポート</h3>
            <p className="text-sm text-gray-600 mb-4">
              現在のすべてのタスクとフォルダをJSONファイルとしてダウンロードします。
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              📥 エクスポート
            </button>
          </div>

          {/* インポート機能 */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">📤 データのインポート</h3>
            <p className="text-sm text-gray-600 mb-4">
              以前にエクスポートしたJSONファイルからデータを復元します。
            </p>
            
            {/* マージモード選択 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                インポート方法
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mergeMode"
                    value="merge"
                    checked={mergeMode === 'merge'}
                    onChange={(e) => setMergeMode(e.target.value as 'merge')}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    <strong>追加</strong> - 既存のデータに新しいデータを追加
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mergeMode"
                    value="replace"
                    checked={mergeMode === 'replace'}
                    onChange={(e) => setMergeMode(e.target.value as 'replace')}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    <strong>置換</strong> - 現在のデータを完全に置き換え
                  </span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleImportClick}
                disabled={importing}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? '📤 処理中...' : '📤 インポート'}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* インポート結果表示 */}
          {importResult && (
            <div className={`p-4 rounded-lg border ${
              importResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.success ? '✅' : '❌'} {importResult.message}
              </div>
              
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-red-700 mb-1">エラー詳細:</div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ 重要な注意事項</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 「置換」を選択すると現在のデータは失われます</li>
              <li>• インポート前に現在のデータをエクスポートしてバックアップを作成することをお勧めします</li>
              <li>• 大量のデータをインポートする場合は時間がかかることがあります</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose} 
            className="btn-secondary"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagementModal;