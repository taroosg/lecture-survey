/**
 * Statistics Utilities Test
 *
 * Pure関数のテスト - モック不要、シンプルなユニットテスト
 */

import { describe, test, expect } from "vitest";
import {
  calculateAverage,
  calculatePercentage,
  countOccurrences,
} from "../statistics";

describe("calculateAverage", () => {
  test("正常な数値配列の平均値計算", () => {
    const values = [1, 2, 3, 4, 5];
    const result = calculateAverage(values);
    expect(result).toBe(3);
  });

  test("小数点を含む数値の平均値計算", () => {
    const values = [1.5, 2.5, 3.5];
    const result = calculateAverage(values);
    expect(result).toBe(2.5);
  });

  test("空配列の場合は0を返す", () => {
    const values: number[] = [];
    const result = calculateAverage(values);
    expect(result).toBe(0);
  });
});

describe("calculatePercentage", () => {
  test("正常なパーセンテージ計算（デフォルト小数点2桁）", () => {
    const result = calculatePercentage(25, 100);
    expect(result).toBe(25);
  });

  test("小数点以下を含むパーセンテージ計算", () => {
    const result = calculatePercentage(1, 3);
    expect(result).toBe(33.33);
  });

  test("totalが0の場合は0を返す", () => {
    const result = calculatePercentage(10, 0);
    expect(result).toBe(0);
  });
});

describe("countOccurrences", () => {
  test("文字列配列の出現回数をカウント", () => {
    const values = ["apple", "banana", "apple", "orange", "banana", "apple"];
    const result = countOccurrences(values);
    expect(result).toEqual({
      apple: 3,
      banana: 2,
      orange: 1,
    });
  });

  test("数値配列の出現回数をカウント", () => {
    const values = [1, 2, 1, 3, 2, 1];
    const result = countOccurrences(values);
    expect(result).toEqual({
      "1": 3,
      "2": 2,
      "3": 1,
    });
  });

  test("空配列の場合は空オブジェクトを返す", () => {
    const values: string[] = [];
    const result = countOccurrences(values);
    expect(result).toEqual({});
  });
});
