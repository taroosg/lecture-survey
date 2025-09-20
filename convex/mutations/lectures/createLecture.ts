/**
 * createLecture.ts
 * Internal Mutations - 講義作成機能
 */

import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * 新しい講義を作成する（Internal Mutation）
 * 認証と権限チェックは呼び出し元で実施済み
 */
export const createLectureInternal = internalMutation({
  args: {
    title: v.string(),
    lectureDate: v.string(),
    lectureTime: v.string(),
    description: v.optional(v.string()),
    surveyCloseDate: v.string(),
    surveyCloseTime: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const lectureData = {
      title: args.title,
      lectureDate: args.lectureDate,
      lectureTime: args.lectureTime,
      description: args.description,
      surveyCloseDate: args.surveyCloseDate,
      surveyCloseTime: args.surveyCloseTime,
      surveyStatus: "active" as const,
      createdBy: args.userId,
      createdAt: now,
      updatedAt: now,
    };

    const lectureId = await ctx.db.insert("lectures", lectureData);

    const createdLecture = await ctx.db.get(lectureId);
    if (!createdLecture) {
      throw new Error("講義の作成に失敗しました");
    }
    return createdLecture;
  },
});

/**
 * 講義を一括作成する
 */
export const bulkCreateLectures = internalMutation({
  args: {
    userId: v.id("users"),
    lectures: v.array(
      v.object({
        title: v.string(),
        lectureDate: v.string(),
        lectureTime: v.string(),
        description: v.optional(v.string()),
        surveyCloseDate: v.string(),
        surveyCloseTime: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const createdLectures = [];

    for (const lectureData of args.lectures) {
      const fullLectureData = {
        ...lectureData,
        surveyStatus: "active" as const,
        createdBy: args.userId,
        createdAt: now,
        updatedAt: now,
      };

      const lectureId = await ctx.db.insert("lectures", fullLectureData);

      const createdLecture = await ctx.db.get(lectureId);
      if (createdLecture) {
        createdLectures.push(createdLecture);
      }
    }

    return createdLectures;
  },
});
