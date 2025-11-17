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

    // カスケード削除：関連データを順番に削除

    // 1. アンケート回答を削除
    const responses = await ctx.db
      .query("requiredResponses")
      .withIndex("by_lecture", (q) => q.eq("lectureId", args.lectureId))
      .collect();
    await Promise.all(responses.map((response) => ctx.db.delete(response._id)));

    // 2. 分析結果ファクトを削除
    const resultFacts = await ctx.db
      .query("resultFacts")
      .withIndex("by_lecture", (q) => q.eq("lectureId", args.lectureId))
      .collect();
    await Promise.all(resultFacts.map((fact) => ctx.db.delete(fact._id)));

    // 3. 分析結果セットを削除
    const resultSets = await ctx.db
      .query("resultSets")
      .withIndex("by_lecture_closedAt", (q) =>
        q.eq("lectureId", args.lectureId),
      )
      .collect();
    await Promise.all(resultSets.map((set) => ctx.db.delete(set._id)));

    // 4. 講義本体を削除
    await ctx.db.delete(args.lectureId);

    return { success: true };
  },
});
