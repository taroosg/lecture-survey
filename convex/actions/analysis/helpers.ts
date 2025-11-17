"use node";

/**
 * Execute Complete Analysis - Helper Functions
 *
 * Action間で共有するヘルパー関数群
 * Convex推奨プラクティス: 同じランタイム内ではTypeScriptヘルパー関数を使用
 */

import { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import * as DistributionCalculator from "../../services/analysis/calculators/distributionCalculator";
import * as CrossAnalysisCalculator from "../../services/analysis/calculators/crossAnalysisCalculator";
import * as SummaryCalculator from "../../services/analysis/calculators/summaryCalculator";

// 戻り値の型定義
interface AnalysisExecutionResult {
  success: boolean;
  resultSetId?: Id<"resultSets">;
  executionTime?: number;
  totalResponses?: number;
  resultsCount?: {
    simple: number;
    cross: number;
    summary: number;
  };
  error?: string;
  message?: string;
}

interface ExecuteAnalysisArgs {
  lectureId: Id<"lectures">;
  triggeredBy?: Id<"users">;
  triggerType: "auto" | "manual";
}

/**
 * 分析実行の共通ロジック
 * Action間で共有されるメインの処理ロジック
 */
export async function executeCompleteAnalysisHelper(
  ctx: ActionCtx,
  args: ExecuteAnalysisArgs,
): Promise<AnalysisExecutionResult> {
  const startTime = Date.now();
  console.log(
    `[AnalysisHelper] 分析処理開始: lectureId=${args.lectureId}, triggerType=${args.triggerType}`,
  );

  try {
    // ✅ Convex推奨パターン1: 単一internal関数でデータ取得
    console.log(`[AnalysisHelper] 分析用データ取得開始`);
    let analysisData;
    try {
      analysisData = await ctx.runQuery(
        internal.queries.analysis.getAnalysisData.getAnalysisDataInternal,
        { lectureId: args.lectureId },
      );
    } catch (dataError) {
      // データ取得エラー（存在しない講義など）を適切にハンドリング
      const executionTime = Date.now() - startTime;
      console.error(
        `[AnalysisHelper] データ取得失敗:`,
        dataError,
        executionTime,
      );

      // エラーを再スロー
      throw dataError;
    }

    console.log(
      `[AnalysisHelper] 分析用データ取得完了: ${analysisData.length}件`,
    );

    // 事前チェック: データが空の場合も処理は継続（空の分析結果を保存）
    if (analysisData.length === 0) {
      console.log(`[AnalysisHelper] 警告: 回答データが0件`);
    }

    // ✅ Convex推奨パターン2: Pure関数で計算処理（決定論的、テスト容易）
    console.log(`[AnalysisHelper] Pure関数による分析計算開始`);

    // 単純集計
    const simpleDistributions = [
      ...DistributionCalculator.calculateSimpleDistribution(
        analysisData,
        "gender",
      ),
      ...DistributionCalculator.calculateSimpleDistribution(
        analysisData,
        "ageGroup",
      ),
      ...DistributionCalculator.calculateSimpleDistribution(
        analysisData,
        "understanding",
      ),
      ...DistributionCalculator.calculateSimpleDistribution(
        analysisData,
        "satisfaction",
      ),
    ];

    // クロス集計（4パターン）
    const crossAnalyses = [
      ...CrossAnalysisCalculator.calculateCrossAnalysis(
        analysisData,
        "understanding",
        "gender",
      ),
      ...CrossAnalysisCalculator.calculateCrossAnalysis(
        analysisData,
        "understanding",
        "ageGroup",
      ),
      ...CrossAnalysisCalculator.calculateCrossAnalysis(
        analysisData,
        "satisfaction",
        "gender",
      ),
      ...CrossAnalysisCalculator.calculateCrossAnalysis(
        analysisData,
        "satisfaction",
        "ageGroup",
      ),
    ];

    // サマリー統計（理解度・満足度の平均）
    const summaryStatistics = [
      ...SummaryCalculator.calculateSummaryStatistics(
        analysisData,
        "understanding",
      ),
      ...SummaryCalculator.calculateSummaryStatistics(
        analysisData,
        "satisfaction",
      ),
    ];

    console.log(
      `[AnalysisHelper] 分析計算完了: simple=${simpleDistributions.length}, cross=${crossAnalyses.length}, summary=${summaryStatistics.length}`,
    );

    // ✅ Convex推奨パターン3: 決定論的タイムスタンプをActionで生成
    const calculatedAt = Date.now();

    // ✅ Convex推奨パターン4: 単一internal関数でResultSet作成
    console.log(`[AnalysisHelper] ResultSet作成開始`);
    const resultSetId = await ctx.runMutation(
      internal.mutations.analysis.createResultSet.createResultSetInternal,
      {
        lectureId: args.lectureId,
        closedAt: calculatedAt,
        totalResponses: analysisData.length,
      },
    );

    console.log(`[AnalysisHelper] ResultSet作成完了: ${resultSetId}`);

    // ✅ Convex推奨パターン5: 単一internal関数でバッチ保存
    console.log(`[AnalysisHelper] 分析結果保存開始`);

    // 単純集計結果保存
    if (simpleDistributions.length > 0) {
      await ctx.runMutation(
        internal.mutations.analysis.saveAnalysisResults
          .saveSimpleDistributionInternal,
        {
          resultSetId,
          lectureId: args.lectureId,
          results: simpleDistributions,
          calculatedAt,
        },
      );
    }

    // クロス集計結果保存
    if (crossAnalyses.length > 0) {
      await ctx.runMutation(
        internal.mutations.analysis.saveAnalysisResults
          .saveCrossAnalysisInternal,
        {
          resultSetId,
          lectureId: args.lectureId,
          results: crossAnalyses,
          calculatedAt,
        },
      );
    }

    // サマリー統計結果保存
    if (summaryStatistics.length > 0) {
      await ctx.runMutation(
        internal.mutations.analysis.saveAnalysisResults
          .saveSummaryStatisticsInternal,
        {
          resultSetId,
          lectureId: args.lectureId,
          results: summaryStatistics,
          calculatedAt,
        },
      );
    }

    console.log(
      `[AnalysisHelper] 分析結果保存完了: ${simpleDistributions.length + crossAnalyses.length + summaryStatistics.length}件`,
    );

    // ✅ Convex推奨パターン6: 単一internal関数でステータス更新
    console.log(`[AnalysisHelper] 分析ステータス更新開始`);
    await ctx.runMutation(
      internal.mutations.analysis.updateLectureStatus
        .markLectureAnalyzedInternal,
      {
        lectureId: args.lectureId,
        analyzedAt: calculatedAt,
      },
    );

    console.log(`[AnalysisHelper] 分析ステータス更新完了`);

    const executionTime = Date.now() - startTime;
    console.log(`[AnalysisHelper] 分析処理完了: 実行時間=${executionTime}ms`);

    return {
      success: true,
      resultSetId,
      executionTime,
      totalResponses: analysisData.length,
      resultsCount: {
        simple: simpleDistributions.length,
        cross: crossAnalyses.length,
        summary: summaryStatistics.length,
      },
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[AnalysisHelper] 分析処理失敗:`, error, executionTime);

    // エラーを再スローしてAction呼び出し元にエラーを伝播
    throw error;
  }
}
