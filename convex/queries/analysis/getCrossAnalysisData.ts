/**
 * Get Cross Analysis Data - Internal Query
 *
 * クロス集計データを取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";

export interface CrossAnalysisData {
  understandingByGender: Doc<"resultFacts">[];
  understandingByAgeGroup: Doc<"resultFacts">[];
  satisfactionByGender: Doc<"resultFacts">[];
  satisfactionByAgeGroup: Doc<"resultFacts">[];
}

/**
 * 指定講義のクロス集計データを取得
 *
 * @param lectureId - 対象講義ID
 * @returns クロス集計データ、または存在しない場合null
 */
export const getCrossAnalysisDataInternal = internalQuery({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<CrossAnalysisData | null> => {
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

    // クロス集計結果を取得
    const crossFacts = await ctx.db
      .query("resultFacts")
      .withIndex("by_set_type_dim1", (q) =>
        q.eq("resultSetId", latestResultSet._id).eq("statType", "cross2"),
      )
      .collect();

    // クロス集計パターンごとに分類
    return {
      understandingByGender: crossFacts.filter(
        (f) =>
          f.dim1QuestionCode === "understanding" &&
          f.dim2QuestionCode === "gender",
      ),
      understandingByAgeGroup: crossFacts.filter(
        (f) =>
          f.dim1QuestionCode === "understanding" &&
          f.dim2QuestionCode === "ageGroup",
      ),
      satisfactionByGender: crossFacts.filter(
        (f) =>
          f.dim1QuestionCode === "satisfaction" &&
          f.dim2QuestionCode === "gender",
      ),
      satisfactionByAgeGroup: crossFacts.filter(
        (f) =>
          f.dim1QuestionCode === "satisfaction" &&
          f.dim2QuestionCode === "ageGroup",
      ),
    };
  },
});
