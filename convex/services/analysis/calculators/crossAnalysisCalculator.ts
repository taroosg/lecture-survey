/**
 * Cross Analysis Calculator - Pure Functions
 *
 * クロス集計のPure関数群
 */

import type {
  AnalysisDataRow,
  CrossAnalysisResult,
} from "../../../shared/types/analysis";
import { calculatePercentage } from "../../common/statistics";
import { getAllOptionsForQuestion } from "./distributionCalculator";

/**
 * クロス集計結果の型定義
 */
export interface CrossTable {
  [rowOption: string]: {
    [colOption: string]: number;
  };
}

/**
 * クロス集計統計情報
 */
export interface CrossTableStats {
  rowTotals: Record<string, number>;
  colTotals: Record<string, number>;
  grandTotal: number;
}

/**
 * クロス集計を計算
 *
 * @param data - 分析対象データ配列
 * @param rowQuestion - 行質問コード
 * @param colQuestion - 列質問コード
 * @returns クロス集計分析結果の配列
 *
 * @example
 * const data = [
 *   { gender: 'male', ageGroup: '20s', understanding: 4, satisfaction: 5 },
 *   { gender: 'female', ageGroup: '30s', understanding: 3, satisfaction: 4 },
 *   { gender: 'male', ageGroup: '30s', understanding: 5, satisfaction: 5 }
 * ];
 * const result = calculateCrossAnalysis(data, 'gender', 'ageGroup');
 */
export const calculateCrossAnalysis = (
  data: AnalysisDataRow[],
  rowQuestion: string,
  colQuestion: string,
): CrossAnalysisResult[] => {
  if (data.length === 0) {
    return [];
  }

  // 質問コードの検証
  if (!isValidCrossQuestionPair(rowQuestion, colQuestion)) {
    throw new Error(
      `無効なクロス集計質問ペア: ${rowQuestion} x ${colQuestion}`,
    );
  }

  // クロステーブルを構築
  const crossTable = buildCrossTable(data, rowQuestion, colQuestion);

  // 統計情報を計算
  const stats = calculateCrossTableStats(crossTable);

  // 結果を生成
  return generateCrossAnalysisResults(
    rowQuestion,
    colQuestion,
    crossTable,
    stats,
  );
};

/**
 * 複数のクロス集計を一括実行
 *
 * @param data - 分析対象データ配列
 * @param questionPairs - 質問ペアの配列
 * @returns 質問ペアをキーとしたクロス集計結果の辞書
 */
export const calculateMultipleCrossAnalyses = (
  data: AnalysisDataRow[],
  questionPairs: Array<{ row: string; col: string }>,
): Record<string, CrossAnalysisResult[]> => {
  return questionPairs.reduce(
    (acc, pair) => {
      const key = `${pair.row}_x_${pair.col}`;
      acc[key] = calculateCrossAnalysis(data, pair.row, pair.col);
      return acc;
    },
    {} as Record<string, CrossAnalysisResult[]>,
  );
};

/**
 * クロス集計質問ペアの有効性を検証
 */
export const isValidCrossQuestionPair = (
  rowQuestion: string,
  colQuestion: string,
): boolean => {
  // 同じ質問同士のクロス集計は無意味
  if (rowQuestion === colQuestion) {
    return false;
  }

  // 両方の質問が有効である必要がある
  const validQuestions = [
    "gender",
    "ageGroup",
    "understanding",
    "satisfaction",
  ];

  return (
    validQuestions.includes(rowQuestion) && validQuestions.includes(colQuestion)
  );
};

/**
 * クロステーブルを構築
 */
export const buildCrossTable = (
  data: AnalysisDataRow[],
  rowQuestion: string,
  colQuestion: string,
): CrossTable => {
  const crossTable: CrossTable = {};

  // すべての行・列選択肢を初期化
  const rowOptions = getAllOptionsForQuestion(rowQuestion);
  const colOptions = getAllOptionsForQuestion(colQuestion);

  rowOptions.forEach((rowOption) => {
    crossTable[rowOption] = {};
    colOptions.forEach((colOption) => {
      crossTable[rowOption][colOption] = 0;
    });
  });

  // データからクロステーブルを集計
  data.forEach((row) => {
    const rowValue = String(row[rowQuestion as keyof AnalysisDataRow] || "");
    const colValue = String(row[colQuestion as keyof AnalysisDataRow] || "");

    if (crossTable[rowValue] && crossTable[rowValue][colValue] !== undefined) {
      crossTable[rowValue][colValue]++;
    }
  });

  return crossTable;
};

/**
 * クロステーブルの統計情報を計算
 */
export const calculateCrossTableStats = (
  crossTable: CrossTable,
): CrossTableStats => {
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let grandTotal = 0;

  // 行合計を計算
  Object.keys(crossTable).forEach((rowOption) => {
    rowTotals[rowOption] = Object.values(crossTable[rowOption]).reduce(
      (sum, count) => sum + count,
      0,
    );
  });

  // 列合計を計算
  const allColOptions = new Set<string>();
  Object.values(crossTable).forEach((row) => {
    Object.keys(row).forEach((col) => allColOptions.add(col));
  });

  allColOptions.forEach((colOption) => {
    colTotals[colOption] = Object.keys(crossTable).reduce((sum, rowOption) => {
      return sum + (crossTable[rowOption][colOption] || 0);
    }, 0);
  });

  // 総計を計算
  grandTotal = Object.values(rowTotals).reduce((sum, count) => sum + count, 0);

  return { rowTotals, colTotals, grandTotal };
};

/**
 * クロス集計結果を生成
 */
export const generateCrossAnalysisResults = (
  rowQuestion: string,
  colQuestion: string,
  crossTable: CrossTable,
  stats: CrossTableStats,
): CrossAnalysisResult[] => {
  const results: CrossAnalysisResult[] = [];

  Object.keys(crossTable).forEach((rowOption) => {
    Object.keys(crossTable[rowOption]).forEach((colOption) => {
      const count = crossTable[rowOption][colOption];
      const rowTotal = stats.rowTotals[rowOption];
      const colTotal = stats.colTotals[colOption];
      const grandTotal = stats.grandTotal;

      // パーセンテージ計算
      const rowPct = calculatePercentage(count, rowTotal, 2);
      const colPct = calculatePercentage(count, colTotal, 2);
      const totalPct = calculatePercentage(count, grandTotal, 2);

      results.push({
        dim1QuestionCode: rowQuestion,
        dim1OptionCode: rowOption,
        dim2QuestionCode: colQuestion,
        dim2OptionCode: colOption,
        n: count,
        rowPct: rowPct,
        rowBaseN: rowTotal,
        colPct: colPct,
        colBaseN: colTotal,
        totalPct: totalPct,
        totalBaseN: grandTotal,
      });
    });
  });

  return results;
};

/**
 * クロス集計結果から有意な関連性を検出
 */
export const findSignificantAssociations = (
  crossResults: CrossAnalysisResult[],
  minCount: number = 5,
  minPercentage: number = 10.0,
): CrossAnalysisResult[] => {
  return crossResults.filter(
    (result) => result.n >= minCount && result.totalPct >= minPercentage,
  );
};

/**
 * クロス集計結果を行・列で集約
 */
export const aggregateByRowAndColumn = (
  crossResults: CrossAnalysisResult[],
): {
  byRow: Record<string, CrossAnalysisResult[]>;
  byColumn: Record<string, CrossAnalysisResult[]>;
} => {
  const byRow: Record<string, CrossAnalysisResult[]> = {};
  const byColumn: Record<string, CrossAnalysisResult[]> = {};

  crossResults.forEach((result) => {
    // 行別集約
    if (!byRow[result.dim1OptionCode]) {
      byRow[result.dim1OptionCode] = [];
    }
    byRow[result.dim1OptionCode].push(result);

    // 列別集約
    if (!byColumn[result.dim2OptionCode]) {
      byColumn[result.dim2OptionCode] = [];
    }
    byColumn[result.dim2OptionCode].push(result);
  });

  return { byRow, byColumn };
};

/**
 * クロス集計結果の要約統計を計算
 */
export const calculateCrossSummaryStats = (
  crossResults: CrossAnalysisResult[],
): {
  totalCells: number;
  nonZeroCells: number;
  maxCount: number;
  avgCount: number;
  totalResponses: number;
} => {
  const totalCells = crossResults.length;
  const nonZeroCells = crossResults.filter((r) => r.n > 0).length;
  const counts = crossResults.map((r) => r.n);
  const maxCount = Math.max(...counts);
  const avgCount = counts.reduce((sum, count) => sum + count, 0) / totalCells;
  const totalResponses =
    crossResults.length > 0 ? crossResults[0].totalBaseN : 0;

  return {
    totalCells,
    nonZeroCells,
    maxCount,
    avgCount: Math.round(avgCount * 100) / 100,
    totalResponses,
  };
};
