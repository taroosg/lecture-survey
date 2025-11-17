// 分析関連の型定義
import { v } from "convex/values";

/**
 * 分析データ行
 * 本プロジェクトの質問項目: gender, ageGroup, understanding, satisfaction
 */
export interface AnalysisDataRow {
  gender: string;
  ageGroup: string;
  understanding: number; // 1-5の数値
  satisfaction: number; // 1-5の数値
}

/**
 * 単純集計結果
 */
export interface SimpleDistributionResult {
  dim1QuestionCode: string;
  dim1OptionCode: string;
  n: number;
  baseN: number;
  pct: number;
}

/**
 * クロス集計結果
 */
export interface CrossAnalysisResult {
  dim1QuestionCode: string;
  dim1OptionCode: string;
  dim2QuestionCode: string;
  dim2OptionCode: string;
  n: number;
  rowPct: number;
  rowBaseN: number;
  colPct: number;
  colBaseN: number;
  totalPct: number;
  totalBaseN: number;
}

/**
 * サマリー統計結果
 * 注: Top Box/Bottom Boxは本プロジェクトでは不要
 */
export interface SummaryStatisticsResult {
  dim1QuestionCode: string;
  dim1OptionCode: string;
  targetQuestionCode: string;
  avgScore: number;
  baseN: number;
}

/**
 * 分析実行結果
 */
export interface AnalysisExecutionResult {
  success: boolean;
  resultSetId?: string;
  executionTime?: number;
  totalResponses?: number;
  resultsCount?: {
    simple: number;
    cross: number;
    summary: number;
  };
  error?: string;
  message?: string;
}

/**
 * 完全な分析データ行
 */
export interface CompleteAnalysisDataRow {
  gender: string;
  ageGroup: string;
  understanding: number;
  satisfaction: number;
}

/**
 * 完全な分析データセット
 */
export interface CompleteAnalysisDataset {
  responses: CompleteAnalysisDataRow[];
  lecture: LectureInfo;
  metadata: {
    extractedAt: number;
    totalCount: number;
    originalCount: number;
    filteredCount: number;
  };
}

/**
 * 講義情報
 */
export interface LectureInfo {
  id: string;
  title: string;
  surveyStatus: "active" | "closed" | "analyzed";
  closedAt?: number;
}

/**
 * 完全な分析結果
 */
export interface CompleteAnalysisResults {
  simple: SimpleDistributionResult[];
  cross: CrossAnalysisResult[];
  summary: SummaryStatisticsResult[];
  metadata: {
    totalCount: number;
    calculatedAt: number;
    executionTime: number;
  };
}

/**
 * 分析状態
 */
export interface AnalysisStatus {
  status: "not_executed" | "running" | "completed" | "error";
  lastExecutedAt?: number;
  executionTime?: number;
  totalResponses?: number;
  errorMessage?: string;
}

/**
 * 満足度比較
 * 注: 前回講義との比較は不要、全講義平均のみ
 */
export interface SatisfactionComparison {
  allLecturesAverage: {
    understanding: number;
    satisfaction: number;
    totalLectures: number; // 集計対象の講義数
  };
}

/**
 * 基本統計
 */
export interface BasicStatistics {
  totalResponses: number;
  distributions: {
    gender: Array<{
      _id: string;
      dim1QuestionCode: string;
      dim1OptionCode: string;
      n: number;
      baseN: number;
      pct: number;
    }>;
    ageGroup: Array<{
      _id: string;
      dim1QuestionCode: string;
      dim1OptionCode: string;
      n: number;
      baseN: number;
      pct: number;
    }>;
    understanding: Array<{
      _id: string;
      dim1QuestionCode: string;
      dim1OptionCode: string;
      n: number;
      baseN: number;
      pct: number;
    }>;
    satisfaction: Array<{
      _id: string;
      dim1QuestionCode: string;
      dim1OptionCode: string;
      n: number;
      baseN: number;
      pct: number;
    }>;
  };
  averages: {
    understanding: number;
    satisfaction: number;
  };
}

/**
 * クロス集計データ
 * 本プロジェクトでは性別と年代のみ
 */
export interface CrossAnalysisData {
  understandingByGender: Array<{
    _id: string;
    dim1QuestionCode: string;
    dim1OptionCode: string;
    dim2QuestionCode: string;
    dim2OptionCode: string;
    n: number;
    pct: number;
  }>;
  understandingByAgeGroup: Array<{
    _id: string;
    dim1QuestionCode: string;
    dim1OptionCode: string;
    dim2QuestionCode: string;
    dim2OptionCode: string;
    n: number;
    pct: number;
  }>;
  satisfactionByGender: Array<{
    _id: string;
    dim1QuestionCode: string;
    dim1OptionCode: string;
    dim2QuestionCode: string;
    dim2OptionCode: string;
    n: number;
    pct: number;
  }>;
  satisfactionByAgeGroup: Array<{
    _id: string;
    dim1QuestionCode: string;
    dim1OptionCode: string;
    dim2QuestionCode: string;
    dim2OptionCode: string;
    n: number;
    pct: number;
  }>;
}

// Convexバリデータ定義

export const SimpleDistributionResultValidator = v.object({
  dim1QuestionCode: v.string(),
  dim1OptionCode: v.string(),
  n: v.number(),
  baseN: v.number(),
  pct: v.number(),
});

export const CrossAnalysisResultValidator = v.object({
  dim1QuestionCode: v.string(),
  dim1OptionCode: v.string(),
  dim2QuestionCode: v.string(),
  dim2OptionCode: v.string(),
  n: v.number(),
  rowPct: v.number(),
  rowBaseN: v.number(),
  colPct: v.number(),
  colBaseN: v.number(),
  totalPct: v.number(),
  totalBaseN: v.number(),
});

export const SummaryStatisticsResultValidator = v.object({
  dim1QuestionCode: v.string(),
  dim1OptionCode: v.string(),
  targetQuestionCode: v.string(),
  avgScore: v.number(),
  baseN: v.number(),
});

export const CompleteAnalysisResultsValidator = v.object({
  simple: v.array(SimpleDistributionResultValidator),
  cross: v.array(CrossAnalysisResultValidator),
  summary: v.array(SummaryStatisticsResultValidator),
  metadata: v.object({
    totalCount: v.number(),
    calculatedAt: v.number(),
    executionTime: v.number(),
  }),
});
