/**
 * deleteLecture.ts
 * Internal Mutations - 講義削除機能
 */

import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * 講義を削除する（Internal Mutation）
 * 認証と権限チェックは呼び出し元で実施済み
 */
export const deleteLectureInternal = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    // 講義の存在確認
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture) {
      throw new Error("講義が見つかりません");
    }

    // 所有者チェック（作成者のみ削除可能）
    if (lecture.createdBy !== args.userId) {
      throw new Error("この講義を削除する権限がありません");
    }

    // 講義削除
    await ctx.db.delete(args.lectureId);

    return { success: true };
  },
});
