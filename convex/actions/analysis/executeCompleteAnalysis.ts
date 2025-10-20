/**
 * Execute Complete Analysis - Optimized Action
 *
 * Convex推奨パターンに最適化されたメイン分析実行Action
 *
 * - 単一internal関数呼び出しパターンの採用
 * - Pure関数の統合と活用
 * - Functional Core, Imperative Shell アーキテクチャの実装
 * - TypeScriptヘルパー関数パターンの採用
 */

"use node";

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { executeCompleteAnalysisHelper } from "./helpers";

// 戻り値の型定義
interface AnalysisExecutionResult {
  success: boolean;
  resultSetId?: Id<"resultSets">;
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
 * 完全な分析を実行するメインAction
 * Convex推奨のTypeScriptヘルパー関数パターンを実装
 *
 * @param lectureId - 対象講義ID
 * @param triggeredBy - 実行トリガーユーザー（オプション）
 * @param triggerType - 実行トリガータイプ（auto/manual）
 * @returns 分析実行結果
 *
 * @example
 * const result = await ctx.runAction(
 *   internal.actions.analysis.executeCompleteAnalysis.executeCompleteAnalysis,
 *   {
 *     lectureId: "j57abc123...",
 *     triggerType: "manual"
 *   }
 * );
 */
export const executeCompleteAnalysis = internalAction({
  args: {
    lectureId: v.id("lectures"),
    triggeredBy: v.optional(v.id("users")),
    triggerType: v.union(v.literal("auto"), v.literal("manual")),
  },
  handler: async (ctx, args): Promise<AnalysisExecutionResult> => {
    // Convex推奨プラクティス: 共通ロジックをTypeScriptヘルパー関数に抽出
    // 同じランタイム内でのaction間共有では ctx.runAction は使用しない
    return await executeCompleteAnalysisHelper(ctx, args);
  },
});
