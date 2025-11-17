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

    const closableLectures = activeLectures.filter((lecture) => {
      // 締切日時を結合してタイムスタンプに変換（JST = UTC+9として扱う）
      // 例: "2025-01-17T15:30:00+09:00"
      const closeDateTimeStr = `${lecture.surveyCloseDate}T${lecture.surveyCloseTime}:00+09:00`;
      const closeTimestamp = new Date(closeDateTimeStr).getTime();

      // デバッグログ
      console.log(
        `[getClosableLectures] 講義: ${lecture.title}, 締切: ${closeDateTimeStr}, 締切TS: ${closeTimestamp}, 現在TS: ${currentTimestamp}, 締切済み: ${closeTimestamp <= currentTimestamp}`,
      );

      return closeTimestamp <= currentTimestamp;
    });

    console.log(
      `[getClosableLectures] アクティブ講義数: ${activeLectures.length}, 締切対象: ${closableLectures.length}`,
    );

    return closableLectures;
  },
});
