/**
 * Summary Calculator Test
 *
 * サマリー統計のテスト
 */

import { describe, test, expect } from "vitest";
import {
  calculateSummaryStatistics,
  isValidSummaryQuestionPair,
  extractNumericScores,
  calculateGroupStatistics,
} from "../summaryCalculator";
import type { AnalysisDataRow } from "../../../../shared/types/analysis";

describe("calculateSummaryStatistics", () => {
  test("理解度の性別別サマリーを正しく計算", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 3, satisfaction: 4 },
      { gender: "male", ageGroup: "20s", understanding: 5, satisfaction: 5 },
    ];

    const result = calculateSummaryStatistics(data, "understanding", "gender");

    const maleStats = result.find((r) => r.dim1OptionCode === "male");
    expect(maleStats?.avgScore).toBe(4.5);
    expect(maleStats?.baseN).toBe(2);

    const femaleStats = result.find((r) => r.dim1OptionCode === "female");
    expect(femaleStats?.avgScore).toBe(3);
    expect(femaleStats?.baseN).toBe(1);
  });

  test("空データの場合は空配列を返す", () => {
    const data: AnalysisDataRow[] = [];
    const result = calculateSummaryStatistics(data, "understanding", "gender");
    expect(result).toEqual([]);
  });

  test("無効な質問ペアの場合はエラーを投げる", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
    ];

    expect(() => {
      calculateSummaryStatistics(data, "gender", "understanding");
    }).toThrow("無効な要約統計質問ペア");
  });

  test("グループ化なしで全体統計を計算", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 3, satisfaction: 4 },
      { gender: "male", ageGroup: "20s", understanding: 5, satisfaction: 5 },
    ];

    const result = calculateSummaryStatistics(data, "understanding");

    expect(result).toHaveLength(1);
    expect(result[0].dim1QuestionCode).toBe("_total");
    expect(result[0].avgScore).toBe(4);
    expect(result[0].baseN).toBe(3);
  });
});

describe("isValidSummaryQuestionPair", () => {
  test("有効な質問ペアを正しく判定", () => {
    expect(isValidSummaryQuestionPair("understanding", "gender")).toBe(true);
    expect(isValidSummaryQuestionPair("satisfaction", "ageGroup")).toBe(true);
  });

  test("無効な質問ペアを正しく判定", () => {
    expect(isValidSummaryQuestionPair("gender", "understanding")).toBe(false);
    expect(isValidSummaryQuestionPair("understanding", "understanding")).toBe(
      false,
    );
  });
});

describe("extractNumericScores", () => {
  test("数値スコアを正しく抽出", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 3, satisfaction: 4 },
    ];

    const result = extractNumericScores(data, "understanding");
    expect(result).toEqual([4, 3]);
  });

  test("空配列の場合は空配列を返す", () => {
    const data: AnalysisDataRow[] = [];
    const result = extractNumericScores(data, "understanding");
    expect(result).toEqual([]);
  });
});

describe("calculateGroupStatistics", () => {
  test("グループ統計を正しく計算", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "male", ageGroup: "20s", understanding: 5, satisfaction: 5 },
    ];

    const result = calculateGroupStatistics(data, "understanding");

    expect(result.avgScore).toBe(4.5);
    expect(result.baseN).toBe(2);
    expect(result.scores).toEqual([4, 5]);
  });

  test("空データの場合はゼロ値を返す", () => {
    const data: AnalysisDataRow[] = [];
    const result = calculateGroupStatistics(data, "understanding");

    expect(result.avgScore).toBe(0);
    expect(result.baseN).toBe(0);
    expect(result.scores).toEqual([]);
  });
});
