# Todo App

GitHub Pages対応のReact + TypeScript Todoアプリです。

## 機能

- **3つのタブ**: 全やること、今週やること、今日やること
- **階層構造**: 無制限の深さのフォルダ（ツリー構造）
- **ドラッグ&ドロップ**: 同一セクション内、階層間の移動
- **タスク管理**: タイトル、メモ、完了ステータス
- **タグ機能**: 「今日」「今週」タグでの分類
- **右クリックメニュー**: タグの付け外し
- **データ永続化**: ローカルストレージ

## 技術スタック

- **Frontend**: React 18, TypeScript 5
- **Styling**: Tailwind CSS 3
- **Build Tool**: Vite 4
- **Drag & Drop**: @hello-pangea/dnd
- **Deployment**: GitHub Pages

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## デプロイ

```bash
# GitHub Pagesにデプロイ
npm run deploy
```

## プロジェクト構成

```
src/
├── components/          # UIコンポーネント
│   ├── TabNavigation.tsx
│   ├── TodoSection.tsx
│   ├── FolderTree.tsx
│   ├── TaskItem.tsx
│   ├── FolderItem.tsx
│   ├── AddButton.tsx
│   ├── TaskModal.tsx
│   └── ContextMenu.tsx
├── hooks/              # カスタムフック
│   ├── useTodoStore.ts
│   └── useLocalStorage.ts
├── types/              # 型定義
│   └── index.ts
├── utils/              # ユーティリティ関数
│   └── helpers.ts
├── App.tsx             # メインアプリケーション
├── main.tsx           # エントリーポイント
└── index.css          # スタイル
```

## 使い方

1. **タスクの追加**: 「+」ボタンからタスクを追加
2. **フォルダの作成**: 「+」ボタンからフォルダを作成
3. **タスクの編集**: タスクをクリックしてモーダルで編集
4. **タグの管理**: タスクを右クリックしてタグを追加/削除
5. **ドラッグ&ドロップ**: アイテムをドラッグして移動
6. **完了の切り替え**: チェックボックスで完了/未完了を切り替え

## ライセンス

MIT License# todo_app
