/**
 * Get All Lectures Average - Internal Query
 *
 * 全講義平均を取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";

/**
 * 指定ユーザーが作成した全講義の平均スコアを取得
 *
 * @param userId - 対象ユーザーID
 * @param targetQuestion - 対象質問コード（understanding または satisfaction）
 * @returns 平均スコアと講義数
 *
 * @example
 * const average = await ctx.runQuery(
 *   internal.queries.analysis.getAllLecturesAverage.getAllLecturesAverageInternal,
 *   { userId: "j57abc123...", targetQuestion: "understanding" }
 * );
 */
export const getAllLecturesAverageInternal = internalQuery({
  args: {
    userId: v.id("users"),
    targetQuestion: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    average: number;
    totalLectures: number;
  }> => {
    // 1. ユーザーが作成した全ての分析済み講義を取得
    const analyzedLectures = await ctx.db
      .query("lectures")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .filter((q) => q.eq(q.field("surveyStatus"), "analyzed"))
      .collect();

    if (analyzedLectures.length === 0) {
      return {
        average: 0,
        totalLectures: 0,
      };
    }

    // 2. 各講義の最新結果セットから平均スコアを並列取得
    const resultSets = await Promise.all(
      analyzedLectures.map((lecture) =>
        ctx.db
          .query("resultSets")
          .withIndex("by_lecture_closedAt", (q) =>
            q.eq("lectureId", lecture._id),
          )
          .order("desc")
          .first(),
      ),
    );

    // 有効な結果セットのみでサマリーファクトを並列取得
    const validResultSets = resultSets.filter(
      (rs): rs is NonNullable<typeof rs> => rs !== null,
    );

    const summaryFacts = await Promise.all(
      validResultSets.map((rs) =>
        ctx.db
          .query("resultFacts")
          .withIndex("by_set_type_dim1", (q) =>
            q
              .eq("resultSetId", rs._id)
              .eq("statType", "summary")
              .eq("dim1QuestionCode", "_total"),
          )
          .filter((q) =>
            q.eq(q.field("targetQuestionCode"), args.targetQuestion),
          )
          .first(),
      ),
    );

    const averages: number[] = summaryFacts
      .filter(
        (fact): fact is NonNullable<typeof fact> =>
          fact !== null && fact.avgScore !== undefined,
      )
      .map((fact) => fact.avgScore!);

    // 3. 全講義の平均を計算
    if (averages.length === 0) {
      return {
        average: 0,
        totalLectures: analyzedLectures.length,
      };
    }

    const overallAverage =
      averages.reduce((sum, avg) => sum + avg, 0) / averages.length;

    return {
      average: Math.round(overallAverage * 100) / 100,
      totalLectures: analyzedLectures.length,
    };
  },
});
