/**
 * submitResponse.ts
 * Internal Mutations - 講義アンケート回答機能
 */

import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * 講義アンケートの回答を投稿する
 */
export const submitResponse = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    gender: v.string(),
    ageGroup: v.string(),
    understanding: v.number(),
    satisfaction: v.number(),
    freeComment: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    responseTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 講義の存在確認
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture) {
      return null;
    }

    // アンケートがアクティブかチェック
    if (lecture.surveyStatus !== "active") {
      return null;
    }

    const responseData = {
      lectureId: args.lectureId,
      gender: args.gender,
      ageGroup: args.ageGroup,
      understanding: args.understanding,
      satisfaction: args.satisfaction,
      freeComment: args.freeComment,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      responseTime: args.responseTime,
      createdAt: Date.now(),
    };

    const responseId = await ctx.db.insert("requiredResponses", responseData);
    return await ctx.db.get(responseId);
  },
});

/**
 * 複数の回答を一括投稿する
 */
export const bulkSubmitResponses = internalMutation({
  args: {
    responses: v.array(
      v.object({
        lectureId: v.id("lectures"),
        gender: v.string(),
        ageGroup: v.string(),
        understanding: v.number(),
        satisfaction: v.number(),
        freeComment: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
        responseTime: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const createdResponses = [];
    const now = Date.now();

    for (const responseArgs of args.responses) {
      // 講義の存在確認
      const lecture = await ctx.db.get(responseArgs.lectureId);
      if (!lecture || lecture.surveyStatus !== "active") {
        continue;
      }

      const responseData = {
        ...responseArgs,
        createdAt: now,
      };

      const responseId = await ctx.db.insert("requiredResponses", responseData);
      const createdResponse = await ctx.db.get(responseId);
      if (createdResponse) {
        createdResponses.push(createdResponse);
      }
    }

    return createdResponses;
  },
});

/**
 * IPアドレスによる重複回答チェック付きで回答を投稿する
 */
export const submitResponseWithDuplicateCheck = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    gender: v.string(),
    ageGroup: v.string(),
    understanding: v.number(),
    satisfaction: v.number(),
    freeComment: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    responseTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 講義の存在確認
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture) {
      return { success: false, reason: "lecture_not_found" };
    }

    // アンケートがアクティブかチェック
    if (lecture.surveyStatus !== "active") {
      return { success: false, reason: "survey_not_active" };
    }

    // IPアドレスによる重複チェック
    if (args.ipAddress) {
      const existingResponse = await ctx.db
        .query("requiredResponses")
        .withIndex("by_ip", (q) => q.eq("ipAddress", args.ipAddress))
        .filter((q) => q.eq(q.field("lectureId"), args.lectureId))
        .first();

      if (existingResponse) {
        return { success: false, reason: "duplicate_response" };
      }
    }

    const responseData = {
      lectureId: args.lectureId,
      gender: args.gender,
      ageGroup: args.ageGroup,
      understanding: args.understanding,
      satisfaction: args.satisfaction,
      freeComment: args.freeComment,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      responseTime: args.responseTime,
      createdAt: Date.now(),
    };

    const responseId = await ctx.db.insert("requiredResponses", responseData);
    const createdResponse = await ctx.db.get(responseId);

    return { success: true, response: createdResponse };
  },
});

/**
 * 講義の回答を削除する（管理者機能）
 */
export const deleteResponse = internalMutation({
  args: {
    responseId: v.id("requiredResponses"),
  },
  handler: async (ctx, args) => {
    // 回答の存在確認
    const response = await ctx.db.get(args.responseId);
    if (!response) {
      return null;
    }

    await ctx.db.delete(args.responseId);
    return response;
  },
});

/**
 * 講義の全回答を削除する（管理者機能）
 */
export const deleteAllResponsesForLecture = internalMutation({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("requiredResponses")
      .withIndex("by_lecture", (q) => q.eq("lectureId", args.lectureId))
      .collect();

    const deletedCount = responses.length;

    for (const response of responses) {
      await ctx.db.delete(response._id);
    }

    return { deletedCount, lectureId: args.lectureId };
  },
});
