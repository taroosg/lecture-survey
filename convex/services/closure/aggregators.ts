/**
 * Closure Aggregators - Pure Functions
 *
 * 締切・分析処理の結果を集計する純粋関数群
 * 副作用を持たず、テストが容易
 */

import { Id } from "../../_generated/dataModel";

/**
 * 処理結果の型定義
 */
export type ProcessResult<T> = {
  id: T;
  success: boolean;
  error?: string;
};

/**
 * 集計結果の型定義
 */
export type AggregatedStats = {
  successCount: number;
  failureCount: number;
  failedIds: Id<"lectures">[];
  errors: string[];
};

/**
 * 処理メトリクスの型定義
 */
export type ProcessingMetrics = {
  closure: AggregatedStats;
  analysis: AggregatedStats;
  processingTimeMs: number;
};

/**
 * 処理結果を集計する純粋関数
 */
export function aggregateResults(
  results: ProcessResult<Id<"lectures">>[],
): AggregatedStats {
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const failedIds = results.filter((r) => !r.success).map((r) => r.id);
  const errors = results
    .filter((r) => !r.success && r.error)
    .map((r) => r.error as string);

  return {
    successCount,
    failureCount,
    failedIds,
    errors,
  };
}

/**
 * 締切・分析処理のメトリクスを計算する純粋関数
 */
export function calculateMetrics(
  closureResults: ProcessResult<Id<"lectures">>[],
  analysisResults: ProcessResult<Id<"lectures">>[],
  startTime: number,
): ProcessingMetrics {
  const closureStats = aggregateResults(closureResults);
  const analysisStats = aggregateResults(analysisResults);

  return {
    closure: closureStats,
    analysis: analysisStats,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * サマリーログを整形する純粋関数
 */
export function formatSummaryLog(metrics: ProcessingMetrics): string {
  const totalClosures =
    metrics.closure.successCount + metrics.closure.failureCount;
  const totalAnalyses =
    metrics.analysis.successCount + metrics.analysis.failureCount;

  return (
    `[AutoClosure] 処理完了 - ` +
    `締切: ${metrics.closure.successCount}/${totalClosures}件, ` +
    `分析: ${metrics.analysis.successCount}/${totalAnalyses}件, ` +
    `処理時間: ${metrics.processingTimeMs}ms`
  );
}

/**
 * エラー情報を整形する純粋関数
 */
export function formatErrorInfo(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
