"use node";

/**
 * Closure Orchestrator - Main Scheduling Logic
 *
 * 講義締切処理のオーケストレーション
 * Cronから呼び出される定期実行処理
 *
 * 純粋関数アプローチを採用し、テスタビリティと保守性を向上
 */

import { v } from "convex/values";
import { internalAction, ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id, Doc } from "../../_generated/dataModel";
import {
  ProcessResult,
  calculateMetrics,
  formatSummaryLog,
  formatErrorInfo,
} from "../../services/closure/aggregators";
import { processInParallel } from "../../services/closure/processors";

/**
 * 単一講義の締切処理
 * 副作用: DB更新
 */
async function closeSingleLecture(
  ctx: ActionCtx,
  lecture: Doc<"lectures">,
): Promise<ProcessResult<Id<"lectures">>> {
  try {
    const closedAt = Date.now();
    await ctx.runMutation(
      internal.mutations.analysis.updateLectureStatus.closeLectureInternal,
      {
        lectureId: lecture._id,
        closedAt,
      },
    );

    console.log(`[AutoClosure] 締切完了: ${lecture.title}`);

    return {
      id: lecture._id,
      success: true,
    };
  } catch (error) {
    const errorMessage = formatErrorInfo(error);
    console.error(
      `[AutoClosure] 締切エラー: ${lecture.title} - ${errorMessage}`,
    );

    return {
      id: lecture._id,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 単一講義の分析処理
 * 副作用: 分析実行、DB更新
 */
async function analyzeSingleLecture(
  ctx: ActionCtx,
  lecture: Doc<"lectures">,
): Promise<ProcessResult<Id<"lectures">>> {
  try {
    await ctx.runAction(
      internal.actions.analysis.executeCompleteAnalysis.executeCompleteAnalysis,
      {
        lectureId: lecture._id,
        triggeredBy: undefined,
        triggerType: "auto",
      },
    );

    console.log(`[AutoClosure] 分析実行完了: ${lecture.title}`);

    return {
      id: lecture._id,
      success: true,
    };
  } catch (error) {
    const errorMessage = formatErrorInfo(error);
    console.error(
      `[AutoClosure] 分析実行エラー: ${lecture.title} - ${errorMessage}`,
    );

    return {
      id: lecture._id,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Cronから呼び出される定期実行処理
 * Step 1: 期限切れ講義締切 (active → closed) - 並列実行
 * Step 2: 締切済み講義分析実行 (closed → analyzed) - 並列実行
 */
export const processExpiredLecturesOrchestrator = internalAction({
  args: {},
  returns: v.object({
    closedCount: v.number(),
    analyzedCount: v.number(),
    totalProcessingTimeMs: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
  ): Promise<{
    closedCount: number;
    analyzedCount: number;
    totalProcessingTimeMs: number;
    error?: string;
  }> => {
    const startTime = Date.now();

    console.log("[AutoClosure] 定期処理開始");

    try {
      // Step 1: 期限切れ講義自動締切 (active → closed) - 並列実行
      const closableLectures = await ctx.runQuery(
        internal.queries.analysis.getClosableLectures
          .getClosableLecturesInternal,
      );

      console.log(`[AutoClosure] 期限切れ講義: ${closableLectures.length}件`);

      const closureResults = await processInParallel(
        closableLectures,
        (lecture) => closeSingleLecture(ctx, lecture),
      );

      // Step 2: 締切済み講義分析実行 (closed → analyzed) - 並列実行
      const closedLectures = await ctx.runQuery(
        internal.queries.lectures.getLectures.getClosedLectures,
      );

      console.log(`[AutoClosure] 分析待ち講義: ${closedLectures.length}件`);

      const analysisResults = await processInParallel(
        closedLectures,
        (lecture) => analyzeSingleLecture(ctx, lecture),
      );

      // 純粋関数で結果を集計
      const metrics = calculateMetrics(
        closureResults,
        analysisResults,
        startTime,
      );

      // 純粋関数でログメッセージを生成
      console.log(formatSummaryLog(metrics));

      return {
        closedCount: metrics.closure.successCount,
        analyzedCount: metrics.analysis.successCount,
        totalProcessingTimeMs: metrics.processingTimeMs,
      };
    } catch (error) {
      const errorMessage = formatErrorInfo(error);
      console.error("[AutoClosure] 定期処理エラー:", errorMessage);

      return {
        closedCount: 0,
        analyzedCount: 0,
        error: errorMessage,
        totalProcessingTimeMs: Date.now() - startTime,
      };
    }
  },
});
