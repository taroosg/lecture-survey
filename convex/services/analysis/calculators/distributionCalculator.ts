/**
 * Distribution Calculator - Pure Functions
 *
 * 分布計算のPure関数群
 */

import type {
  AnalysisDataRow,
  SimpleDistributionResult,
} from "../../../shared/types/analysis";
import { countOccurrences, calculatePercentage } from "../../common/statistics";
import {
  getGenderOptions,
  getAgeGroupOptions,
  getSatisfactionLevels,
} from "../../questions/definitions";

/**
 * 単純分布を計算
 *
 * @param data - 分析対象データ配列
 * @param questionCode - 質問コード（例: "gender", "ageGroup"）
 * @returns 単純分布分析結果の配列
 * @throws Error 不明な質問コードが指定された場合
 *
 * @example
 * const data = [
 *   { gender: 'male', ageGroup: '20s', understanding: 4, satisfaction: 5 },
 *   { gender: 'female', ageGroup: '30s', understanding: 3, satisfaction: 4 },
 *   { gender: 'male', ageGroup: '20s', understanding: 5, satisfaction: 5 }
 * ];
 * const result = calculateSimpleDistribution(data, 'gender');
 * // [
 * //   { dim1QuestionCode: 'gender', dim1OptionCode: 'male', n: 2, baseN: 3, pct: 66.67 },
 * //   { dim1QuestionCode: 'gender', dim1OptionCode: 'female', n: 1, baseN: 3, pct: 33.33 }
 * // ]
 */
export const calculateSimpleDistribution = (
  data: AnalysisDataRow[],
  questionCode: string,
): SimpleDistributionResult[] => {
  // 空データ配列の処理
  if (data.length === 0) {
    return [];
  }

  // 質問フィールドの検証
  if (!isValidQuestionCode(questionCode)) {
    throw new Error(`不明な質問コードです: ${questionCode}`);
  }

  // 指定質問の値を抽出
  const questionValues = extractQuestionValues(data, questionCode);

  // 有効回答総数（分母）
  const baseN = questionValues.length;

  // 各選択肢の出現回数をカウント
  const occurrences = countOccurrences(questionValues);

  // 全選択肢を質問定義から取得（0件の選択肢も含む）
  const allOptions = getAllOptionsForQuestion(questionCode);

  // 結果配列を生成
  return buildDistributionResults(questionCode, allOptions, occurrences, baseN);
};

/**
 * 複数質問の分布を一括計算
 *
 * @param data - 分析対象データ配列
 * @param questionCodes - 質問コード配列
 * @returns 質問コードをキーとした分布結果の辞書
 */
export const calculateMultipleDistributions = (
  data: AnalysisDataRow[],
  questionCodes: string[],
): Record<string, SimpleDistributionResult[]> => {
  return questionCodes.reduce(
    (acc, questionCode) => {
      acc[questionCode] = calculateSimpleDistribution(data, questionCode);
      return acc;
    },
    {} as Record<string, SimpleDistributionResult[]>,
  );
};

/**
 * 質問コードの有効性を検証
 */
export const isValidQuestionCode = (questionCode: string): boolean => {
  const validQuestionCodes = [
    "gender",
    "ageGroup",
    "understanding",
    "satisfaction",
  ];

  return validQuestionCodes.includes(questionCode);
};

/**
 * データ配列から指定質問の値を抽出
 */
export const extractQuestionValues = (
  data: AnalysisDataRow[],
  questionCode: string,
): string[] => {
  return data.map((row) => {
    const value = row[questionCode as keyof AnalysisDataRow];
    return String(value || "");
  });
};

/**
 * 質問に対するすべての選択肢を取得
 */
export const getAllOptionsForQuestion = (questionCode: string): string[] => {
  switch (questionCode) {
    case "gender":
      return getGenderOptions();
    case "ageGroup":
      return getAgeGroupOptions();
    case "understanding":
    case "satisfaction":
      return getSatisfactionLevels();
    default:
      throw new Error(`不明な質問コード: ${questionCode}`);
  }
};

/**
 * 分布計算結果を構築
 */
export const buildDistributionResults = (
  questionCode: string,
  allOptions: string[],
  occurrences: Record<string, number>,
  baseN: number,
): SimpleDistributionResult[] => {
  return allOptions.map((option) => {
    const count = occurrences[option] || 0;
    const percentage = calculatePercentage(count, baseN, 2);

    return {
      dim1QuestionCode: questionCode,
      dim1OptionCode: option,
      n: count,
      baseN: baseN,
      pct: percentage,
    };
  });
};

/**
 * 分布データから上位N選択肢を取得
 */
export const getTopOptions = (
  distributionResults: SimpleDistributionResult[],
  limit: number = 5,
): SimpleDistributionResult[] => {
  return distributionResults
    .filter((result) => result.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit);
};

/**
 * 分布データから指定閾値以上の選択肢を取得
 */
export const getOptionsAboveThreshold = (
  distributionResults: SimpleDistributionResult[],
  thresholdPercent: number = 5.0,
): SimpleDistributionResult[] => {
  return distributionResults.filter((result) => result.pct >= thresholdPercent);
};
