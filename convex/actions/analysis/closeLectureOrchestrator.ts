"use node";

/**
 * Closure Orchestrator - Main Scheduling Logic
 *
 * 講義締切処理のオーケストレーション
 * Cronから呼び出される定期実行処理
 */

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";

/**
 * Cronから呼び出される定期実行処理
 * Step 1: 期限切れ講義締切 (active → closed)
 * Step 2: 締切済み講義分析実行 (closed → analyzed)
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
      // Step 1: 期限切れ講義自動締切 (active → closed)
      const closableLectures = await ctx.runQuery(
        internal.queries.analysis.getClosableLectures
          .getClosableLecturesInternal,
      );

      console.log(`[AutoClosure] 期限切れ講義: ${closableLectures.length}件`);

      const closureResults: Array<{
        lectureId: Id<"lectures">;
        success: boolean;
      }> = [];

      for (const lecture of closableLectures) {
        try {
          const closedAt = Date.now();
          await ctx.runMutation(
            internal.mutations.analysis.updateLectureStatus
              .closeLectureInternal,
            {
              lectureId: lecture._id,
              closedAt,
            },
          );

          closureResults.push({
            lectureId: lecture._id,
            success: true,
          });

          console.log(`[AutoClosure] 締切完了: ${lecture.title}`);
        } catch (error) {
          closureResults.push({
            lectureId: lecture._id,
            success: false,
          });

          console.error(
            `[AutoClosure] 締切エラー: ${lecture.title} - ${error}`,
          );
        }
      }

      // Step 2: 締切済み講義分析実行 (closed → analyzed)
      // closedステータスで未分析の講義を取得
      const closedLectures = await ctx.runQuery(
        internal.queries.lectures.getLectures.getClosedLectures,
      );

      console.log(`[AutoClosure] 分析待ち講義: ${closedLectures.length}件`);

      const analysisResults: Array<{
        lectureId: Id<"lectures">;
        success: boolean;
      }> = [];

      for (const lecture of closedLectures) {
        try {
          // 分析を即座に実行
          await ctx.runAction(
            internal.actions.analysis.executeCompleteAnalysis
              .executeCompleteAnalysis,
            {
              lectureId: lecture._id,
              triggeredBy: undefined,
              triggerType: "auto",
            },
          );

          analysisResults.push({
            lectureId: lecture._id,
            success: true,
          });

          console.log(`[AutoClosure] 分析実行完了: ${lecture.title}`);
        } catch (error) {
          analysisResults.push({
            lectureId: lecture._id,
            success: false,
          });

          console.error(
            `[AutoClosure] 分析実行エラー: ${lecture.title} - ${error}`,
          );
        }
      }

      // 実行結果のログ
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;

      const closureSuccessCount = closureResults.filter(
        (r) => r.success,
      ).length;
      const analysisSuccessCount = analysisResults.filter(
        (r) => r.success,
      ).length;

      console.log(
        `[AutoClosure] 処理完了 - ` +
          `締切: ${closureSuccessCount}/${closureResults.length}件, ` +
          `分析: ${analysisSuccessCount}/${analysisResults.length}件, ` +
          `処理時間: ${processingTimeMs}ms`,
      );

      return {
        closedCount: closureSuccessCount,
        analyzedCount: analysisSuccessCount,
        totalProcessingTimeMs: processingTimeMs,
      };
    } catch (error) {
      const errorTime = Date.now();
      const processingTimeMs = errorTime - startTime;

      console.error("[AutoClosure] 定期処理エラー:", error);

      return {
        closedCount: 0,
        analyzedCount: 0,
        error: error instanceof Error ? error.message : String(error),
        totalProcessingTimeMs: processingTimeMs,
      };
    }
  },
});

/**
 * 単一講義の締切オーケストレーション
 * 手動締切時などに使用
 */
export const processSingleLectureOrchestrator = internalAction({
  args: {
    lectureId: v.id("lectures"),
    triggerAnalysis: v.optional(v.boolean()),
    userId: v.optional(v.id("users")),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.optional(v.string()),
    lectureId: v.id("lectures"),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    message?: string;
    lectureId: Id<"lectures">;
  }> => {
    try {
      // 講義を締切状態に更新
      const closedAt = Date.now();
      await ctx.runMutation(
        internal.mutations.analysis.updateLectureStatus.closeLectureInternal,
        {
          lectureId: args.lectureId,
          closedAt,
        },
      );

      // 分析トリガー（デフォルト有効）
      if (args.triggerAnalysis !== false) {
        await ctx.runAction(
          internal.actions.analysis.executeCompleteAnalysis
            .executeCompleteAnalysis,
          {
            lectureId: args.lectureId,
            triggeredBy: args.userId,
            triggerType: "manual",
          },
        );
      }

      return {
        success: true,
        lectureId: args.lectureId,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        lectureId: args.lectureId,
      };
    }
  },
});
