/**
 * Update Lecture Status - Internal Mutation
 *
 * 講義のステータスを更新するinternal mutation関数
 */

import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * 講義を締切状態に更新
 *
 * @param lectureId - 対象講義ID
 * @param closedAt - 締切日時
 */
export const closeLectureInternal = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    closedAt: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const lecture = await ctx.db.get(args.lectureId);

    if (!lecture) {
      throw new Error(`講義が見つかりません: lectureId=${args.lectureId}`);
    }

    if (lecture.surveyStatus !== "active") {
      throw new Error(
        `講義はアクティブ状態ではありません: surveyStatus=${lecture.surveyStatus}`,
      );
    }

    await ctx.db.patch(args.lectureId, {
      surveyStatus: "closed",
      closedAt: args.closedAt,
      updatedAt: args.closedAt,
    });
  },
});

/**
 * 講義を分析済み状態に更新
 *
 * @param lectureId - 対象講義ID
 * @param analyzedAt - 分析完了日時
 */
export const markLectureAnalyzedInternal = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    analyzedAt: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const lecture = await ctx.db.get(args.lectureId);

    if (!lecture) {
      throw new Error(`講義が見つかりません: lectureId=${args.lectureId}`);
    }

    if (lecture.surveyStatus !== "closed") {
      throw new Error(
        `講義は締切状態ではありません: surveyStatus=${lecture.surveyStatus}`,
      );
    }

    await ctx.db.patch(args.lectureId, {
      surveyStatus: "analyzed",
      analyzedAt: args.analyzedAt,
      updatedAt: args.analyzedAt,
    });
  },
});
