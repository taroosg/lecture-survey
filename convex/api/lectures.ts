import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { v } from "convex/values";
import { requireAuth, requireActiveAuth } from "../shared/helpers/authHelpers";
import type { LectureWithAnalysis } from "../shared/types/analysis";

/**
 * 認証済みユーザーの講義一覧を取得（分析データ付き）
 */
export const getLectures = query({
  args: {
    surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<LectureWithAnalysis[]> => {
    const { userId } = await requireActiveAuth(ctx);
    return await ctx.runQuery(
      internal.queries.lectures.getLectures.getLecturesByUser,
      {
        userId,
        filter: args,
      },
    );
  },
});

/**
 * 特定の講義を取得（ID指定）
 */
export const getLecture = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<Doc<"lectures">> => {
    const { userId } = await requireActiveAuth(ctx);
    const lecture = await ctx.runQuery(
      internal.queries.lectures.getLecture.getLectureById,
      {
        lectureId: args.lectureId,
      },
    );

    if (!lecture) {
      throw new Error("指定された講義が見つかりません");
    }

    // 権限チェック（作成者のみアクセス可能）
    if (lecture.createdBy !== userId) {
      throw new Error("この講義にアクセスする権限がありません");
    }

    return lecture;
  },
});

/**
 * スラッグで講義を取得（公開アンケート用）
 * 認証不要
 */
export const getLectureBySlugPublic = query({
  args: {
    slug: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    _id: string;
    title: string;
    lectureDate: string;
    lectureTime: string;
    description: string | undefined;
    surveyStatus: "active" | "closed" | "analyzed";
  } | null> => {
    // 認証不要（公開アンケート用）
    return await ctx.runQuery(
      internal.queries.lectures.getLecture.getLectureBySlugInternal,
      {
        slug: args.slug,
      },
    );
  },
});

/**
 * 新しい講義を作成する
 */
export const createNewLecture = mutation({
  args: {
    title: v.string(),
    lectureDate: v.string(),
    lectureTime: v.string(),
    description: v.optional(v.string()),
    surveyCloseDate: v.string(),
    surveyCloseTime: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"lectures">> => {
    const { userId } = await requireActiveAuth(ctx);
    return await ctx.runMutation(
      internal.mutations.lectures.createLecture.createLectureInternal,
      {
        ...args,
        userId,
      },
    );
  },
});

/**
 * 既存の講義を更新する
 */
export const updateExistingLecture = mutation({
  args: {
    lectureId: v.id("lectures"),
    title: v.optional(v.string()),
    lectureDate: v.optional(v.string()),
    lectureTime: v.optional(v.string()),
    description: v.optional(v.string()),
    surveyCloseDate: v.optional(v.string()),
    surveyCloseTime: v.optional(v.string()),
    surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
  },
  handler: async (ctx, args): Promise<Doc<"lectures"> | null> => {
    const { userId } = await requireActiveAuth(ctx);
    return await ctx.runMutation(
      internal.mutations.lectures.updateLecture.updateLectureInternal,
      {
        ...args,
        userId,
      },
    );
  },
});

/**
 * 講義を削除する
 */
export const removeLecture = mutation({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const { userId } = await requireActiveAuth(ctx);
    return await ctx.runMutation(
      internal.mutations.lectures.deleteLecture.deleteLectureInternal,
      {
        lectureId: args.lectureId,
        userId,
      },
    );
  },
});

/**
 * アンケート回答提出
 * 認証不要（公開アンケート用）
 */
export const submitResponse = mutation({
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
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; responseId?: string }> => {
    // 認証不要（公開アンケート用）
    const result = await ctx.runMutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      args,
    );

    if (result && typeof result === "object" && "success" in result) {
      return {
        success: result.success,
        responseId:
          result.success && "response" in result
            ? result.response?._id
            : undefined,
      };
    }

    return { success: false };
  },
});
