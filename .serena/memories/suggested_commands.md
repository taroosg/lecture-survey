# 開発コマンド

## 開発サーバー
- `npm run dev` - フロントエンドとバックエンドを並列で起動（メインコマンド）
- `npm run dev:frontend` - Next.js開発サーバーのみ起動
- `npm run dev:backend` - Convex開発サーバーのみ起動
- `npm run predev` - Convex開発環境の初期化とダッシュボード起動

## ビルド・デプロイ
- `npm run build` - 本番用Next.jsアプリのビルド
- `npm run start` - 本番用Next.jsサーバー起動

## コード品質
- `npm run lint` - ESLintによるコード品質チェック
- `npm run format` - Prettierによるコードフォーマット
- `npm run format:check` - フォーマットチェック（変更なし）

## テスト
- `npm run test` - Vitestによるテスト実行（watch mode）
- `npm run test:once` - テストを1回実行
- `npm run test:debug` - デバッグモードでテスト実行
- `npm run test:coverage` - カバレッジレポート付きでテスト実行

## 作業完了時に必ず実行するコマンド（CLAUDE.mdより）
1. `npm run lint` - ESLintチェック
2. `npm run format` - コードフォーマット
3. `npm run test` - テスト実行
4. `npm run build` - ビルドチェック
5. `npm run dev` - 開発サーバー起動確認

## Gitワークフロー（CLAUDE.mdより）
### 作業開始時（必須）
1. `git checkout develop` - developブランチに切り替え
2. `git pull origin develop` - ローカルのdevelopブランチを最新にする
3. `git checkout -b feature-<機能名>` - 新しい作業用ブランチを作成
4. `git switch feature-<機能名>` - 新しい作業用ブランチに切り替え

### 作業終了時（必須）
1. 上記の品質チェックコマンド実行
2. `git add .` - 変更をステージング
3. `git commit -m "コミットメッセージ"` - コミット作成
4. `git push -u origin feature-<機能名>` - リモートブランチにプッシュ
5. プルリクエスト作成（作業ブランチ → developブランチ）

## 重要な制約
- **mainブランチでの直接作業は絶対禁止**
- **developブランチでの直接作業は絶対禁止**
- 必ず専用ブランチを作成して作業する