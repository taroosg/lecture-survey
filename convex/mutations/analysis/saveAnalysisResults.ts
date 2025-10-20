/**
 * Save Analysis Results - Internal Mutation
 *
 * 分析結果を保存するinternal mutation関数
 */

import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import type {
  SimpleDistributionResult,
  CrossAnalysisResult,
  SummaryStatisticsResult,
} from "../../shared/types/analysis";

/**
 * 単純集計結果を保存
 *
 * @param resultSetId - 結果セットID
 * @param lectureId - 講義ID
 * @param results - 単純集計結果配列
 * @param calculatedAt - 計算日時
 */
export const saveSimpleDistributionInternal = internalMutation({
  args: {
    resultSetId: v.id("resultSets"),
    lectureId: v.id("lectures"),
    results: v.array(
      v.object({
        dim1QuestionCode: v.string(),
        dim1OptionCode: v.string(),
        n: v.number(),
        baseN: v.number(),
        pct: v.number(),
      }),
    ),
    calculatedAt: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const insertPromises = args.results.map((result) =>
      ctx.db.insert("resultFacts", {
        resultSetId: args.resultSetId,
        lectureId: args.lectureId,
        statType: "simple",
        dim1QuestionCode: result.dim1QuestionCode,
        dim1OptionCode: result.dim1OptionCode,
        n: result.n,
        baseN: result.baseN,
        pct: result.pct,
        createdAt: args.calculatedAt,
      }),
    );

    await Promise.all(insertPromises);
  },
});

/**
 * クロス集計結果を保存
 *
 * @param resultSetId - 結果セットID
 * @param lectureId - 講義ID
 * @param results - クロス集計結果配列
 * @param calculatedAt - 計算日時
 */
export const saveCrossAnalysisInternal = internalMutation({
  args: {
    resultSetId: v.id("resultSets"),
    lectureId: v.id("lectures"),
    results: v.array(
      v.object({
        dim1QuestionCode: v.string(),
        dim1OptionCode: v.string(),
        dim2QuestionCode: v.string(),
        dim2OptionCode: v.string(),
        n: v.number(),
        rowPct: v.number(),
        rowBaseN: v.number(),
        colPct: v.number(),
        colBaseN: v.number(),
        totalPct: v.number(),
        totalBaseN: v.number(),
      }),
    ),
    calculatedAt: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const insertPromises = args.results.map((result) =>
      ctx.db.insert("resultFacts", {
        resultSetId: args.resultSetId,
        lectureId: args.lectureId,
        statType: "cross2",
        dim1QuestionCode: result.dim1QuestionCode,
        dim1OptionCode: result.dim1OptionCode,
        dim2QuestionCode: result.dim2QuestionCode,
        dim2OptionCode: result.dim2OptionCode,
        n: result.n,
        rowPct: result.rowPct,
        rowBaseN: result.rowBaseN,
        colPct: result.colPct,
        colBaseN: result.colBaseN,
        totalPct: result.totalPct,
        totalBaseN: result.totalBaseN,
        createdAt: args.calculatedAt,
      }),
    );

    await Promise.all(insertPromises);
  },
});

/**
 * サマリー統計結果を保存
 *
 * @param resultSetId - 結果セットID
 * @param lectureId - 講義ID
 * @param results - サマリー統計結果配列
 * @param calculatedAt - 計算日時
 */
export const saveSummaryStatisticsInternal = internalMutation({
  args: {
    resultSetId: v.id("resultSets"),
    lectureId: v.id("lectures"),
    results: v.array(
      v.object({
        dim1QuestionCode: v.string(),
        dim1OptionCode: v.string(),
        targetQuestionCode: v.string(),
        avgScore: v.number(),
        baseN: v.number(),
      }),
    ),
    calculatedAt: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const insertPromises = args.results.map((result) =>
      ctx.db.insert("resultFacts", {
        resultSetId: args.resultSetId,
        lectureId: args.lectureId,
        statType: "summary",
        dim1QuestionCode: result.dim1QuestionCode,
        dim1OptionCode: result.dim1OptionCode,
        targetQuestionCode: result.targetQuestionCode,
        avgScore: result.avgScore,
        baseN: result.baseN,
        createdAt: args.calculatedAt,
      }),
    );

    await Promise.all(insertPromises);
  },
});
