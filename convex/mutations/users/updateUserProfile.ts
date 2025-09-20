import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { Doc } from "../../_generated/dataModel";

// ユーザープロファイル更新
export const updateUserProfile = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    organizationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 認証は呼び出し元で実施済み
    const { userId, ...updateFields } = args;

    // ユーザーの存在確認
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      return null;
    }

    // DBスキーマに準拠した部分的更新用の型
    type UserUpdates = {
      updatedAt: number;
      name?: string;
      email?: string;
      organizationName?: string;
    };

    const updates: UserUpdates = {
      updatedAt: Date.now(),
    };

    if (updateFields.name !== undefined) updates.name = updateFields.name;
    if (updateFields.email !== undefined) updates.email = updateFields.email;
    if (updateFields.organizationName !== undefined)
      updates.organizationName = updateFields.organizationName;

    await ctx.db.patch(userId, updates);

    return await ctx.db.get(userId);
  },
});

/**
 * ユーザープロファイル更新（Internal Mutation）
 * 認証と権限チェックは呼び出し元で実施済み
 */
export const updateProfileInternal = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    name: v.optional(v.string()),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    // 更新対象ユーザーの決定（認証と権限は呼び出し元で確認済み）
    const targetUserId = args.userId || args.currentUserId;

    // 基本的なバリデーション
    if (args.name && args.name.trim().length === 0) {
      throw new Error("名前は空にできません");
    }

    // ユーザーの存在確認
    const existingUser = await ctx.db.get(targetUserId);
    if (!existingUser) {
      throw new Error("ユーザーが見つかりません");
    }

    // 更新データの準備
    const updateData: Partial<Doc<"users">> = {};
    if (args.name !== undefined) {
      updateData.name = args.name.trim();
    }

    // 更新実行
    await ctx.db.patch(targetUserId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    // 更新後のユーザー情報を返す
    return await ctx.db.get(targetUserId);
  },
});
