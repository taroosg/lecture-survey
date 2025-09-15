/**
 * updateLecture.ts
 * Internal Mutations - 講義更新機能
 */

import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * 講義情報を更新する
 */
export const updateLecture = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    title: v.optional(v.string()),
    lectureDate: v.optional(v.string()),
    lectureTime: v.optional(v.string()),
    description: v.optional(v.string()),
    surveyCloseDate: v.optional(v.string()),
    surveyCloseTime: v.optional(v.string()),
    surveyUrl: v.optional(v.string()),
    surveySlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 講義の存在確認
    const existingLecture = await ctx.db.get(args.lectureId);
    if (!existingLecture) {
      return null;
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    // 更新するフィールドのみ追加
    if (args.title !== undefined) updateData.title = args.title;
    if (args.lectureDate !== undefined)
      updateData.lectureDate = args.lectureDate;
    if (args.lectureTime !== undefined)
      updateData.lectureTime = args.lectureTime;
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.surveyCloseDate !== undefined)
      updateData.surveyCloseDate = args.surveyCloseDate;
    if (args.surveyCloseTime !== undefined)
      updateData.surveyCloseTime = args.surveyCloseTime;
    if (args.surveyUrl !== undefined) updateData.surveyUrl = args.surveyUrl;
    if (args.surveySlug !== undefined) updateData.surveySlug = args.surveySlug;

    await ctx.db.patch(args.lectureId, updateData);
    return await ctx.db.get(args.lectureId);
  },
});

/**
 * 講義のアンケート状態を更新する
 */
export const updateLectureSurveyStatus = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    surveyStatus: v.union(v.literal("active"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    // 講義の存在確認
    const existingLecture = await ctx.db.get(args.lectureId);
    if (!existingLecture) {
      return null;
    }

    const updateData: any = {
      surveyStatus: args.surveyStatus,
      updatedAt: Date.now(),
    };

    // closeのタイムスタンプを記録
    if (args.surveyStatus === "closed") {
      updateData.closedAt = Date.now();
    }

    await ctx.db.patch(args.lectureId, updateData);
    return await ctx.db.get(args.lectureId);
  },
});

/**
 * アクティブな講義を自動クローズする（期限切れ）
 */
export const autoCloseLecture = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    // 講義の存在確認
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture || lecture.surveyStatus !== "active") {
      return null;
    }

    // 期限チェック
    const closeDateTime = new Date(
      `${lecture.surveyCloseDate}T${lecture.surveyCloseTime}`,
    );
    const isExpired = args.currentTime > closeDateTime.getTime();

    if (isExpired) {
      await ctx.db.patch(args.lectureId, {
        surveyStatus: "closed",
        closedAt: args.currentTime,
        updatedAt: args.currentTime,
      });
      return await ctx.db.get(args.lectureId);
    }

    return lecture;
  },
});

/**
 * 講義を一括更新する
 */
export const bulkUpdateLectures = internalMutation({
  args: {
    updates: v.array(
      v.object({
        lectureId: v.id("lectures"),
        title: v.optional(v.string()),
        lectureDate: v.optional(v.string()),
        lectureTime: v.optional(v.string()),
        description: v.optional(v.string()),
        surveyCloseDate: v.optional(v.string()),
        surveyCloseTime: v.optional(v.string()),
        surveyStatus: v.optional(
          v.union(v.literal("active"), v.literal("closed")),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const updatedLectures = [];
    const now = Date.now();

    for (const update of args.updates) {
      const existingLecture = await ctx.db.get(update.lectureId);
      if (!existingLecture) {
        continue;
      }

      const updateData: any = {
        updatedAt: now,
      };

      // 更新するフィールドのみ追加
      if (update.title !== undefined) updateData.title = update.title;
      if (update.lectureDate !== undefined)
        updateData.lectureDate = update.lectureDate;
      if (update.lectureTime !== undefined)
        updateData.lectureTime = update.lectureTime;
      if (update.description !== undefined)
        updateData.description = update.description;
      if (update.surveyCloseDate !== undefined)
        updateData.surveyCloseDate = update.surveyCloseDate;
      if (update.surveyCloseTime !== undefined)
        updateData.surveyCloseTime = update.surveyCloseTime;
      if (update.surveyStatus !== undefined) {
        updateData.surveyStatus = update.surveyStatus;
        if (update.surveyStatus === "closed") {
          updateData.closedAt = now;
        }
      }

      await ctx.db.patch(update.lectureId, updateData);
      const updatedLecture = await ctx.db.get(update.lectureId);
      if (updatedLecture) {
        updatedLectures.push(updatedLecture);
      }
    }

    return updatedLectures;
  },
});
