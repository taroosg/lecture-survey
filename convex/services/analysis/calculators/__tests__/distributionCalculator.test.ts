/**
 * Distribution Calculator Test
 *
 * 単純集計のテスト
 */

import { describe, test, expect } from "vitest";
import {
  calculateSimpleDistribution,
  isValidQuestionCode,
  extractQuestionValues,
  getAllOptionsForQuestion,
} from "../distributionCalculator";
import type { AnalysisDataRow } from "../../../../shared/types/analysis";

describe("calculateSimpleDistribution", () => {
  test("性別の単純集計を正しく計算", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 3, satisfaction: 4 },
      { gender: "male", ageGroup: "20s", understanding: 5, satisfaction: 5 },
    ];

    const result = calculateSimpleDistribution(data, "gender");

    expect(result).toHaveLength(4); // male, female, other, preferNotToSay
    expect(result.find((r) => r.dim1OptionCode === "male")?.n).toBe(2);
    expect(result.find((r) => r.dim1OptionCode === "female")?.n).toBe(1);
    expect(result.find((r) => r.dim1OptionCode === "other")?.n).toBe(0);
  });

  test("空データの場合は空配列を返す", () => {
    const data: AnalysisDataRow[] = [];
    const result = calculateSimpleDistribution(data, "gender");
    expect(result).toEqual([]);
  });

  test("不明な質問コードの場合はエラーを投げる", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
    ];

    expect(() => {
      calculateSimpleDistribution(data, "invalidQuestion");
    }).toThrow("不明な質問コードです");
  });

  test("理解度の単純集計を正しく計算", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 4, satisfaction: 4 },
      { gender: "male", ageGroup: "20s", understanding: 5, satisfaction: 5 },
    ];

    const result = calculateSimpleDistribution(data, "understanding");

    expect(result).toHaveLength(5); // 1-5
    expect(result.find((r) => r.dim1OptionCode === "4")?.n).toBe(2);
    expect(result.find((r) => r.dim1OptionCode === "5")?.n).toBe(1);
    expect(result.find((r) => r.dim1OptionCode === "1")?.n).toBe(0);
  });
});

describe("isValidQuestionCode", () => {
  test("有効な質問コードを正しく判定", () => {
    expect(isValidQuestionCode("gender")).toBe(true);
    expect(isValidQuestionCode("ageGroup")).toBe(true);
    expect(isValidQuestionCode("understanding")).toBe(true);
    expect(isValidQuestionCode("satisfaction")).toBe(true);
  });

  test("無効な質問コードを正しく判定", () => {
    expect(isValidQuestionCode("invalidQuestion")).toBe(false);
    expect(isValidQuestionCode("")).toBe(false);
  });
});

describe("extractQuestionValues", () => {
  test("指定質問の値を正しく抽出", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 3, satisfaction: 4 },
    ];

    const result = extractQuestionValues(data, "gender");
    expect(result).toEqual(["male", "female"]);
  });
});

describe("getAllOptionsForQuestion", () => {
  test("性別の選択肢を取得", () => {
    const result = getAllOptionsForQuestion("gender");
    expect(result).toContain("male");
    expect(result).toContain("female");
    expect(result).toContain("other");
    expect(result).toContain("preferNotToSay");
  });

  test("理解度の選択肢を取得", () => {
    const result = getAllOptionsForQuestion("understanding");
    expect(result).toEqual(["1", "2", "3", "4", "5"]);
  });

  test("不明な質問コードの場合はエラーを投げる", () => {
    expect(() => {
      getAllOptionsForQuestion("invalidQuestion");
    }).toThrow("不明な質問コード");
  });
});
