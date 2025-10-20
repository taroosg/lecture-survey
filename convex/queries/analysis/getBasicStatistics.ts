/**
 * Get Basic Statistics - Internal Query
 *
 * 基本統計（単純集計）を取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";

export interface BasicStatistics {
  totalResponses: number;
  distributions: {
    gender: Doc<"resultFacts">[];
    ageGroup: Doc<"resultFacts">[];
    understanding: Doc<"resultFacts">[];
    satisfaction: Doc<"resultFacts">[];
  };
  averages: {
    understanding: number;
    satisfaction: number;
  };
}

/**
 * 指定講義の基本統計を取得
 *
 * @param lectureId - 対象講義ID
 * @returns 基本統計データ、または存在しない場合null
 */
export const getBasicStatisticsInternal = internalQuery({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<BasicStatistics | null> => {
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

    // 単純集計結果を取得
    const simpleFacts = await ctx.db
      .query("resultFacts")
      .withIndex("by_set_type_dim1", (q) =>
        q.eq("resultSetId", latestResultSet._id).eq("statType", "simple"),
      )
      .collect();

    // サマリー統計結果を取得（平均値）
    const summaryFacts = await ctx.db
      .query("resultFacts")
      .withIndex("by_set_type_dim1", (q) =>
        q.eq("resultSetId", latestResultSet._id).eq("statType", "summary"),
      )
      .collect();

    // 質問コードごとに分類
    const distributions = {
      gender: simpleFacts.filter((f) => f.dim1QuestionCode === "gender"),
      ageGroup: simpleFacts.filter((f) => f.dim1QuestionCode === "ageGroup"),
      understanding: simpleFacts.filter(
        (f) => f.dim1QuestionCode === "understanding",
      ),
      satisfaction: simpleFacts.filter(
        (f) => f.dim1QuestionCode === "satisfaction",
      ),
    };

    // 平均値を取得
    const understandingAvg = summaryFacts.find(
      (f) =>
        f.targetQuestionCode === "understanding" &&
        f.dim1QuestionCode === "_total",
    );
    const satisfactionAvg = summaryFacts.find(
      (f) =>
        f.targetQuestionCode === "satisfaction" &&
        f.dim1QuestionCode === "_total",
    );

    return {
      totalResponses: latestResultSet.totalResponses,
      distributions,
      averages: {
        understanding: understandingAvg?.avgScore ?? 0,
        satisfaction: satisfactionAvg?.avgScore ?? 0,
      },
    };
  },
});
