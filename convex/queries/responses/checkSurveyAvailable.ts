import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

/**
 * 指定された講義のアンケートが利用可能かチェックする内部クエリ
 * @param lectureId - 講義ID
 * @returns アンケート利用可否情報
 */
export const checkSurveyAvailable = internalQuery({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    // lectureIdを使って講義を検索
    const lecture = await ctx.db.get(args.lectureId);

    if (!lecture) {
      return { available: false, reason: "講義が見つかりません" };
    }

    if (lecture.surveyStatus !== "active") {
      return { available: false, reason: "アンケートは終了しています" };
    }

    // 締切日時チェック（簡易版）
    const now = new Date();
    const closeDateTime = new Date(
      `${lecture.surveyCloseDate}T${lecture.surveyCloseTime}`,
    );

    if (now > closeDateTime) {
      return { available: false, reason: "アンケート期限が過ぎています" };
    }

    return {
      available: true,
      lecture: {
        _id: lecture._id,
        title: lecture.title,
        lectureDate: lecture.lectureDate,
        lectureTime: lecture.lectureTime,
        description: lecture.description,
      },
    };
  },
});
