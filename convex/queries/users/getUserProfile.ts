import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";

/**
 * 指定ユーザーのプロファイル取得（Internal Query）
 * 認証は呼び出し元で実施済み、権限チェックを含む
 */
export const getUserProfile = internalQuery({
  args: {
    userId: v.id("users"),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, { userId, requestingUserId }) => {
    const currentUser = await ctx.db.get(requestingUserId);
    if (!currentUser) {
      throw new Error("リクエストユーザーが見つかりません");
    }

    const targetUser = await ctx.db.get(userId);
    if (!targetUser) {
      throw new Error("ユーザーが見つかりません");
    }

    // アクセス権限チェック（管理者または本人のみ）
    if (currentUser.role !== "admin" && currentUser._id !== targetUser._id) {
      throw new Error("このユーザーの情報にアクセスする権限がありません");
    }

    return targetUser;
  },
});
