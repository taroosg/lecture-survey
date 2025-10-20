/**
 * Get Latest Analysis Results - Internal Query
 *
 * 最新の分析結果を取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";

/**
 * 指定講義の最新分析結果を取得
 *
 * @param lectureId - 対象講義ID
 * @returns 結果セットと結果ファクトの配列、または存在しない場合null
 */
export const getLatestAnalysisResultsInternal = internalQuery({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    resultSet: Doc<"resultSets">;
    resultFacts: Doc<"resultFacts">[];
  } | null> => {
    // 最新の結果セットを取得
    const latestResultSet = await ctx.db
      .query("resultSets")
      .withIndex("by_lecture_closedAt", (q) =>
        q.eq("lectureId", args.lectureId),
      )
      .order("desc")
      .first();

    if (!latestResultSet) {
      return null;
    }

    // 結果セットに紐づく全結果ファクトを取得
    const resultFacts = await ctx.db
      .query("resultFacts")
      .withIndex("by_set_type_dim1", (q) =>
        q.eq("resultSetId", latestResultSet._id),
      )
      .collect();

    return {
      resultSet: latestResultSet,
      resultFacts,
    };
  },
});
