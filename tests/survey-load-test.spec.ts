import { test, expect } from "@playwright/test";

// テスト実行回数
const TEST_COUNT = 10;
// テスト用のアンケートURL（環境変数から取得）
const SURVEY_URL = process.env.SURVEY_URL || "";

// 環境変数のチェック
if (!SURVEY_URL) {
  throw new Error(
    "SURVEY_URL が設定されていません。.env.test.local に設定してください。",
  );
}

// 並列実行を有効化
test.describe.configure({ mode: "parallel" });

/**
 * ランダムな選択肢を返すヘルパー関数
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * ランダムなアンケート回答データを生成
 * 理解度・満足度は平均4.0程度を目標として[3, 4, 4, 5]からランダムに選択
 */
function generateRandomSurveyData(index: number) {
  const genderValues = ["male", "female", "other", "preferNotToSay"];
  const ageGroupValues = [
    "under20",
    "20s",
    "30s",
    "40s",
    "50s",
    "60s",
    "over70",
  ];

  // 理解度・満足度：平均4.0を目標に[3, 4, 4, 5]からランダム選択
  const ratingScores = [3, 4, 4, 5];

  const comments = [
    "とても有意義な講義でした。内容が分かりやすく、理解が深まりました。",
    "講師の説明が丁寧で、難しい内容も理解できました。",
    "実践的な内容で、すぐに活用できそうです。",
    "資料も充実していて、復習に役立ちそうです。",
    "他の受講者との意見交換も勉強になりました。ありがとうございました。",
  ];

  const understandingScore = randomChoice(ratingScores);
  const satisfactionScore = randomChoice(ratingScores);

  return {
    gender: randomChoice(genderValues),
    ageGroup: randomChoice(ageGroupValues),
    understanding: String(understandingScore),
    satisfaction: String(satisfactionScore),
    understandingScore,
    satisfactionScore,
    comment: `テスト回答${index}: ${randomChoice(comments)}`,
  };
}

for (let i = 0; i < TEST_COUNT; i++) {
  test(`Survey submission #${i + 1}`, async ({ page }) => {
    const data = generateRandomSurveyData(i + 1);

    // アンケートページへ移動
    // テスト用のアンケートURLを環境変数SURVEY_URLに設定する
    await page.goto(SURVEY_URL);

    // ページが読み込まれるまで待機
    await page.waitForLoadState("networkidle");

    // 1. 性別を選択
    await page.click(`input[name="gender"][value="${data.gender}"]`);

    // 2. 年代を選択
    await page.click(`input[name="ageGroup"][value="${data.ageGroup}"]`);

    // 3. 理解度を選択
    await page.click(
      `input[name="understanding"][value="${data.understanding}"]`,
    );

    // 4. 満足度を選択
    await page.click(
      `input[name="satisfaction"][value="${data.satisfaction}"]`,
    );

    // 5. フリーコメントを入力
    const textarea = page.locator("textarea[name='freeComment']");
    await textarea.fill(data.comment);

    // 6. 送信ボタンをクリック
    await page.click('button:has-text("回答を送信")');

    // 7. 完了画面の確認
    await expect(page.locator("h1")).toContainText(
      "回答ありがとうございました",
      {
        timeout: 10000,
      },
    );

    console.log(`✓ Test #${i + 1} completed successfully`);
    console.log(
      `  - 理解度: ${data.understandingScore}, 満足度: ${data.satisfactionScore}`,
    );
  });
}
