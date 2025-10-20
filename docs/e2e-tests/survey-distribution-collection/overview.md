# アンケート配布・回収機能 E2Eテスト

## テスト目的

講義に対するアンケート配布・回収機能が正常に動作することを、エンドユーザーの視点から包括的に検証します。

- アンケート配布から回収までの一連のフローが正常に動作すること
- エラーケースが適切にハンドリングされること
- ユーザー体験が期待通りであること

---

## テスト環境

- **ブラウザ**: Playwright MCP (Chromium)
- **バックエンド**: Convex開発環境
- **認証**: Convex Auth
- **実行方法**: 手動（Claude Code + Playwright MCP）

---

## テスト前提条件

以下の条件が満たされていることを確認してください:

1. ✅ Convex開発環境が起動している (`npm run dev:backend`)
2. ✅ Next.js開発サーバーが起動している (`npm run dev:frontend`)
3. ✅ テスト用管理者アカウントが存在する
4. ✅ `.env.test.local` に認証情報が設定されている
5. ✅ データベースがクリーンな状態、または既知の状態である

詳細は [setup.md](../setup.md) を参照してください。

---

## テストシナリオ一覧

| ID  | シナリオ名                      | 優先度 | ステータス | 最終実行日 |
| --- | ------------------------------- | ------ | ---------- | ---------- |
| 01  | [正常系フロー](./scenario-01-normal-flow.md) | 高     | ✅ 完了    | 2025-10-20 |

### 今後追加予定のシナリオ

| ID  | シナリオ名                      | 優先度 | 説明 |
| --- | ------------------------------- | ------ | ---- |
| 02  | バリデーション - 必須項目未入力 | 高     | 必須項目未入力時のエラー表示確認 |
| 03  | エラーケース - 期限切れアンケート | 中     | 期限切れアンケートへのアクセス時のエラー表示 |
| 04  | エラーケース - 終了済みアンケート | 中     | 終了済みアンケートへのアクセス時のエラー表示 |
| 05  | エラーケース - 存在しない講義ID   | 低     | 無効な講義IDでのアクセス時のエラー表示 |

---

## 実行履歴

- **[2025-10-20 シナリオ01実行結果](./results/2025-10-20-scenario-01-result.md)** - ✅ 合格

---

## 実装済み機能

### Internal Query層

- `convex/queries/responses/checkSurveyAvailable.ts`
  - アンケート利用可否チェック
  - 講義存在確認、ステータス確認、期限チェック

### Public API層

- `convex/api/responses.ts`
  - `checkSurveyAvailable` (query) - 未認証アクセス可能
  - `submitResponse` (mutation) - 未認証アクセス可能

### Mutation層

- `convex/mutations/lectures/submitResponse.ts` (既存)
  - `submitResponseWithDuplicateCheck` - IP重複チェック付き回答送信

### Frontend

- `app/survey/[id]/page.tsx`
  - アンケート回答ページ
  - 5項目フォーム（性別、年代、理解度、満足度、フリーコメント）
  - バリデーション
  - 送信完了画面

---

## 関連Issue

- [Issue #43: アンケート配布・回収機能の実装](https://github.com/taroosg/lecture-survey/issues/43)

---

## 参考情報

- [Playwright MCP Tools一覧](./scenario-01-normal-flow.md#playwright-mcpツール一覧)
- [テスト環境セットアップ](../setup.md)
