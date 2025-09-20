import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { Doc } from "../../_generated/dataModel";

/**
 * 現在のユーザー情報取得（Internal Query）
 * 認証は呼び出し元で実施済み
 */
export const getCurrentUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<Doc<"users"> | null> => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("ユーザーが見つかりません");
    }
    return user;
  },
});
