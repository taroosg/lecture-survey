# アンケート結果の分析・集計機能 実装計画

**Issue**: #48
**作成日**: 2025-10-20
**ブランチ**: feature-analysis

---

## 概要

講義アンケートの結果を自動的に集計・分析し、講義詳細ページに表示する機能を実装する。

参考プロジェクト（feedback-cloud2-main）の実装パターンに従う。

---

## 実装する機能

### 1. 自動締切・自動分析

- Cron（5分間隔）で期限切れアンケートを自動締切
- 状態遷移: `active` → `closed` → `analyzed`
- 締切後、即座に分析を自動実行

### 2. サマリー表示

理解度・満足度それぞれについて：

- 平均スコア（小数第2位まで）
- 回答数
- 全講義平均スコア（該当ユーザが作成した全講義の平均）

### 3. 単純集計

- 性別
- 年代
- 理解度（1-5段階）
- 満足度（1-5段階）

### 4. クロス集計（4パターン）

- 理解度 × 性別
- 理解度 × 年代
- 満足度 × 性別
- 満足度 × 年代

---

## 実装しない機能

- メール通知機能
- Top Box率・Bottom Box率
- 前回講義との比較
- 訪問頻度・同行者・認知経路・来場理由の集計

---

## アーキテクチャ

### 4層構造

```
API層 (Public Query)
    ↓
Action層 (Orchestration)
    ↓
Query/Mutation層 (Internal)
    ↓
Service層 (Pure Functions)
```

### データモデル（Star Schema）

- `resultSets`: 分析実行のメタデータ
- `resultFacts`: 統計データ（単純集計・クロス集計・サマリー）

---

## 実装フェーズ

### Phase 1: スキーマ定義

- lectures.ts更新（surveyStatus に "analyzed" 追加、analyzedAt追加）
- analysis.ts作成（resultSets, resultFacts）
- schema.ts更新（テーブル登録）
- 型定義（analysis.ts）
- 質問定義（definitions.ts）

### Phase 2: Service層（Pure Functions）

- 統計計算ユーティリティ
- 単純集計Calculator
- クロス集計Calculator
- サマリーCalculator
- データ変換Transformer
- バリデーター

### Phase 3: Query/Mutation層

- Internal Queries（分析用データ取得、統計取得、締切用）
- Internal Mutations（結果保存、締切処理、ステータス更新）

### Phase 4: Action層

- 完全分析実行
- 締切オーケストレーション

### Phase 5: Cron設定

- アンケート自動締切ジョブ追加（5分間隔）

### Phase 6: API層（Public）

- Public Query API

### Phase 7: Frontend

- 講義詳細ページ（/lectures/[id]）
- 分析状態表示コンポーネント
- サマリーコンポーネント
- 単純集計コンポーネント
- クロス集計コンポーネント

### Phase 8: テスト

- バックエンドロジックテスト
- フロントエンドロジックテスト
- ※表示テストは実装しない

---

## 開発ルール

### 作業終了時（コミット前に必ず実行）

```bash
npx convex codegen
npm run lint
npm run format
npm run test
npm run build
npm run dev  # 動作確認
```

修正を行った場合は再度上記を実行する。

### コミット

- 1つの論理的な変更ごとにコミット
- コミット前に必ず動作確認
- エラーがない状態でコミット

### プルリクエスト

- feature-analysis → developブランチ

---

## 参考資料

- 参考プロジェクト: `feedback-cloud2-main/`
- GitHub Issue: #48
