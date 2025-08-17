/**
 * ユーザードメインのクエリAPI
 * 認証を必要とするユーザー情報取得機能
 */

import { query } from "../../../_generated/server";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import * as userRepository from "../repositories/userRepository";
import * as userService from "../services/userService";

/**
 * 現在のユーザー情報取得
 * 認証必須
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("認証が必要です");
    }

    const user = await userRepository.getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("ユーザーが見つかりません");
    }

    return user;
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
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    const targetUser = await userRepository.getUserById(ctx, args.userId);
    if (!targetUser) {
      throw new ConvexError("ユーザーが見つかりません");
    }

    // アクセス権限チェック
    if (!userService.canManageUser(currentUser, targetUser)) {
      throw new ConvexError("このユーザーの情報にアクセスする権限がありません");
    }

    return targetUser;
  },
});


/**
 * 管理者ユーザー一覧取得
 * 管理者のみアクセス可能
 */
export const getAdminUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    if (!userService.isAdmin(currentUser)) {
      throw new ConvexError("管理者権限が必要です");
    }

    const admins = await userRepository.getUsersByRole(ctx, "admin", {
      isActive: true,
    });

    return admins;
  },
});

/**
 * ユーザー統計情報取得
 * 管理者のみアクセス可能
 */
export const getUserStatistics = query({
  args: {},
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    if (!userService.isAdmin(currentUser)) {
      throw new ConvexError("管理者権限が必要です");
    }

    const stats = await userRepository.getUserStats(ctx);

    return stats;
  },
});

/**
 * アクティブユーザー一覧取得
 * 認証必須
 */
export const getActiveUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    if (!userService.isAdmin(currentUser)) {
      throw new ConvexError("管理者権限が必要です");
    }

    const users = await userRepository.getActiveUsers(ctx);

    return users;
  },
});

/**
 * ユーザー検索（メールアドレス）
 * 管理者のみアクセス可能
 */
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    if (!userService.isAdmin(currentUser)) {
      throw new ConvexError("管理者権限が必要です");
    }

    const user = await userRepository.getUserByEmail(ctx, args.email);
    return user;
  },
});

/**
 * ユーザーの表示名取得（パブリック情報）
 * 認証必須
 */
export const getUserDisplayName = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    const targetUser = await userRepository.getUserById(ctx, args.userId);
    const displayName = userService.getUserDisplayName(targetUser);

    return {
      userId: args.userId,
      displayName,
    };
  },
});
