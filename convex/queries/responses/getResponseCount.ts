/**
 * Get Response Count - Internal Query
 *
 * 指定講義の回答数を取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";

export interface ResponseCountResult {
  count: number;
  responses: Doc<"requiredResponses">[];
}

/**
 * 指定講義の回答数と回答データを取得
 *
 * @param lectureId - 対象講義ID
 * @returns 回答数と回答データの配列
 */
export const getResponseCount = internalQuery({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<ResponseCountResult> => {
    const responses = await ctx.db
      .query("requiredResponses")
      .withIndex("by_lecture", (q) => q.eq("lectureId", args.lectureId))
      .collect();

    return {
      count: responses.length,
      responses,
    };
  },
});
