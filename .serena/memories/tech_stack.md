# 技術スタック

## フロントエンド
- **フレームワーク**: Next.js 15.2.3 (React 19)
- **スタイリング**: Tailwind CSS v4
- **TypeScript**: v5

## バックエンド
- **プラットフォーム**: Convex
- **認証**: Convex Auth v0.0.81

## 開発・テスト環境
- **テスト**: Vitest v3.2.4
- **リンター**: ESLint v9
- **フォーマッター**: Prettier v3.5.3
- **バージョン管理**: Git（GitHub）

## 主要依存関係
### 本番依存関係
- `@convex-dev/auth`: ^0.0.81
- `convex`: ^1.23.0
- `next`: 15.2.3
- `react`: ^19.0.0
- `react-dom`: ^19.0.0

### 開発依存関係
- `@testing-library/jest-dom`: ^6.7.0
- `@testing-library/react`: ^16.3.0
- `convex-test`: ^0.0.38
- `eslint`: ^9
- `prettier`: ^3.5.3
- `vitest`: ^3.2.4
- `tailwindcss`: ^4
- `typescript`: ^5
- `npm-run-all`: ^4.1.5

## アーキテクチャ
- フルスタックアプリ: Convex + Next.js + Convex Auth
- Convex: バックエンド（データベース + サーバー関数）
- Next.js: フロントエンド（React 19 + App Router）
- リアルタイム更新: Convexのリアルタイム機能を活用