/**
 * Internal Queries - 講義一覧取得機能
 * ユーザー別、ステータス別、日付範囲での講義一覧取得機能
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type {
  LectureWithAnalysis,
  AnalysisDataSummary,
} from "../../shared/types/analysis";

/**
 * 講義データの型定義
 */
export type LectureData = Doc<"lectures">;

/**
 * 講義フィルター条件の型定義
 */
export interface LectureFilter {
  createdBy?: Id<"users">;
  surveyStatus?: "active" | "closed";
  dateFrom?: string;
  dateTo?: string;
}

/**
 * ユーザー別の講義一覧を取得する
 * @param userId - ユーザーID
 * @param filter - フィルター条件
 * @returns 講義一覧（分析データ付き）
 */
export const getLecturesByUser = internalQuery({
  args: {
    userId: v.id("users"),
    filter: v.optional(
      v.object({
        surveyStatus: v.optional(
          v.union(v.literal("active"), v.literal("closed")),
        ),
        dateFrom: v.optional(v.string()),
        dateTo: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args): Promise<LectureWithAnalysis[]> => {
    let query = ctx.db
      .query("lectures")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId));

    const lectures = await query.collect();

    // フィルタリング
    let filteredLectures = lectures;

    if (args.filter?.surveyStatus) {
      filteredLectures = filteredLectures.filter(
        (lecture) => lecture.surveyStatus === args.filter?.surveyStatus,
      );
    }

    if (args.filter?.dateFrom) {
      filteredLectures = filteredLectures.filter(
        (lecture) => lecture.lectureDate >= args.filter!.dateFrom!,
      );
    }

    if (args.filter?.dateTo) {
      filteredLectures = filteredLectures.filter(
        (lecture) => lecture.lectureDate <= args.filter!.dateTo!,
      );
    }

    // 講義日順でソート（新しい順）
    filteredLectures.sort((a, b) => {
      const dateComparison = b.lectureDate.localeCompare(a.lectureDate);
      if (dateComparison !== 0) return dateComparison;
      return b.lectureTime.localeCompare(a.lectureTime);
    });

    // 分析済み講義の分析データを取得
    const lecturesWithAnalysis: LectureWithAnalysis[] = await Promise.all(
      filteredLectures.map(async (lecture) => {
        if (lecture.surveyStatus !== "analyzed") {
          return lecture as LectureWithAnalysis;
        }

        // 最新の結果セットを取得
        const latestResultSet = await ctx.db
          .query("resultSets")
          .withIndex("by_lecture_closedAt", (q) =>
            q.eq("lectureId", lecture._id),
          )
          .order("desc")
          .first();

        if (!latestResultSet) {
          return lecture as LectureWithAnalysis;
        }

        // サマリー統計（平均値）を取得
        const summaryFacts = await ctx.db
          .query("resultFacts")
          .withIndex("by_set_type_dim1", (q) =>
            q.eq("resultSetId", latestResultSet._id).eq("statType", "summary"),
          )
          .collect();

        // 理解度と満足度の平均値を取得
        const understandingAvg = summaryFacts.find(
          (f) =>
            f.targetQuestionCode === "understanding" &&
            f.dim1QuestionCode === "_total",
        );
        const satisfactionAvg = summaryFacts.find(
          (f) =>
            f.targetQuestionCode === "satisfaction" &&
            f.dim1QuestionCode === "_total",
        );

        const analysisData: AnalysisDataSummary = {
          understanding: understandingAvg?.avgScore ?? 0,
          satisfaction: satisfactionAvg?.avgScore ?? 0,
          responseCount: latestResultSet.totalResponses,
        };

        return {
          ...lecture,
          analysisData,
        } as LectureWithAnalysis;
      }),
    );

    return lecturesWithAnalysis;
  },
});

/**
 * アクティブな講義（自動締切対象）を取得する
 * @param currentTime - 現在時刻のタイムスタンプ
 * @returns 自動締切対象の講義一覧
 */
export const getActiveLecturesForAutoClosure = internalQuery({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args): Promise<LectureData[]> => {
    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_survey_status", (q) => q.eq("surveyStatus", "active"))
      .collect();

    // 締切時刻を過ぎた講義をフィルタリング
    const expiredLectures = lectures.filter((lecture) => {
      const closeDateTime = new Date(
        `${lecture.surveyCloseDate}T${lecture.surveyCloseTime}:00`,
      );
      return new Date(args.currentTime) > closeDateTime;
    });

    return expiredLectures;
  },
});

/**
 * 全講義取得（管理者用）
 * @param filter - フィルター条件
 * @returns 講義一覧
 */
export const getAllLectures = internalQuery({
  args: {
    filter: v.optional(
      v.object({
        surveyStatus: v.optional(
          v.union(v.literal("active"), v.literal("closed")),
        ),
        createdBy: v.optional(v.id("users")),
        dateFrom: v.optional(v.string()),
        dateTo: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args): Promise<LectureData[]> => {
    const lectures = await ctx.db.query("lectures").collect();

    // フィルターの適用
    let filteredLectures = lectures;

    if (args.filter?.surveyStatus) {
      filteredLectures = filteredLectures.filter(
        (lecture) => lecture.surveyStatus === args.filter?.surveyStatus,
      );
    }

    if (args.filter?.createdBy) {
      filteredLectures = filteredLectures.filter(
        (lecture) => lecture.createdBy === args.filter?.createdBy,
      );
    }

    if (args.filter?.dateFrom) {
      filteredLectures = filteredLectures.filter(
        (lecture) => lecture.lectureDate >= args.filter!.dateFrom!,
      );
    }

    if (args.filter?.dateTo) {
      filteredLectures = filteredLectures.filter(
        (lecture) => lecture.lectureDate <= args.filter!.dateTo!,
      );
    }

    // 作成日順でソート（新しい順）
    filteredLectures.sort((a, b) => b.createdAt - a.createdAt);

    return filteredLectures;
  },
});

/**
 * アクティブな講義一覧取得
 * @returns アクティブな講義一覧
 */
export const getActiveLectures = internalQuery({
  args: {},
  handler: async (ctx): Promise<LectureData[]> => {
    return await ctx.db
      .query("lectures")
      .withIndex("by_survey_status", (q) => q.eq("surveyStatus", "active"))
      .collect();
  },
});

/**
 * 終了した講義一覧取得
 * @returns 終了した講義一覧
 */
export const getClosedLectures = internalQuery({
  args: {},
  handler: async (ctx): Promise<LectureData[]> => {
    return await ctx.db
      .query("lectures")
      .withIndex("by_survey_status", (q) => q.eq("surveyStatus", "closed"))
      .collect();
  },
});

/**
 * 指定した日付の講義一覧取得
 * @param lectureDate - 講義日（YYYY-MM-DD形式）
 * @returns 指定日の講義一覧
 */
export const getLecturesByDate = internalQuery({
  args: {
    lectureDate: v.string(),
  },
  handler: async (ctx, args): Promise<LectureData[]> => {
    const allLectures = await ctx.db.query("lectures").collect();

    // 指定日の講義をフィルタリング
    const lecturesOnDate = allLectures.filter(
      (lecture) => lecture.lectureDate === args.lectureDate,
    );

    // 時間順でソート
    lecturesOnDate.sort((a, b) => a.lectureTime.localeCompare(b.lectureTime));

    return lecturesOnDate;
  },
});

/**
 * 指定した日付範囲の講義一覧取得
 * @param dateFrom - 開始日（YYYY-MM-DD形式）
 * @param dateTo - 終了日（YYYY-MM-DD形式）
 * @returns 日付範囲内の講義一覧
 */
export const getLecturesByDateRange = internalQuery({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (ctx, args): Promise<LectureData[]> => {
    const allLectures = await ctx.db.query("lectures").collect();

    // 日付範囲内の講義をフィルタリング
    const lecturesInRange = allLectures.filter(
      (lecture) =>
        lecture.lectureDate >= args.dateFrom &&
        lecture.lectureDate <= args.dateTo,
    );

    // 講義日時順でソート
    lecturesInRange.sort((a, b) => {
      const dateComparison = a.lectureDate.localeCompare(b.lectureDate);
      if (dateComparison !== 0) return dateComparison;
      return a.lectureTime.localeCompare(b.lectureTime);
    });

    return lecturesInRange;
  },
});
