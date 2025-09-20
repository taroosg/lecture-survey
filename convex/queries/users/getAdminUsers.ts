import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { Doc } from "../../_generated/dataModel";

/**
 * 管理者ユーザー一覧取得（Internal Query）
 * 認証と管理者権限チェックは呼び出し元で実施済み
 */
export const getAdminUsers = internalQuery({
  args: {
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, { requestingUserId }): Promise<Doc<"users">[]> => {
    // 管理者ロールかつアクティブなユーザーを取得
    const allUsers = await ctx.db.query("users").collect();
    const admins = allUsers.filter(
      (user) =>
        user.role === "admin" &&
        (user.isActive === undefined || user.isActive === true),
    );

    return admins;
  },
});
