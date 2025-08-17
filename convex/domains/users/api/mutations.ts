/**
 * ユーザードメインのミューテーションAPI
 * ユーザー管理操作を担当
 */

import { mutation } from "../../../_generated/server";
import { ConvexError, v } from "convex/values";
import * as userRepository from "../repositories/userRepository";
import * as userService from "../services/userService";
import * as userValidator from "../services/userValidator";

/**
 * ユーザープロファイル更新
 * 認証必須、本人または管理者のみ実行可能
 */
export const updateProfile = mutation({
  args: {
    userId: v.optional(v.id("users")), // 未指定の場合は自分のプロファイル
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    // 更新対象ユーザーの決定
    const targetUserId = args.userId || currentUser._id;
    const targetUser = await userRepository.getUserById(ctx, targetUserId);
    if (!targetUser) {
      throw new ConvexError("ユーザーが見つかりません");
    }

    // 権限チェック
    if (!userService.canManageUser(currentUser, targetUser)) {
      throw new ConvexError("このユーザーを編集する権限がありません");
    }

    // バリデーション
    const updateData = {
      name: args.name,
    };

    const validation = userValidator.validateUserProfileUpdate(updateData);
    if (!validation.isValid) {
      throw new ConvexError(
        `入力データが無効です: ${validation.errors.join(", ")}`,
      );
    }

    // 更新データの準備
    const preparedData = userService.prepareUserProfileUpdate(
      targetUser,
      updateData,
    );

    // プロファイル更新
    const updatedUser = await userRepository.updateUserProfile(
      ctx,
      targetUserId,
      preparedData,
    );

    return updatedUser;
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
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    // 管理者権限チェック
    if (!userService.isAdmin(currentUser)) {
      throw new ConvexError("管理者権限が必要です");
    }

    // 対象ユーザーの存在確認
    const targetUser = await userRepository.getUserById(ctx, args.userId);
    if (!targetUser) {
      throw new ConvexError("ユーザーが見つかりません");
    }

    // 自分自身のロール変更を防止
    if (currentUser._id === args.userId) {
      throw new ConvexError("自分自身のロールは変更できません");
    }

    // ロールバリデーション
    const roleValidation = userValidator.validateUserRole(args.newRole);
    if (!roleValidation.isValid) {
      throw new ConvexError(
        `無効なロールです: ${roleValidation.errors.join(", ")}`,
      );
    }

    // ロール更新
    const updatedUser = await userRepository.updateUserRole(
      ctx,
      args.userId,
      args.newRole,
    );

    return updatedUser;
  },
});

/**
 * ユーザーアクティブ状態変更
 * 管理者のみ実行可能
 */
export const updateUserActiveStatus = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    // 管理者権限チェック
    if (!userService.isAdmin(currentUser)) {
      throw new ConvexError("管理者権限が必要です");
    }

    // 対象ユーザーの存在確認
    const targetUser = await userRepository.getUserById(ctx, args.userId);
    if (!targetUser) {
      throw new ConvexError("ユーザーが見つかりません");
    }

    // 自分自身の無効化を防止
    if (currentUser._id === args.userId && !args.isActive) {
      throw new ConvexError("自分自身を無効化することはできません");
    }

    // アクティブ状態更新
    const updatedUser = await userRepository.updateUserActiveStatus(
      ctx,
      args.userId,
      args.isActive,
    );

    return updatedUser;
  },
});

/**
 * ユーザープロファイル一括更新
 * 管理者のみ実行可能
 */
export const bulkUpdateUserProfiles = mutation({
  args: {
    userIds: v.array(v.id("users")),
    updateData: v.object({
      role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    // 管理者権限チェック
    if (!userService.isAdmin(currentUser)) {
      throw new ConvexError("管理者権限が必要です");
    }

    // 更新データのバリデーション

    if (args.updateData.role) {
      const roleValidation = userValidator.validateUserRole(
        args.updateData.role,
      );
      if (!roleValidation.isValid) {
        throw new ConvexError(
          `無効なロールです: ${roleValidation.errors.join(", ")}`,
        );
      }
    }

    // 自分自身が含まれていないかチェック
    if (args.userIds.includes(currentUser._id)) {
      throw new ConvexError("一括更新に自分自身を含めることはできません");
    }

    // 一括更新の実行
    const updatedUsers = [];
    for (const userId of args.userIds) {
      try {
        const updatedUser = await userRepository.updateUserProfile(
          ctx,
          userId,
          {
            ...args.updateData,
            updatedAt: Date.now(),
          },
        );
        updatedUsers.push(updatedUser);
      } catch (error) {
        // 個別のエラーをログに記録（実際のプロダクションでは適切なロギング）
        console.error(`Failed to update user ${userId}:`, error);
      }
    }

    return {
      totalRequested: args.userIds.length,
      totalUpdated: updatedUsers.length,
      updatedUsers,
    };
  },
});

/**
 * ユーザー検索結果の表示名更新
 * 認証必須、本人のみ実行可能
 */
export const updateDisplayPreferences = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await userRepository.getCurrentUser(ctx);
    if (!currentUser) {
      throw new ConvexError("認証が必要です");
    }

    // 名前のバリデーション
    if (args.name.length > 100) {
      throw new ConvexError("名前は100文字以内で入力してください");
    }

    // サニタイゼーション
    const sanitizedName = userValidator.sanitizeUserInput(args.name);

    // 名前更新
    const updatedUser = await userRepository.updateUserProfile(
      ctx,
      currentUser._id,
      {
        name: sanitizedName,
        updatedAt: Date.now(),
      },
    );

    return updatedUser;
  },
});
