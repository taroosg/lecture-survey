/**
 * updateLecture.ts
 * Internal Mutations - 講義更新機能
 */

import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * 既存の講義を更新する（Internal Mutation）
 * 認証と権限チェックは呼び出し元で実施済み
 */
export const updateLectureInternal = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    title: v.optional(v.string()),
    lectureDate: v.optional(v.string()),
    lectureTime: v.optional(v.string()),
    description: v.optional(v.string()),
    surveyCloseDate: v.optional(v.string()),
    surveyCloseTime: v.optional(v.string()),
    surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 既存講義の存在確認
    const existingLecture = await ctx.db.get(args.lectureId);
    if (!existingLecture) {
      return null;
    }

    // 権限チェック（作成者のみ更新可能）
    if (existingLecture.createdBy !== args.userId) {
      throw new Error("この講義を更新する権限がありません");
    }

    // 更新データの準備
    const updateData: any = {};

    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("タイトルは必須です");
      }
      updateData.title = args.title.trim();
    }

    if (args.lectureDate !== undefined) {
      updateData.lectureDate = args.lectureDate;
    }

    if (args.lectureTime !== undefined) {
      updateData.lectureTime = args.lectureTime;
    }

    if (args.description !== undefined) {
      updateData.description = args.description.trim();
    }

    if (args.surveyCloseDate !== undefined) {
      updateData.surveyCloseDate = args.surveyCloseDate;
    }

    if (args.surveyCloseTime !== undefined) {
      updateData.surveyCloseTime = args.surveyCloseTime;
    }

    if (args.surveyStatus !== undefined) {
      // 基本的な状態遷移チェック（activeからclosedのみ許可）
      if (
        args.surveyStatus === "closed" &&
        existingLecture.surveyStatus !== "active"
      ) {
        throw new Error("アクティブでない講義は締切できません");
      }
      updateData.surveyStatus = args.surveyStatus;

      // 締切時は閉鎖時刻を記録
      if (args.surveyStatus === "closed") {
        updateData.closedAt = Date.now();
      }
    }

    // 講義更新
    await ctx.db.patch(args.lectureId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    // 更新後の講義を返す
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
