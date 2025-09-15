import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

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
