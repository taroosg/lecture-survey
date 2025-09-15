import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

// ユーザーアクティブ状態更新（管理者機能）
export const updateUserActiveStatus = internalMutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 認証は呼び出し元で実施済み

    // ユーザーの存在確認
    const existingUser = await ctx.db.get(args.userId);
    if (!existingUser) {
      return null;
    }

    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});
