import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { requireAuth } from "../shared/helpers/authHelpers";
import type { ResponseCountResult } from "../queries/responses/getResponseCount";

/**
 * Responses - Public API Layer
 *
 * 認証付きpublicラッパー関数群
 * internal query/mutationを呼び出してデータを取得/更新
 */

// アンケート回答可否チェック（認証なし - パブリックアクセス）
export const checkSurveyAvailable = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    available: boolean;
    reason?: string;
    lecture?: {
      _id: Id<"lectures">;
      title: string;
      lectureDate: string;
      lectureTime: string;
      description?: string;
    };
  }> => {
    return await ctx.runQuery(
      internal.queries.responses.checkSurveyAvailable.checkSurveyAvailable,
      {
        lectureId: args.lectureId,
      },
    );
  },
});

// 回答数取得（認証付き）
export const getResponseCount = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<ResponseCountResult> => {
    const { userId } = await requireAuth(ctx);
    return await ctx.runQuery(
      internal.queries.responses.getResponseCount.getResponseCount,
      {
        lectureId: args.lectureId,
      },
    );
  },
});

// アンケート回答送信（認証なし - パブリックアクセス）
export const submitResponse = mutation({
  args: {
    lectureId: v.id("lectures"),
    gender: v.string(),
    ageGroup: v.string(),
    understanding: v.number(),
    satisfaction: v.number(),
    freeComment: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    responseTime: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; responseId?: Id<"requiredResponses"> }> => {
    const result = await ctx.runMutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      {
        lectureId: args.lectureId,
        gender: args.gender,
        ageGroup: args.ageGroup,
        understanding: args.understanding,
        satisfaction: args.satisfaction,
        freeComment: args.freeComment,
        userAgent: args.userAgent,
        ipAddress: args.ipAddress,
        responseTime: args.responseTime,
      },
    );

    if (result && typeof result === "object" && "success" in result) {
      return {
        success: result.success,
        responseId:
          result.success && "response" in result
            ? result.response?._id
            : undefined,
      };
    }

    return { success: false };
  },
});
