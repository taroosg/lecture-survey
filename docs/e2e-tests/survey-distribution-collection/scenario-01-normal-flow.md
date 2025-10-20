# シナリオ01: 正常系 - アンケート回答の完全フロー

## 概要

**シナリオID**: 01
**優先度**: 高
**テスト種別**: 正常系
**推定所要時間**: 10-15分

---

## ゴール

未認証ユーザーがアンケートを正常に回答できることを確認する。

---

## 前提条件

- 開発サーバー（Convex + Next.js）が起動している
- テスト用管理者アカウントが存在する
- `.env.test.local` に認証情報が設定されている

---

## テスト手順

### Phase 1: 事前準備（管理者操作）

#### 1. ログイン

- **ツール**: `browser_navigate`, `browser_snapshot`, `browser_fill_form`, `browser_click`, `browser_wait_for`
- **手順**:
  1. `browser_navigate` → `http://localhost:3000/signin`
  2. `browser_snapshot` → ログインページの確認
  3. `browser_fill_form` → メールアドレス・パスワード入力（`.env.test.local`から取得）
  4. `browser_click` → ログインボタン
  5. `browser_wait_for` → ダッシュボード表示待機

#### 2. 講義の作成

- **ツール**: `browser_navigate`, `browser_fill_form`, `browser_click`, `browser_snapshot`
- **手順**:
  1. `browser_navigate` → `http://localhost:3000/lectures/create`
  2. `browser_snapshot` → 講義作成ページの確認
  3. `browser_fill_form` → 講義情報入力
     - **講義タイトル**: "E2Eテスト用講義 - 正常系"
     - **講義日**: 未来の日付（例: 1週間後）
     - **講義時間**: "13:00"
     - **説明**: "Playwright E2Eテスト用の講義です"
     - **アンケート締切日**: 未来の日付（例: 2週間後）
     - **アンケート締切時間**: "23:59"
     - **アンケートステータス**: "active"（デフォルト）
  4. `browser_click` → 作成ボタン
  5. `browser_wait_for` → 作成完了メッセージまたはリダイレクト
  6. `browser_snapshot` → 作成された講義の詳細ページまたは一覧ページ
  7. **URLまたは画面から講義IDを取得・記録**

#### 3. ログアウト（オプション）

- 新しいブラウザコンテキストまたはタブを使用する場合は不要

---

### Phase 2: 未認証ユーザーとしてアンケートアクセス

#### 4. アンケートページへのアクセス

- **ツール**: `browser_tabs`, `browser_navigate`, `browser_snapshot`
- **手順**:
  1. `browser_tabs` → 新しいタブを開く（または新しいコンテキスト）
  2. `browser_navigate` → `http://localhost:3000/survey/[取得した講義ID]`
  3. `browser_snapshot` → ページ全体の確認

#### 5. アンケート表示の検証

- **ツール**: `browser_snapshot`
- **確認項目**:
  - ✅ 講義タイトル表示
  - ✅ 講義日時表示
  - ✅ 説明文表示
  - ✅ 性別選択肢（男性、女性、その他、回答しない）
  - ✅ 年代選択肢（20歳未満、20代、30代、40代、50代、60代、70代以上）
  - ✅ 理解度（1-5の評価）
  - ✅ 満足度（1-5の評価）
  - ✅ フリーコメント入力欄

---

### Phase 3: アンケート回答入力

#### 6. フォームへの入力

- **ツール**: `browser_click`, `browser_type`, `browser_snapshot`
- **手順**:
  1. `browser_click` → 性別ラジオボタン（例: "男性"）
  2. `browser_snapshot` → 選択状態確認
  3. `browser_click` → 年代ラジオボタン（例: "30代"）
  4. `browser_snapshot` → 選択状態確認
  5. `browser_click` → 理解度ラジオボタン（例: "5 - 非常によく理解できた"）
  6. `browser_snapshot` → 選択状態確認
  7. `browser_click` → 満足度ラジオボタン（例: "4 - 満足"）
  8. `browser_snapshot` → 選択状態確認
  9. `browser_type` → フリーコメント入力
     - **入力値**: "とても良い講義でした。E2Eテストからの投稿です。"
  10. `browser_snapshot` → 全ての入力値確認

---

### Phase 4: 送信と完了画面の確認

#### 7. 送信

- **ツール**: `browser_click`, `browser_wait_for`
- **手順**:
  1. `browser_click` → 「回答を送信」ボタン
  2. `browser_wait_for` → "回答ありがとうございました" テキスト表示待機

#### 8. 完了画面の検証

- **ツール**: `browser_snapshot`, `browser_take_screenshot`
- **確認項目**:
  - ✅ チェックマークアイコン表示
  - ✅ "回答ありがとうございました" 見出し
  - ✅ "アンケートの回答が正常に送信されました。" メッセージ
- **手順**:
  1. `browser_snapshot` → 完了画面の確認
  2. `browser_take_screenshot` → 完了画面のスクリーンショット保存（オプション）

---

### Phase 5: データベース確認（オプション）

#### 9. 管理者画面で回答データ確認

- **方法**: Convexダッシュボードで直接確認
- **確認内容**:
  - `requiredResponses` テーブルに回答データが保存されている
  - 講義IDが正しい
  - 回答内容が正しく保存されている

---

## 期待結果

- ✅ アンケートフォームが正常に表示される
- ✅ 全ての項目が入力可能
- ✅ 送信が成功する
- ✅ 完了画面に遷移する
- ✅ データベースに回答が保存される

---

## テストデータ

### 講義データ

```typescript
{
  title: "E2Eテスト用講義 - 正常系",
  lectureDate: "2025-10-27", // 未来の日付
  lectureTime: "13:00",
  description: "Playwright E2Eテスト用の講義です",
  surveyCloseDate: "2025-11-03", // 未来の日付
  surveyCloseTime: "23:59",
  surveyStatus: "active"
}
```

### 回答データ

```typescript
{
  gender: "male",
  ageGroup: "30s",
  understanding: 5,
  satisfaction: 4,
  freeComment: "とても良い講義でした。E2Eテストからの投稿です。"
}
```

---

## Playwright MCPツール一覧

| ツール                    | 用途               | 使用例                   |
| ------------------------- | ------------------ | ------------------------ |
| `browser_navigate`        | ページ遷移         | URLにアクセス            |
| `browser_snapshot`        | 要素確認           | ページ構造・テキスト確認 |
| `browser_click`           | クリック操作       | ボタン・ラジオボタン     |
| `browser_type`            | テキスト入力       | テキストエリア           |
| `browser_fill_form`       | フォーム入力       | 複数フィールド一括入力   |
| `browser_wait_for`        | 非同期待機         | テキスト表示待機         |
| `browser_tabs`            | タブ管理           | 新しいタブ作成           |
| `browser_take_screenshot` | スクリーンショット | デバッグ・記録用         |

---

## 注意事項

### データの準備

- 各テスト実行で独立した講義データを作成する
- 講義IDは必ず記録する

### 待機処理

- 非同期処理には必ず `browser_wait_for` を使用
- Convexのリアルタイム更新を考慮して適切な待機時間を設定

### ブラウザの状態管理

- 管理者操作後は新しいタブまたはコンテキストで未認証テストを実行
- セッション状態が影響しないように注意

---

## 関連ドキュメント

- [テスト概要](./overview.md)
- [環境セットアップ](../setup.md)
- [実行結果テンプレート](../templates/result-template.md)
