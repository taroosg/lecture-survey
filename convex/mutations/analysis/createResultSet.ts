/**
 * Create Result Set - Internal Mutation
 *
 * 結果セットを作成するinternal mutation関数
 */

import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import * as AnalysisValidators from "../../services/analysis/validators/analysisValidator";

/**
 * 分析結果セットを作成
 *
 * @param lectureId - 対象講義ID
 * @param closedAt - 決定論的クローズタイムスタンプ（Actionで生成）
 * @param totalResponses - 総レスポンス数
 * @returns 作成された結果セットID
 *
 * @example
 * const resultSetId = await ctx.runMutation(
 *   internal.mutations.analysis.createResultSet.createResultSetInternal,
 *   {
 *     lectureId: "j57abc123...",
 *     closedAt: 1692547200000,
 *     totalResponses: 150
 *   }
 * );
 */
export const createResultSetInternal = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    closedAt: v.number(),
    totalResponses: v.number(),
  },
  handler: async (ctx, args) => {
    // バリデーション: 引数の包括的検証
    const validation = AnalysisValidators.validateCreateResultSetArgs({
      lectureId: args.lectureId,
      closedAt: args.closedAt,
      totalResponses: args.totalResponses,
    });

    if (!validation.isValid) {
      throw new Error(`バリデーションエラー: ${validation.errors.join(", ")}`);
    }

    // バリデーション: 講義の存在確認
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture) {
      throw new Error(`講義が見つかりません: lectureId=${args.lectureId}`);
    }

    // バリデーション: 講義の状態確認
    if (!AnalysisValidators.isAnalyzable(lecture)) {
      throw new Error(
        `講義は分析できない状態です: surveyStatus=${lecture.surveyStatus}`,
      );
    }

    // 重複確認: 同じ講義に対する最近の結果セットがないかチェック
    const existingResultSet = await ctx.db
      .query("resultSets")
      .withIndex("by_lecture_closedAt", (q) =>
        q.eq("lectureId", args.lectureId).eq("closedAt", args.closedAt),
      )
      .first();

    if (existingResultSet) {
      throw new Error(
        `同じタイムスタンプの結果セットが既に存在します: resultSetId=${existingResultSet._id}, closedAt=${args.closedAt}`,
      );
    }

    // 決定論的な結果セット作成
    const resultSetId = await ctx.db.insert("resultSets", {
      lectureId: args.lectureId,
      closedAt: args.closedAt,
      totalResponses: args.totalResponses,
      createdAt: args.closedAt, // 決定論的（closedAtと同じ値）
    });

    return resultSetId;
  },
});
