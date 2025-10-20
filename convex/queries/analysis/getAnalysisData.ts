/**
 * Get Analysis Data - Internal Query
 *
 * 分析用データを取得するinternal query関数
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import {
  filterValidResponsesForAnalysis,
  normalizeForAnalysis,
} from "../../services/analysis/transformers/responseTransformer";
import type { RawResponseData } from "../../services/analysis/transformers/responseTransformer";
import type { AnalysisDataRow } from "../../shared/types/analysis";

/**
 * 指定された講義の分析用データを取得
 *
 * @param lectureId - 対象講義ID
 * @returns 正規化された分析用データ配列
 *
 * @throws 講義が見つからない場合
 * @throws 講義が分析できない状態の場合
 *
 * @example
 * const analysisData = await ctx.runQuery(
 *   internal.queries.analysis.getAnalysisData.getAnalysisDataInternal,
 *   { lectureId: "j57abc123..." }
 * );
 */
export const getAnalysisDataInternal = internalQuery({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args): Promise<AnalysisDataRow[]> => {
    // 1. 効率的な並列データ取得
    const [responses, lecture] = await Promise.all([
      // レスポンスデータの一括取得
      ctx.db
        .query("requiredResponses")
        .withIndex("by_lecture", (q) => q.eq("lectureId", args.lectureId))
        .collect(),

      // 講義情報の取得
      ctx.db.get(args.lectureId),
    ]);

    // 2. データ整合性チェック
    if (!lecture) {
      throw new Error(`講義が見つかりません: lectureId=${args.lectureId}`);
    }

    if (
      lecture.surveyStatus !== "closed" &&
      lecture.surveyStatus !== "analyzed"
    ) {
      throw new Error(
        `講義は分析できない状態です: surveyStatus=${lecture.surveyStatus}`,
      );
    }

    // 3. ConvexのDoc型からRawResponseData型に変換
    const rawResponses: RawResponseData[] = responses.map((response) => ({
      _id: response._id,
      lectureId: response.lectureId,
      gender: response.gender,
      ageGroup: response.ageGroup,
      understanding: response.understanding,
      satisfaction: response.satisfaction,
      freeComment: response.freeComment,
      userAgent: response.userAgent,
      ipAddress: response.ipAddress,
      responseTime: response.responseTime,
      createdAt: response._creationTime,
    }));

    // 4. Pure関数でデータ変換
    const validResponses = filterValidResponsesForAnalysis(rawResponses);
    const normalizedData = normalizeForAnalysis(validResponses);

    return normalizedData;
  },
});
