import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { Doc } from "../../_generated/dataModel";

// ユーザーロール更新（管理者機能）
export const updateUserRole = internalMutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // 認証は呼び出し元で実施済み

    // ユーザーの存在確認
    const existingUser = await ctx.db.get(args.userId);
    if (!existingUser) {
      return null;
    }

    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

/**
 * ユーザーロール変更（Internal Mutation）
 * 認証と権限チェックは呼び出し元で実施済み
 */
export const updateUserRoleInternal = internalMutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("admin")),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    // 対象ユーザーの存在確認
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("ユーザーが見つかりません");
    }

    // 自分自身のロール変更を防止
    if (args.currentUserId === args.userId) {
      throw new Error("自分自身のロールは変更できません");
    }

    // ロール更新（管理者権限チェックは呼び出し元で実施済み）
    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    // 更新後のユーザー情報を返す
    return await ctx.db.get(args.userId);
  },
});
