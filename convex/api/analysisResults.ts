/**
 * Analysis Results API
 *
 * 分析結果を取得するPublic API
 */

import { query } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { requireAuth } from "../shared/helpers/authHelpers";
import type { Doc } from "../_generated/dataModel";
import type { BasicStatistics } from "../queries/analysis/getBasicStatistics";
import type { CrossAnalysisData } from "../queries/analysis/getCrossAnalysisData";

/**
 * 最新の分析結果を取得
 *
 * @param lectureId - 対象講義ID
 * @returns 結果セットと結果ファクト、または存在しない場合null
 */
export const getLatestAnalysisResults = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    resultSet: Doc<"resultSets">;
    resultFacts: Doc<"resultFacts">[];
  } | null> => {
    const { userId } = await requireAuth(ctx);
    return await ctx.runQuery(
      internal.queries.analysis.getLatestAnalysisResults
        .getLatestAnalysisResultsInternal,
      args,
    );
  },
});

/**
 * 基本統計（単純集計）を取得
 *
 * @param lectureId - 対象講義ID
 * @returns 基本統計データ、または存在しない場合null
 */
export const getBasicStatistics = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<BasicStatistics | null> => {
    const { userId } = await requireAuth(ctx);
    return await ctx.runQuery(
      internal.queries.analysis.getBasicStatistics.getBasicStatisticsInternal,
      args,
    );
  },
});

/**
 * クロス集計データを取得
 *
 * @param lectureId - 対象講義ID
 * @returns クロス集計データ、または存在しない場合null
 */
export const getCrossAnalysisData = query({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<CrossAnalysisData | null> => {
    const { userId } = await requireAuth(ctx);
    return await ctx.runQuery(
      internal.queries.analysis.getCrossAnalysisData
        .getCrossAnalysisDataInternal,
      args,
    );
  },
});

/**
 * ユーザーの全講義平均を取得
 *
 * @param targetQuestion - 対象質問（understanding/satisfaction）
 * @returns 平均値と講義数
 */
export const getAllLecturesAverage = query({
  args: {
    targetQuestion: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    average: number;
    totalLectures: number;
  }> => {
    const { userId } = await requireAuth(ctx);
    return await ctx.runQuery(
      internal.queries.analysis.getAllLecturesAverage
        .getAllLecturesAverageInternal,
      {
        userId,
        targetQuestion: args.targetQuestion,
      },
    );
  },
});
