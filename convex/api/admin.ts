import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { requireAdminAuth } from "../shared/helpers/authHelpers";

/**
 * 全ユーザー一覧取得
 * 管理者のみアクセス可能
 */
export const getAllUsers = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const { userId } = await requireAdminAuth(ctx);
    return await ctx.runQuery(
      internal.queries.users.getUsers.getUsersInternal,
      {
        requestingUserId: userId,
      },
    );
  },
});

/**
 * 管理者ユーザー一覧取得
 * 管理者のみアクセス可能
 */
export const getAdminUsers = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const { userId } = await requireAdminAuth(ctx);
    return await ctx.runQuery(
      internal.queries.users.getUsers.getUsersInternal,
      {
        filter: { role: "admin", isActive: true },
        requestingUserId: userId,
      },
    );
  },
});

/**
 * ユーザー情報設定
 * 管理者のみ実行可能
 */
export const setUserInfo = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
    isActive: v.optional(v.boolean()),
    name: v.optional(v.string()),
    organizationName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const { userId: currentUserId } = await requireAdminAuth(ctx);
    return await ctx.runMutation(
      internal.mutations.users.updateUserProfile.updateUserProfile,
      {
        ...args,
        userId: currentUserId,
      },
    );
  },
});

// システム統計情報取得機能は参考プロジェクトにないため削除

/**
 * 全講義一覧取得（管理者用）
 * 管理者のみアクセス可能
 */
export const getAllLectures = query({
  args: {
    surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
    createdBy: v.optional(v.id("users")),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const { userId } = await requireAdminAuth(ctx);
    return await ctx.runQuery(
      internal.queries.lectures.getLectures.getAllLectures,
      {
        filter: args,
      },
    );
  },
});

// 操作ログ取得機能は参考プロジェクトにないため削除

// ユーザー強制削除機能は参考プロジェクトにないため削除

// 講義強制削除機能は参考プロジェクトにないため削除

// システム設定更新機能は参考プロジェクトにないため削除
