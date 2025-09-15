import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

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
