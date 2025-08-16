# プロジェクト構造

## 現在のディレクトリ構成

```
/
├── app/                    # Next.js App Router
│   ├── server/            # サーバーサイドページ
│   ├── signin/            # サインインページ
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx          # ホームページ
│   └── globals.css       # グローバルCSS
├── convex/               # Convex バックエンド
│   ├── _generated/       # Convex生成ファイル
│   ├── auth.config.ts    # 認証設定
│   ├── auth.ts          # 認証処理
│   ├── http.ts          # HTTP処理
│   ├── myFunctions.ts   # サンプル関数
│   ├── schema.ts        # スキーマ統合
│   └── tsconfig.json    # Convex用TypeScript設定
├── components/           # Reactコンポーネント
├── public/              # 静的ファイル
├── middleware.ts        # Next.jsミドルウェア
├── package.json         # プロジェクト設定
├── tsconfig.json        # TypeScript設定
├── vitest.config.ts     # テスト設定
├── CLAUDE.md           # Claude Code用指示書
└── plan.md             # プロジェクト計画書（Git管理外）
```

## 計画されているディレクトリ構成（plan.mdより）

```
convex/
├── domains/                      # ドメイン別ディレクトリ
│   ├── lectures/                 # 講義管理ドメイン
│   ├── surveys/                  # アンケート管理ドメイン
│   ├── responses/                # 回答管理ドメイン
│   ├── analysis/                 # 分析ドメイン（第2フェーズ）
│   └── users/                    # ユーザー管理ドメイン
├── shared/                       # 共通機能
│   ├── lib/                      # ユーティリティ
│   ├── schemas/                  # データベーススキーマ
│   ├── types/                    # 型定義
│   └── middlewares/             # 共通ミドルウェア
├── crons/                       # Cron処理
├── _generated/                  # Convex生成ファイル
├── auth.config.ts              # 認証設定
├── auth.ts                     # 認証処理
└── schema.ts                   # スキーマ統合
```

## 参考プロジェクト

- URL: https://github.com/dsc-web-com/feedback-cloud2
- リファクタリング中で、refactoring.mdにリファクタリング目標が記載
- 本プロジェクトはこの参考プロジェクトの構造を講義用にアレンジ

## 現在の主要ファイル

- `convex/myFunctions.ts`: サンプルのConvex関数
- `convex/schema.ts`: 現在のスキーマ定義（numbersテーブル）
- `convex/auth.config.ts`: Convex Auth設定
- `app/page.tsx`: メインページ
- `components/`: ConvexClientProviderなどの共通コンポーネント

## 次のステップ（issue#4対応）

1. `convex/shared/schemas/` ディレクトリの作成
2. 各スキーマファイルの実装（users, lectures, questionSets, responses, operationLogs）
3. サンプルテーブル（numbers）の削除
4. `convex/schema.ts` の更新
