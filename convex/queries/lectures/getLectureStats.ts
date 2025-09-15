/**
 * Internal Queries - 講義統計情報取得機能
 * 講義の統計情報とダッシュボード用データの取得機能
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";

/**
 * 講義データの型定義
 */
export type LectureData = Doc<"lectures">;

/**
 * 講義統計情報の型定義
 */
export interface LectureStatistics {
  totalLectures: number;
  activeLectures: number;
  closedLectures: number;
}

/**
 * 詳細な講義統計情報の型定義
 */
export interface DetailedLectureStatistics {
  totalLectures: number;
  activeLectures: number;
  closedLectures: number;
  lecturesThisWeek: number;
  lecturesThisMonth: number;
  averageLecturesPerUser: number;
}

/**
 * 講義統計情報を取得する
 * @param userId - ユーザーID
 * @returns 講義統計情報
 */
export const getLectureStats = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<LectureStatistics> => {
    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    const activeLectures = lectures.filter(
      (l) => l.surveyStatus === "active",
    ).length;
    const closedLectures = lectures.filter(
      (l) => l.surveyStatus === "closed",
    ).length;

    return {
      totalLectures: lectures.length,
      activeLectures,
      closedLectures,
    };
  },
});

/**
 * 全体の講義統計情報を取得する（管理者用）
 * @returns 全体の講義統計情報
 */
export const getGlobalLectureStats = internalQuery({
  args: {},
  handler: async (ctx): Promise<LectureStatistics> => {
    const lectures = await ctx.db.query("lectures").collect();

    const activeLectures = lectures.filter(
      (l) => l.surveyStatus === "active",
    ).length;
    const closedLectures = lectures.filter(
      (l) => l.surveyStatus === "closed",
    ).length;

    return {
      totalLectures: lectures.length,
      activeLectures,
      closedLectures,
    };
  },
});

/**
 * 詳細な講義統計情報を取得する
 * @param userId - ユーザーID
 * @returns 詳細な講義統計情報
 */
export const getDetailedLectureStats = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<DetailedLectureStatistics> => {
    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeLectures = lectures.filter(
      (l) => l.surveyStatus === "active",
    ).length;
    const closedLectures = lectures.filter(
      (l) => l.surveyStatus === "closed",
    ).length;

    const lecturesThisWeek = lectures.filter(
      (l) => l.createdAt >= oneWeekAgo.getTime(),
    ).length;
    const lecturesThisMonth = lectures.filter(
      (l) => l.createdAt >= oneMonthAgo.getTime(),
    ).length;

    // 全ユーザーの講義数を取得して平均を計算
    const allLectures = await ctx.db.query("lectures").collect();
    const uniqueCreators = new Set(allLectures.map((l) => l.createdBy)).size;
    const averageLecturesPerUser =
      uniqueCreators > 0 ? allLectures.length / uniqueCreators : 0;

    return {
      totalLectures: lectures.length,
      activeLectures,
      closedLectures,
      lecturesThisWeek,
      lecturesThisMonth,
      averageLecturesPerUser: Math.round(averageLecturesPerUser * 100) / 100,
    };
  },
});

/**
 * 講義作成の月別統計を取得する
 * @param userId - ユーザーID（省略時は全体統計）
 * @param months - 取得する月数（デフォルト: 12ヶ月）
 * @returns 月別の講義作成数
 */
export const getMonthlyLectureStats = internalQuery({
  args: {
    userId: v.optional(v.id("users")),
    months: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<Array<{ month: string; count: number }>> => {
    const monthsToFetch = args.months || 12;
    const now = new Date();

    // 指定ユーザーまたは全体の講義を取得
    let lectures: LectureData[];
    if (args.userId) {
      lectures = await ctx.db
        .query("lectures")
        .withIndex("by_creator", (q) => q.eq("createdBy", args.userId!))
        .collect();
    } else {
      lectures = await ctx.db.query("lectures").collect();
    }

    // 月別に集計
    const monthlyStats: Array<{ month: string; count: number }> = [];

    for (let i = 0; i < monthsToFetch; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthString = targetDate.toISOString().slice(0, 7); // YYYY-MM形式

      const lecturesInMonth = lectures.filter((lecture) => {
        const lectureDate = new Date(lecture.createdAt);
        return lectureDate >= targetDate && lectureDate < nextMonth;
      });

      monthlyStats.unshift({
        month: monthString,
        count: lecturesInMonth.length,
      });
    }

    return monthlyStats;
  },
});

/**
 * 講義のステータス分布を取得する
 * @param userId - ユーザーID（省略時は全体統計）
 * @returns ステータス別の講義数
 */
export const getLectureStatusDistribution = internalQuery({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (
    ctx,
    args,
  ): Promise<Array<{ status: string; count: number }>> => {
    // 指定ユーザーまたは全体の講義を取得
    let lectures: LectureData[];
    if (args.userId) {
      lectures = await ctx.db
        .query("lectures")
        .withIndex("by_creator", (q) => q.eq("createdBy", args.userId!))
        .collect();
    } else {
      lectures = await ctx.db.query("lectures").collect();
    }

    // ステータス別に集計
    const statusCount: Record<string, number> = {};
    lectures.forEach((lecture) => {
      const status = lecture.surveyStatus;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
    }));
  },
});

/**
 * アクティブユーザーの講義統計情報を取得する
 * @returns アクティブユーザー別の講義数
 */
export const getActiveUsersLectureStats = internalQuery({
  args: {},
  handler: async (
    ctx,
  ): Promise<Array<{ userId: Id<"users">; lectureCount: number }>> => {
    const lectures = await ctx.db.query("lectures").collect();

    // ユーザー別に講義数を集計
    const userLectureCount: Record<string, number> = {};
    lectures.forEach((lecture) => {
      const userId = lecture.createdBy;
      userLectureCount[userId] = (userLectureCount[userId] || 0) + 1;
    });

    // 結果を配列に変換して講義数の多い順にソート
    return Object.entries(userLectureCount)
      .map(([userId, lectureCount]) => ({
        userId: userId as Id<"users">,
        lectureCount,
      }))
      .sort((a, b) => b.lectureCount - a.lectureCount);
  },
});
