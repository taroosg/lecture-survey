# E2Eテスト ドキュメント

## 概要

このディレクトリには、lecture-surveyプロジェクトのE2Eテストに関するドキュメントが含まれています。

Playwright MCPを使用して、Claude Codeから手動でテストを実行します。

---

## セットアップ

テストを実行する前に、必ず環境セットアップを完了してください。

- **[環境セットアップガイド](./setup.md)**

---

## テスト機能一覧

### 実装済み

- **[アンケート配布・回収機能](./survey-distribution-collection/overview.md)**
  - 講義に対するアンケートの配布から回収までの一連のフロー

### 今後追加予定

- 講義管理機能
- 認証機能
- データ分析機能

---

## テンプレート

新しいテストシナリオや実行結果を記録する際は、以下のテンプレートを使用してください。

- **[シナリオテンプレート](./templates/scenario-template.md)**
- **[実行結果テンプレート](./templates/result-template.md)**

---

## ディレクトリ構成

```
docs/e2e-tests/
├── README.md                           # このファイル
├── setup.md                            # 環境セットアップガイド
│
├── survey-distribution-collection/     # アンケート配布・回収機能のテスト
│   ├── overview.md                     # テスト全体の概要
│   ├── scenario-01-normal-flow.md      # シナリオ1: 正常系
│   └── results/                        # テスト実行結果
│       └── 2025-10-20-scenario-01-result.md
│
└── templates/                          # テンプレート
    ├── scenario-template.md            # シナリオドキュメントテンプレート
    └── result-template.md              # 実行結果記録テンプレート
```

---

## テスト実行の流れ

1. **環境セットアップ**
   - [setup.md](./setup.md) の手順に従って環境を準備

2. **テストシナリオの確認**
   - 各機能のディレクトリ内のシナリオファイルを確認

3. **Claude Codeでテスト実行**
   - Playwright MCPツールを使用してテストを実行
   - 各手順を順番に実行

4. **実行結果の記録**
   - `results/` ディレクトリに実行結果を記録
   - テンプレートを使用して統一フォーマットで記録

---

## 関連リンク

- [Playwright MCP Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)
- [プロジェクトのCLAUDE.md](../../CLAUDE.md)
