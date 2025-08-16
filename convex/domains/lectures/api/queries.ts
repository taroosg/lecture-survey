import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  getLectureBySlug,
  getLectureById,
  getLecturesByUser,
  getLecturesByOrganization,
  getLectureStats,
  type LectureFilter,
} from "../repositories/lectureRepository";

/**
 * 認証済みユーザーの講義一覧を取得
 */
export const getLectures = query({
  args: {
    surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const filter: LectureFilter = {
      surveyStatus: args.surveyStatus,
      dateFrom: args.dateFrom,
      dateTo: args.dateTo,
    };

    return await getLecturesByUser(ctx.db, userId, filter);
  },
});

/**
 * 特定の講義を取得（ID指定）
 */
export const getLecture = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const lecture = await getLectureById(ctx.db, args.lectureId);
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
 */
export const getLectureBySlugPublic = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // 認証不要（公開アンケート用）
    const lecture = await getLectureBySlug(ctx.db, args.slug);
    if (!lecture) {
      return null;
    }

    // 公開用には一部フィールドのみ返す
    return {
      _id: lecture._id,
      title: lecture.title,
      lectureDate: lecture.lectureDate,
      lectureTime: lecture.lectureTime,
      description: lecture.description,
      surveyStatus: lecture.surveyStatus,
      organizationName: lecture.organizationName,
    };
  },
});

/**
 * 認証済みユーザーの講義統計を取得
 */
export const getLectureStatistics = query({
  args: {},
  handler: async (ctx) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    return await getLectureStats(ctx.db, userId);
  },
});

/**
 * 組織別の講義一覧を取得（管理者用）
 */
export const getLecturesByOrganizationName = query({
  args: {
    organizationName: v.string(),
    surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    // ユーザーの組織名を確認
    const user = await ctx.db.get(userId);
    if (!user || user.organizationName !== args.organizationName) {
      throw new Error("指定された組織の講義にアクセスする権限がありません");
    }

    const filter: LectureFilter = {
      surveyStatus: args.surveyStatus,
      dateFrom: args.dateFrom,
      dateTo: args.dateTo,
    };

    return await getLecturesByOrganization(
      ctx.db,
      args.organizationName,
      filter,
    );
  },
});

/**
 * 最近の講義を取得（ダッシュボード用）
 */
export const getRecentLectures = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const limit = args.limit || 5;
    const allLectures = await getLecturesByUser(ctx.db, userId);

    // 最新の講義を指定数分取得
    return allLectures.slice(0, limit);
  },
});

/**
 * アクティブな講義のみを取得
 */
export const getActiveLectures = query({
  args: {},
  handler: async (ctx) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const filter: LectureFilter = {
      surveyStatus: "active",
    };

    return await getLecturesByUser(ctx.db, userId, filter);
  },
});

/**
 * 締切済み講義のみを取得
 */
export const getClosedLectures = query({
  args: {},
  handler: async (ctx) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const filter: LectureFilter = {
      surveyStatus: "closed",
    };

    return await getLecturesByUser(ctx.db, userId, filter);
  },
});

/**
 * 講義の詳細情報を取得（アンケート状況を含む）
 */
export const getLectureDetails = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const lecture = await getLectureById(ctx.db, args.lectureId);
    if (!lecture) {
      throw new Error("指定された講義が見つかりません");
    }

    // 権限チェック
    if (lecture.createdBy !== userId) {
      throw new Error("この講義にアクセスする権限がありません");
    }

    // TODO: アンケート回答数なども含めた詳細情報を返す
    // 現在は基本情報のみ
    return {
      ...lecture,
      // 将来的にはアンケート回答数、分析結果なども含める
      responseCount: 0, // プレースホルダー
    };
  },
});
