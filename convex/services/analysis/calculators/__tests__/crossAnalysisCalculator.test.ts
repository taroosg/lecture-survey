/**
 * Cross Analysis Calculator Test
 *
 * クロス集計のテスト
 */

import { describe, test, expect } from "vitest";
import {
  calculateCrossAnalysis,
  isValidCrossQuestionPair,
  buildCrossTable,
} from "../crossAnalysisCalculator";
import type { AnalysisDataRow } from "../../../../shared/types/analysis";

describe("calculateCrossAnalysis", () => {
  test("性別×年代のクロス集計を正しく計算", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 3, satisfaction: 4 },
      { gender: "male", ageGroup: "30s", understanding: 5, satisfaction: 5 },
    ];

    const result = calculateCrossAnalysis(data, "gender", "ageGroup");

    expect(result.length).toBeGreaterThan(0);
    const maleAnd20s = result.find(
      (r) => r.dim1OptionCode === "male" && r.dim2OptionCode === "20s",
    );
    expect(maleAnd20s?.n).toBe(1);

    const maleAnd30s = result.find(
      (r) => r.dim1OptionCode === "male" && r.dim2OptionCode === "30s",
    );
    expect(maleAnd30s?.n).toBe(1);
  });

  test("空データの場合は空配列を返す", () => {
    const data: AnalysisDataRow[] = [];
    const result = calculateCrossAnalysis(data, "gender", "ageGroup");
    expect(result).toEqual([]);
  });

  test("無効な質問ペアの場合はエラーを投げる", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
    ];

    expect(() => {
      calculateCrossAnalysis(data, "gender", "gender");
    }).toThrow("無効なクロス集計質問ペア");
  });

  test("理解度×性別のクロス集計を正しく計算", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 4, satisfaction: 4 },
      { gender: "male", ageGroup: "20s", understanding: 5, satisfaction: 5 },
    ];

    const result = calculateCrossAnalysis(data, "understanding", "gender");

    const understanding4AndMale = result.find(
      (r) => r.dim1OptionCode === "4" && r.dim2OptionCode === "male",
    );
    expect(understanding4AndMale?.n).toBe(1);

    const understanding4AndFemale = result.find(
      (r) => r.dim1OptionCode === "4" && r.dim2OptionCode === "female",
    );
    expect(understanding4AndFemale?.n).toBe(1);
  });
});

describe("isValidCrossQuestionPair", () => {
  test("有効な質問ペアを正しく判定", () => {
    expect(isValidCrossQuestionPair("gender", "ageGroup")).toBe(true);
    expect(isValidCrossQuestionPair("understanding", "gender")).toBe(true);
    expect(isValidCrossQuestionPair("satisfaction", "ageGroup")).toBe(true);
  });

  test("同じ質問同士は無効", () => {
    expect(isValidCrossQuestionPair("gender", "gender")).toBe(false);
  });

  test("無効な質問コードを正しく判定", () => {
    expect(isValidCrossQuestionPair("invalidQuestion", "gender")).toBe(false);
  });
});

describe("buildCrossTable", () => {
  test("クロステーブルを正しく構築", () => {
    const data: AnalysisDataRow[] = [
      { gender: "male", ageGroup: "20s", understanding: 4, satisfaction: 5 },
      { gender: "female", ageGroup: "30s", understanding: 3, satisfaction: 4 },
    ];

    const result = buildCrossTable(data, "gender", "ageGroup");

    expect(result["male"]["20s"]).toBe(1);
    expect(result["female"]["30s"]).toBe(1);
    expect(result["male"]["30s"]).toBe(0);
  });
});
