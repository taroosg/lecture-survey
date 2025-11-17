/**
 * Summary Statistics Calculator - Pure Functions
 *
 * 要約統計のPure関数群
 */

import type {
  AnalysisDataRow,
  SummaryStatisticsResult,
} from "../../../shared/types/analysis";
import { calculateAverage } from "../../common/statistics";
import { groupBy } from "../../common/utilities";

/**
 * グループ化されたデータの型定義
 */
export interface GroupedData {
  [groupValue: string]: AnalysisDataRow[];
}

/**
 * 統計指標の型定義（本プロジェクトはTop Box/Bottom Box不要）
 */
export interface StatisticalMetrics {
  avgScore: number;
  baseN: number;
  scores: number[];
}

/**
 * 要約統計を計算
 *
 * @param data - 分析対象データ配列
 * @param targetQuestion - 対象質問コード（数値回答）
 * @param groupByQuestion - グループ化質問コード
 * @returns 要約統計結果の配列
 *
 * @example
 * const data = [
 *   { gender: 'male', ageGroup: '20s', understanding: 4, satisfaction: 5 },
 *   { gender: 'female', ageGroup: '30s', understanding: 3, satisfaction: 4 },
 *   { gender: 'male', ageGroup: '20s', understanding: 5, satisfaction: 5 }
 * ];
 * const result = calculateSummaryStatistics(data, 'understanding', 'gender');
 */
export const calculateSummaryStatistics = (
  data: AnalysisDataRow[],
  targetQuestion: string,
  groupByQuestion?: string,
): SummaryStatisticsResult[] => {
  if (data.length === 0) {
    return [];
  }

  // groupByQuestionがundefinedの場合は全体統計を計算
  if (!groupByQuestion) {
    const metrics = calculateGroupStatistics(data, targetQuestion);
    return [
      {
        dim1QuestionCode: "_total",
        dim1OptionCode: "_total",
        targetQuestionCode: targetQuestion,
        avgScore: metrics.avgScore,
        baseN: metrics.baseN,
      },
    ];
  }

  // 質問コードの検証
  if (!isValidSummaryQuestionPair(targetQuestion, groupByQuestion)) {
    throw new Error(
      `無効な要約統計質問ペア: ${targetQuestion} by ${groupByQuestion}`,
    );
  }

  // データをグループ化
  const groupedData = groupDataByQuestion(data, groupByQuestion);

  // 各グループの統計を計算
  const results: SummaryStatisticsResult[] = [];

  Object.entries(groupedData).forEach(([groupValue, groupData]) => {
    const metrics = calculateGroupStatistics(groupData, targetQuestion);

    results.push({
      dim1QuestionCode: groupByQuestion,
      dim1OptionCode: groupValue,
      targetQuestionCode: targetQuestion,
      avgScore: metrics.avgScore,
      baseN: metrics.baseN,
    });
  });

  return results;
};

/**
 * 複数の要約統計を一括計算
 *
 * @param data - 分析対象データ配列
 * @param targetQuestions - 対象質問コード配列
 * @param groupByQuestion - グループ化質問コード
 * @returns 対象質問をキーとした要約統計結果の辞書
 */
export const calculateMultipleSummaryStatistics = (
  data: AnalysisDataRow[],
  targetQuestions: string[],
  groupByQuestion: string,
): Record<string, SummaryStatisticsResult[]> => {
  return targetQuestions.reduce(
    (acc, targetQuestion) => {
      acc[targetQuestion] = calculateSummaryStatistics(
        data,
        targetQuestion,
        groupByQuestion,
      );
      return acc;
    },
    {} as Record<string, SummaryStatisticsResult[]>,
  );
};

/**
 * 要約統計質問ペアの有効性を検証
 */
export const isValidSummaryQuestionPair = (
  targetQuestion: string,
  groupByQuestion: string,
): boolean => {
  // 対象質問は数値回答質問である必要がある
  const numericQuestions = ["understanding", "satisfaction"];

  // グループ化質問はカテゴリ質問である必要がある
  const categoryQuestions = ["gender", "ageGroup"];

  return (
    numericQuestions.includes(targetQuestion) &&
    (categoryQuestions.includes(groupByQuestion) ||
      groupByQuestion === "_total")
  );
};

/**
 * データをグループ化質問で分割
 */
export const groupDataByQuestion = (
  data: AnalysisDataRow[],
  groupByQuestion: string,
): GroupedData => {
  // _totalの場合は全データを"all"グループとして扱う
  if (groupByQuestion === "_total") {
    return { all: data };
  }

  return groupBy(data, (row: AnalysisDataRow) => {
    const value = row[groupByQuestion as keyof AnalysisDataRow];
    return String(value || "unknown");
  });
};

/**
 * グループの統計指標を計算
 */
export const calculateGroupStatistics = (
  groupData: AnalysisDataRow[],
  targetQuestion: string,
): StatisticalMetrics => {
  // 対象質問の数値データを抽出
  const scores = extractNumericScores(groupData, targetQuestion);

  const baseN = scores.length;

  if (scores.length === 0) {
    return {
      avgScore: 0,
      baseN: baseN,
      scores: [],
    };
  }

  // 平均値を計算
  const avgScore = calculateAverage(scores);

  return {
    avgScore: Math.round(avgScore * 100) / 100, // 小数点2位で四捨五入
    baseN: baseN,
    scores,
  };
};

/**
 * 数値スコアを抽出
 */
export const extractNumericScores = (
  data: AnalysisDataRow[],
  targetQuestion: string,
): number[] => {
  return data
    .map((row) => {
      const value = row[targetQuestion as keyof AnalysisDataRow];
      // 空文字列、null、undefinedは除外
      if (value === null || value === undefined || value === "") {
        return null;
      }
      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    })
    .filter((score): score is number => score !== null);
};

/**
 * グループ間比較統計を計算
 */
export const calculateGroupComparison = (
  summaryResults: SummaryStatisticsResult[],
): {
  bestPerformingGroup: SummaryStatisticsResult;
  worstPerformingGroup: SummaryStatisticsResult;
  averageScore: number;
  scoreRange: number;
  groupDifferences: Array<{
    group1: string;
    group2: string;
    scoreDifference: number;
  }>;
} => {
  if (summaryResults.length === 0) {
    throw new Error("比較対象のグループが存在しません");
  }

  // 最高・最低パフォーマンスグループ
  const bestPerformingGroup = summaryResults.reduce((best, current) =>
    current.avgScore > best.avgScore ? current : best,
  );

  const worstPerformingGroup = summaryResults.reduce((worst, current) =>
    current.avgScore < worst.avgScore ? current : worst,
  );

  // 全体統計
  const averageScore = calculateAverage(summaryResults.map((r) => r.avgScore));
  const scores = summaryResults.map((r) => r.avgScore);
  const scoreRange = Math.max(...scores) - Math.min(...scores);

  // グループ間の差異
  const groupDifferences = [];
  for (let i = 0; i < summaryResults.length; i++) {
    for (let j = i + 1; j < summaryResults.length; j++) {
      groupDifferences.push({
        group1: summaryResults[i].dim1OptionCode,
        group2: summaryResults[j].dim1OptionCode,
        scoreDifference: Math.abs(
          summaryResults[i].avgScore - summaryResults[j].avgScore,
        ),
      });
    }
  }

  return {
    bestPerformingGroup,
    worstPerformingGroup,
    averageScore: Math.round(averageScore * 100) / 100,
    scoreRange: Math.round(scoreRange * 100) / 100,
    groupDifferences,
  };
};

/**
 * 満足度分布を詳細分析
 */
export const analyzeSatisfactionDistribution = (
  scores: number[],
  scale: 5 = 5,
): {
  distribution: Record<string, number>;
  mode: number[];
  median: number;
  standardDeviation: number;
  satisfactionLevel: "low" | "medium" | "high";
} => {
  if (scores.length === 0) {
    return {
      distribution: {},
      mode: [],
      median: 0,
      standardDeviation: 0,
      satisfactionLevel: "low",
    };
  }

  // 分布計算
  const distribution = scores.reduce(
    (dist, score) => {
      const key = String(score);
      dist[key] = (dist[key] || 0) + 1;
      return dist;
    },
    {} as Record<string, number>,
  );

  // 最頻値（モード）
  const maxCount = Math.max(...Object.values(distribution));
  const mode = Object.keys(distribution)
    .filter((key) => distribution[key] === maxCount)
    .map(Number);

  // 中央値
  const sortedScores = [...scores].sort((a, b) => a - b);
  const median =
    sortedScores.length % 2 === 0
      ? (sortedScores[sortedScores.length / 2 - 1] +
          sortedScores[sortedScores.length / 2]) /
        2
      : sortedScores[Math.floor(sortedScores.length / 2)];

  // 標準偏差
  const mean = calculateAverage(scores);
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    scores.length;
  const standardDeviation = Math.sqrt(variance);

  // 満足度レベル判定（5段階評価）
  const avgScore = mean;
  const thresholds = { high: 4.0, medium: 3.0 };

  const satisfactionLevel =
    avgScore >= thresholds.high
      ? "high"
      : avgScore >= thresholds.medium
        ? "medium"
        : "low";

  return {
    distribution,
    mode,
    median: Math.round(median * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    satisfactionLevel,
  };
};
