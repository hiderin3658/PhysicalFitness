# 体力測定アプリ

体力測定の結果を記録・管理するためのウェブアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase
- **認証**: Supabaseの認証機能

## 環境構築

1. リポジトリをクローン
```bash
git clone <repository-url>
cd physical_fitness_test
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数の設定
   - `.env.local.example`を`.env.local`にリネーム
   - Supabaseの設定値を入力
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 開発サーバー起動
```bash
npm run dev
```

## Supabaseのセットアップ

1. [Supabase](https://supabase.com/)でアカウント作成とプロジェクト作成
2. 以下のテーブルを作成:

### usersテーブル
- id (uuid, primary key)
- lastName (text)
- firstName (text)
- gender (text)
- birthDate (date)
- medicalHistory (text[])
- createdAt (timestamp with timezone)
- updatedAt (timestamp with timezone)

### measurementsテーブル
- id (uuid, primary key)
- userId (uuid, foreign key)
- measurementDate (date)
- height (numeric)
- weight (numeric)
- tug (jsonb, 以下の構造)
  - first (numeric)
  - second (numeric)
  - best (numeric)
- walkingSpeed (jsonb, 以下の構造)
  - first (numeric)
  - second (numeric)
  - best (numeric)
- fr (jsonb, 以下の構造)
  - first (numeric)
  - second (numeric)
  - best (numeric)
- cs10 (numeric)
- bi (numeric)
- notes (text)
- createdAt (timestamp with timezone)
- updatedAt (timestamp with timezone)

3. RLSポリシーの設定（必要に応じて）

## 機能一覧

- ユーザー登録・管理
- 体力測定データの登録
- 測定結果の表示・分析
- 過去データとの比較

## コマンド

- `npm run dev`: 開発サーバーの起動
- `npm run build`: プロダクションビルド
- `npm run start`: プロダクションサーバーの起動
- `npm run lint`: コードの静的解析
