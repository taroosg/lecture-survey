/**
 * Get Closable Lectures - Internal Query
 *
 * 締切可能な講義を取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";

/**
 * 現在時刻で締切可能な講義一覧を取得
 *
 * @param currentTimestamp - 現在時刻（決定論的）
 * @returns 締切可能な講義の配列
 *
 * @example
 * const lectures = await ctx.runQuery(
 *   internal.queries.analysis.getClosableLectures.getClosableLecturesInternal,
 *   { currentTimestamp: Date.now() }
 * );
 */
export const getClosableLecturesInternal = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"lectures">[]> => {
    // アクティブな講義のみを取得
    const activeLectures = await ctx.db
      .query("lectures")
      .withIndex("by_survey_status", (q) => q.eq("surveyStatus", "active"))
      .collect();

    // 現在時刻で締切時刻を過ぎている講義をフィルタリング
    const currentTimestamp = Date.now();

    return activeLectures.filter((lecture) => {
      // 締切日時を結合してタイムスタンプに変換
      const closeDateTimeStr = `${lecture.surveyCloseDate}T${lecture.surveyCloseTime}:00`;
      const closeTimestamp = new Date(closeDateTimeStr).getTime();

      return closeTimestamp <= currentTimestamp;
    });
  },
});
