import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { requireAuth, requireAdminAuth } from "../shared/helpers/authHelpers";

/**
 * 現在のユーザー情報取得
 * 認証必須
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const { userId } = await requireAuth(ctx);
    return await ctx.runQuery(
      internal.queries.users.getCurrentUser.getCurrentUser,
      {
        userId,
      },
    );
  },
});

/**
 * 指定ユーザーのプロファイル取得
 * 認証必須、管理者または本人のみアクセス可能
 */
export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<any> => {
    const { userId: requestingUserId } = await requireAuth(ctx);
    return await ctx.runQuery(
      internal.queries.users.getUserProfile.getUserProfile,
      {
        userId: args.userId,
        requestingUserId,
      },
    );
  },
});

/**
 * ユーザープロファイル更新
 * 認証必須、本人または管理者のみ実行可能
 */
export const updateProfile = mutation({
  args: {
    userId: v.optional(v.id("users")),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const { userId: currentUserId } = await requireAuth(ctx);
    return await ctx.runMutation(
      internal.mutations.users.updateUserProfile.updateProfileInternal,
      {
        ...args,
        currentUserId,
      },
    );
  },
});

/**
 * ユーザーロール変更
 * 管理者のみ実行可能
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args): Promise<any> => {
    const { userId: currentUserId } = await requireAdminAuth(ctx);
    return await ctx.runMutation(
      internal.mutations.users.updateUserRole.updateUserRoleInternal,
      {
        ...args,
        currentUserId,
      },
    );
  },
});
