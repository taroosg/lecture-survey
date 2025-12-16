# Lectue-Survey開発ドキュメント

講義満足度アンケートシステムの開発者向けドキュメントです。

## 📋 目次

### 🏗️ アーキテクチャ

システムの設計と構造について理解するためのドキュメント群

- **[システム概要](./architecture/system-overview.md)** - 全体アーキテクチャと技術スタック
- **[データベーススキーマ](./architecture/database-schema.md)** - Convexスキーマの詳細設計
- **[レイヤーアーキテクチャ](./architecture/layer-architecture.md)** - 4層アーキテクチャの構成と責務
- **[データフロー](./architecture/data-flow.md)** - リアルタイム同期と状態管理

## 新規開発者向け

1. **[環境構築](./development/environment-setup.md)** - 開発環境をセットアップ
2. **[プロジェクト構造](./development/project-structure.md)** - ディレクトリ構成を理解
3. **[システム概要](./architecture/system-overview.md)** - 全体像を把握
4. **[コーディング規約](./development/coding-standards.md)** - 開発規約を確認

## 既存開発者向け

- **[レイヤーアーキテクチャ](./architecture/layer-architecture.md)** - 設計パターンの詳細確認
- **[Convexパターン](./development/convex-patterns.md)** - 実装パターンの参照
- **[テストガイド](./development/testing-guide.md)** - テスト作成・実行方法

## 📚 関連ドキュメント

### 設定ファイル

- **[CLAUDE.md](../CLAUDE.md)** - AI開発アシスタント用プロジェクト指示
- **[package.json](../package.json)** - 依存関係とスクリプト定義

## 🛠️ 開発コマンド

### 開発サーバー

```bash
npm run dev          # フロントエンド・バックエンド並行起動
npm run dev:frontend # Next.jsのみ起動
npm run dev:backend  # Convexのみ起動
```

### コード品質

```bash
npm run lint         # ESLint実行
npm run format       # Prettier実行
npm run type-check   # TypeScript型チェック
```

### テスト

```bash
npm run test:once    # 全テスト実行
npm run test:coverage # カバレッジ付き実行
```

### ビルド・デプロイ

```bash
npm run build        # プロダクションビルド
```

### Convex

```bash
npx convex codegen   # 型定義生成
```

## 🔧 技術スタック

| カテゴリ           | 技術         | バージョン | 用途                       |
| ------------------ | ------------ | ---------- | -------------------------- |
| **フロントエンド** | Next.js      | 15.2.3     | Reactフレームワーク        |
|                    | React        | 19         | UIライブラリ               |
|                    | Tailwind CSS | v4         | CSSフレームワーク          |
| **バックエンド**   | Convex       | Latest     | データベース・サーバー関数 |
| **認証**           | Convex Auth  | Latest     | 認証システム               |
| **テスト**         | Vitest       | 1.0.0      | テストフレームワーク       |
| **言語**           | TypeScript   | 5.x        | 型安全性                   |

## 📖 学習リソース

### Convex関連

- [Convex公式ドキュメント](https://docs.convex.dev/)
- [Convex Auth](https://labs.convex.dev/auth)
- [Convex Best Practices](../document/convex-best-practices.md)

### Next.js関連

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [React公式ドキュメント](https://react.dev/)

### 開発ツール

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

## 💡 開発のヒント

### よくある操作

```bash
# 新機能開発を始める
git checkout develop && git pull origin develop
git checkout -b feature-issue123-description
npm run dev

# 作業終了時
npx convex codegen
npm run lint && npm run test && npm run build
npm run format
git add . && git commit -m "feat: 機能説明"
git push origin feature-issue123-description
```

### トラブルシューティング

- 型エラー → `npx convex codegen` 実行

## 🤝 コントリビューション

### プルリクエスト

1. 作業ブランチから`develop`に対してPR作成
2. レビューを受けてマージ
3. `develop`から`main`への定期マージ

### コードレビュー観点

- アーキテクチャ原則の遵守
- テストカバレッジの確保
- ドキュメントの追加・更新
- パフォーマンスへの配慮
- セキュリティ考慮事項

## ドキュメント運用ルール

- 機能追加の場合は必ずUXから記述する．
- Feature / Screen を新規作成するときは必ず既存の UX と紐づけるか，新しい UX を定義してから作成する．
- Featureドキュメントは少なくとも1つのUXを関連UXとして持つこと．
- Screenドキュメントは少なくとも1つのFeatureを関連Featureとして持つこと．
- 実装完了時点ではすべてのUXが少なくとも1つのFeatureまたはScreenと紐づいていることを目標とする．
- 仕様変更が発生した場合はコードだけでなく仕様ドキュメントも必ず更新する．
- Featureを更新したら関連するScreenの内容（操作・要素・遷移）がズレていないか確認する．
- UX を更新したらそのUXに紐づくFeature/Screenが，その UX を正しく満たしているか確認する．
- 1つのUXドキュメントは1つのユーザーの目的に対応させる．
- 1つのFeatureドキュメントは1つのまとまった振る舞い or ビジネスルールの塊を対象とする．
- 1つのScreenドキュメントは1画面に対応する．
- ドキュメントを更新した場合はhistory.mdに更新日と更新内容を追記する．
