/**
 * Get Cross Analysis Data - Internal Query
 *
 * クロス集計データを取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { CrossAnalysisData } from "../../shared/types/analysis";

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
    // rowPctをpctとしてマッピング（行方向の割合 = カテゴリ内の分布）
    const mapCrossFact = (fact: (typeof crossFacts)[0]) => ({
      _id: fact._id,
      dim1QuestionCode: fact.dim1QuestionCode,
      dim1OptionCode: fact.dim1OptionCode,
      dim2QuestionCode: fact.dim2QuestionCode || "",
      dim2OptionCode: fact.dim2OptionCode || "",
      n: fact.n || 0,
      pct: fact.rowPct || 0, // rowPctをpctとして使用
    });

    return {
      understandingByGender: crossFacts
        .filter(
          (f) =>
            f.dim1QuestionCode === "understanding" &&
            f.dim2QuestionCode === "gender",
        )
        .map(mapCrossFact),
      understandingByAgeGroup: crossFacts
        .filter(
          (f) =>
            f.dim1QuestionCode === "understanding" &&
            f.dim2QuestionCode === "ageGroup",
        )
        .map(mapCrossFact),
      satisfactionByGender: crossFacts
        .filter(
          (f) =>
            f.dim1QuestionCode === "satisfaction" &&
            f.dim2QuestionCode === "gender",
        )
        .map(mapCrossFact),
      satisfactionByAgeGroup: crossFacts
        .filter(
          (f) =>
            f.dim1QuestionCode === "satisfaction" &&
            f.dim2QuestionCode === "ageGroup",
        )
        .map(mapCrossFact),
    };
  },
});
