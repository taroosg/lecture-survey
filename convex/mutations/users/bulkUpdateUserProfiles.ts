import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";

// ユーザープロファイル一括更新（管理者機能）
export const bulkUpdateUserProfiles = internalMutation({
  args: {
    userIds: v.array(v.id("users")),
    updateData: v.object({
      role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    totalRequested: number;
    totalUpdated: number;
    updatedUsers: (Doc<"users"> | null)[];
  }> => {
    // 認証は呼び出し元で実施済み
    const updatedUsers: (Doc<"users"> | null)[] = [];

    // 一括更新の実行
    for (const userId of args.userIds) {
      try {
        // DBスキーマに準拠した部分的更新用の型
        type UserBulkUpdates = {
          updatedAt: number;
          role?: "user" | "admin";
          isActive?: boolean;
        };

        const updates: UserBulkUpdates = {
          updatedAt: Date.now(),
        };

        if (args.updateData.role !== undefined) {
          updates.role = args.updateData.role;
        }
        if (args.updateData.isActive !== undefined) {
          updates.isActive = args.updateData.isActive;
        }

        await ctx.db.patch(userId, updates);
        const updatedUser = await ctx.db.get(userId);
        updatedUsers.push(updatedUser);
      } catch (error) {
        // 個別のエラーは記録するが、処理を継続
        console.error(`Failed to update user ${userId}:`, error);
        updatedUsers.push(null);
      }
    }

    return {
      totalRequested: args.userIds.length,
      totalUpdated: updatedUsers.filter((user) => user !== null).length,
      updatedUsers,
    };
  },
});
