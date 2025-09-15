# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start both frontend and backend in parallel (Next.js dev server + Convex backend)
- `npm run dev:frontend` - Start only the Next.js development server
- `npm run dev:backend` - Start only the Convex backend development server
- `npm run predev` - Initialize Convex development environment with dashboard

### Build & Deployment

- `npm run build` - Build the Next.js application for production
- `npm run start` - Start the production Next.js server
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Run Prettier to format code

### Testing

- `npm run test` - Run tests in watch mode using Vitest
- `npm run test:once` - Run tests once
- `npm run test:debug` - Run tests with debugging support
- `npm run test:coverage` - Run tests with coverage reporting

## Architecture

This is a full-stack application built with **Convex + Next.js + Convex Auth**.

### Stack Components

- **Backend**: Convex (database + server functions)
- **Frontend**: Next.js with React 19
- **Authentication**: Convex Auth
- **Styling**: Tailwind CSS
- **Testing**: Vitest

### Key Directories

- `convex/` - Backend functions, schema, and configuration
  - `schema.ts` - Database schema definition with auth tables
  - `myFunctions.ts` - Example queries, mutations, and actions
  - `auth.config.ts` - Authentication provider configuration
  - `_generated/` - Auto-generated Convex types and API
- `app/` - Next.js App Router pages and layouts
- `components/` - React components (includes ConvexClientProvider)

### Convex Function Patterns

- All functions use the new function syntax with explicit args/returns validators
- Public functions: `query`, `mutation`, `action` (exposed to frontend)
- Internal functions: `internalQuery`, `internalMutation`, `internalAction` (server-only)
- Functions must include validators for arguments and return types
- Authentication integration via `getAuthUserId(ctx)`

### Key Configuration

- Uses npm-run-all for parallel development servers
- Configured with TypeScript, ESLint, and Prettier
- Authentication provider configured for Convex site URL
- Client-side auth integration through ConvexAuthNextjsProvider

### Development Notes

- The app includes example functionality for managing numbers with real-time updates
- Authentication state is managed through Convex Auth hooks
- Uses Convex's real-time subscriptions for reactive UI updates
- Includes comprehensive Cursor rules for Convex development best practices

## コーディングスタイル

- ESLintルールに従ってください．
- any型は使用しないでください．
- 関数は小さく、単一責任の原則に従ってください．関数型プログラミングの考え方に基づいて関数の設計を行ってください．
- 実装時はSOLID, KISS, DRY, YAGNIの各原則に従って実装してください．
- 非同期処理にはasync/awaitを使用してください．
- テストファイルはテスト対象と同ディレクトリの**tests**ディレクトリに配置し，テストケース（条件と想定される結果）を日本語で記述してください．
- テストは最後に実装するのではなく，関数やコンポーネントを作成したらすぐに作成してテストする流れで開発してください．
- 以下の操作は作業開始時に必ず行ってください．
  - **作業開始時**: developブランチを元にして必ず専用ブランチを作成する（feature-<機能名>，feature-<修正内容>等）
    1. developブランチに切り替える．
    2. ローカルのdevelopブランチを最新にする．
    3. 新しい作業用ブランチを作成する．
    4. 新しい作業用ブランチに切り替える．
  - **mainブランチでの直接作業は絶対禁止**: いかなる変更もmainブランチに直接コミットしない．
  - **developブランチでの直接作業は絶対禁止**: いかなる変更もdevelopブランチに直接コミットしない．
  - 以下を必ず作業終了時に実行してください．
    1. 必ず `npx convex codegen` を実行して自動生成ファイルを作成する．
    2. `npm run lint`, `npm run format`, `npm run test` , `npm run build` , `npm run dev` を実行し，エラーのない状態にする．
    3. 修正を行った場合は，修正後に必ず1と2の手順を再度実行する．
    4. 作業内容をコミットする．変更が大きい場合には一つの論理的な単位に分割してコミットする．
    5. リモートブランチにpushする．
    6. プルリクエスト作成時には作業ブランチからdevelopブランチに対して作成する．
- 参考プロジェクトの開発ドキュメント（`feedback-cloud2-main/docs` ディレクトリ内のmdファイル）に実装要件が記載されているので実装前に内容を確認してください．

## 修正時の注意点

- 修正を行う際には必ず以下のことに順守してください．
  - 該当修正によって他の処理に問題がないか慎重に確認を行って作業を行ってください．
  - 他の動作に関しても修正が必要な場合は既存の期待値の動作が正常に起動するように修正してください．

## コミット前に確認すること（必ず実施）

- 1つの論理的な変更ごとにコミットすること．
- コミット前には必ず動作確認を行って動作が問題ないかを確認してください．
  - 動作確認中にエラーが発見された際はタスクを更新してください．
  - コミットする際はエラーがない状態で行ってください．
