import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// .env.test.local ファイルから環境変数を読み込む
const envPath = path.resolve(__dirname, ".env.test.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(
    "⚠️  .env.test.local が見つかりません。.env.test.local.example をコピーして作成してください。",
  );
}

/**
 * Playwright設定ファイル
 * アンケート負荷テスト用の設定
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: "./tests",

  // 並列実行数（初回は10件なので3ワーカー）
  // 件数を増やす場合は適宜調整してください
  workers: 3,

  // 各テストのタイムアウト（30秒）
  timeout: 30000,

  // テスト実行時の設定
  use: {
    // ヘッドレスモードで実行（高速化）
    headless: true,

    // スクリーンショット：失敗時のみ
    screenshot: "only-on-failure",

    // ビデオ：失敗時のみ保存
    video: "retain-on-failure",

    // トレース：失敗時のみ保存
    trace: "retain-on-failure",
  },

  // ブラウザプロジェクト設定
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // レポーター設定
  reporter: [
    ["list"], // コンソールに結果を出力
    ["html", { outputFolder: "playwright-report" }], // HTMLレポート生成
  ],
});
