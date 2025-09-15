/**
 * getLectureStats.ts のテスト
 * Internal Queries - 講義統計情報取得機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";

// テスト用のユーザーデータ
const testUserData1 = {
  name: "テストユーザー1",
  email: "test1@example.com",
  role: "user" as const,
  organizationName: "テスト大学1",
  isActive: true,
  updatedAt: Date.now(),
};

const testUserData2 = {
  name: "テストユーザー2",
  email: "test2@example.com",
  role: "user" as const,
  organizationName: "テスト大学2",
  isActive: true,
  updatedAt: Date.now(),
};

// テスト用の講義データ生成関数
const baseTime = Date.now(); // 現在時刻を使用

const createLectureData1 = (userId: Id<"users">) => ({
  title: "講義1",
  lectureDate: "2025-12-01",
  lectureTime: "10:00",
  description: "講義1の説明",
  surveyCloseDate: "2025-12-02",
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/1",
  surveySlug: "slug1",
  surveyStatus: "active" as const,
  createdBy: userId,
  createdAt: baseTime,
  updatedAt: baseTime,
});

const createLectureData2 = (userId: Id<"users">) => ({
  title: "講義2",
  lectureDate: "2025-12-03",
  lectureTime: "14:00",
  description: "講義2の説明",
  surveyCloseDate: "2025-12-04",
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/2",
  surveySlug: "slug2",
  surveyStatus: "closed" as const,
  createdBy: userId,
  createdAt: baseTime - 6 * 24 * 60 * 60 * 1000, // 6日前
  updatedAt: baseTime - 6 * 24 * 60 * 60 * 1000,
});

const createLectureData3 = (userId: Id<"users">) => ({
  title: "講義3",
  lectureDate: "2025-12-05",
  lectureTime: "16:00",
  description: "講義3の説明",
  surveyCloseDate: "2025-12-06",
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/3",
  surveySlug: "slug3",
  surveyStatus: "active" as const,
  createdBy: userId,
  createdAt: baseTime - 30 * 24 * 60 * 60 * 1000, // 1ヶ月前
  updatedAt: baseTime - 30 * 24 * 60 * 60 * 1000,
});

describe("getLectureStats", () => {
  test("指定ユーザーの講義統計情報を正しく計算できること", async () => {
    const t = convexTest(schema);

    const userId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId1 = await ctx.db.insert("users", testUserData1);
      const userId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId1)); // userId1, active
      await ctx.db.insert("lectures", createLectureData2(userId1)); // userId1, closed
      await ctx.db.insert("lectures", createLectureData3(userId2)); // userId2, active

      return userId1;
    });

    // getLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getLectureStats,
      {
        userId: userId1,
      },
    );

    expect(result.totalLectures).toBe(2);
    expect(result.activeLectures).toBe(1);
    expect(result.closedLectures).toBe(1);
  });

  test("講義がないユーザーの統計情報が正しく計算されること", async () => {
    const t = convexTest(schema);

    const userId1 = await t.run(async (ctx) => {
      // テストユーザーを作成（講義は作成しない）
      return await ctx.db.insert("users", testUserData1);
    });

    // getLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getLectureStats,
      {
        userId: userId1,
      },
    );

    expect(result.totalLectures).toBe(0);
    expect(result.activeLectures).toBe(0);
    expect(result.closedLectures).toBe(0);
  });

  test("存在しないユーザーIDで統計情報が正しく計算されること", async () => {
    const t = convexTest(schema);

    const nonExistentUserId = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData1);
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getLectureStats,
      {
        userId: nonExistentUserId,
      },
    );

    expect(result.totalLectures).toBe(0);
    expect(result.activeLectures).toBe(0);
    expect(result.closedLectures).toBe(0);
  });
});

describe("getGlobalLectureStats", () => {
  test("全体の講義統計情報を正しく計算できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);
      const testUserId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // active
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // closed
      await ctx.db.insert("lectures", createLectureData3(testUserId2)); // active
    });

    // getGlobalLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getGlobalLectureStats,
      {},
    );

    expect(result.totalLectures).toBe(3);
    expect(result.activeLectures).toBe(2);
    expect(result.closedLectures).toBe(1);
  });
});

describe("getDetailedLectureStats", () => {
  test("詳細な講義統計情報を正しく計算できること", async () => {
    const t = convexTest(schema);

    const testUserId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);
      const testUserId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // testUserId1, 現在
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // testUserId1, 1週間前
      await ctx.db.insert("lectures", createLectureData3(testUserId2)); // testUserId2, 1ヶ月前

      return testUserId1;
    });

    // getDetailedLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getDetailedLectureStats,
      {
        userId: testUserId1,
      },
    );

    expect(result.totalLectures).toBe(2);
    expect(result.activeLectures).toBe(1);
    expect(result.closedLectures).toBe(1);
    expect(result.lecturesThisWeek).toBe(2); // testLectureData1 (現在) + testLectureData2 (6日前)
    expect(result.lecturesThisMonth).toBe(2); // testLectureData1, testLectureData2
    expect(result.averageLecturesPerUser).toBe(1.5); // 3講義 / 2ユーザー
  });

  test("存在しないユーザーIDで詳細統計情報が正しく計算されること", async () => {
    const t = convexTest(schema);

    const nonExistentUserId = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData1);
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getDetailedLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getDetailedLectureStats,
      {
        userId: nonExistentUserId,
      },
    );

    expect(result.totalLectures).toBe(0);
    expect(result.activeLectures).toBe(0);
    expect(result.closedLectures).toBe(0);
    expect(result.lecturesThisWeek).toBe(0);
    expect(result.lecturesThisMonth).toBe(0);
  });
});

describe("getMonthlyLectureStats", () => {
  test("月別の講義統計情報を正しく計算できること", async () => {
    const t = convexTest(schema);

    const testUserId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);

      // 現在の月と前月の講義を作成
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 15);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      await ctx.db.insert("lectures", {
        ...createLectureData1(testUserId1),
        createdAt: currentMonth.getTime(),
      });
      await ctx.db.insert("lectures", {
        ...createLectureData2(testUserId1),
        createdAt: lastMonth.getTime(),
      });

      return testUserId1;
    });

    // getMonthlyLectureStatsを実行（2ヶ月分）
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getMonthlyLectureStats,
      {
        userId: testUserId1,
        months: 2,
      },
    );

    expect(result).toHaveLength(2);
    expect(result[0].count + result[1].count).toBe(2);
  });

  test("全体の月別統計を取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);
      const testUserId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1));
      await ctx.db.insert("lectures", createLectureData2(testUserId1));
      await ctx.db.insert("lectures", createLectureData3(testUserId2));
    });

    // getMonthlyLectureStatsを実行（userIdなし）
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getMonthlyLectureStats,
      {
        months: 3,
      },
    );

    expect(result).toHaveLength(3);
    // 全講義数の合計が3になることを確認
    const totalCount = result.reduce((sum, month) => sum + month.count, 0);
    expect(totalCount).toBe(3);
  });

  test("存在しないユーザーIDで月別統計が正しく計算されること", async () => {
    const t = convexTest(schema);

    const nonExistentUserId = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData1);
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getMonthlyLectureStatsを実行（存在しないユーザーID）
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getMonthlyLectureStats,
      {
        userId: nonExistentUserId,
        months: 3,
      },
    );

    expect(result).toHaveLength(3);
    // 全ての月でcount = 0であることを確認
    result.forEach((month) => {
      expect(month.count).toBe(0);
    });
  });
});

describe("getLectureStatusDistribution", () => {
  test("講義ステータスの分布を正しく計算できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);
      const testUserId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // active
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // closed
      await ctx.db.insert("lectures", createLectureData3(testUserId2)); // active
    });

    // getLectureStatusDistributionを実行（全体）
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getLectureStatusDistribution,
      {},
    );

    expect(result).toHaveLength(2);

    const activeStatus = result.find((item) => item.status === "active");
    const closedStatus = result.find((item) => item.status === "closed");

    expect(activeStatus?.count).toBe(2);
    expect(closedStatus?.count).toBe(1);
  });

  test("指定ユーザーのステータス分布を取得できること", async () => {
    const t = convexTest(schema);

    const testUserId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);
      const testUserId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // testUserId1, active
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // testUserId1, closed
      await ctx.db.insert("lectures", createLectureData3(testUserId2)); // testUserId2, active

      return testUserId1;
    });

    // getLectureStatusDistributionを実行（testUserId1のみ）
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getLectureStatusDistribution,
      {
        userId: testUserId1,
      },
    );

    expect(result).toHaveLength(2);

    const activeStatus = result.find((item) => item.status === "active");
    const closedStatus = result.find((item) => item.status === "closed");

    expect(activeStatus?.count).toBe(1);
    expect(closedStatus?.count).toBe(1);
  });

  test("存在しないユーザーIDでステータス分布が正しく計算されること", async () => {
    const t = convexTest(schema);

    const nonExistentUserId = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData1);
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getLectureStatusDistributionを実行（存在しないユーザーID）
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getLectureStatusDistribution,
      {
        userId: nonExistentUserId,
      },
    );

    expect(result).toHaveLength(0);
  });
});

describe("getActiveUsersLectureStats", () => {
  test("アクティブユーザーの講義統計情報を取得できること", async () => {
    const t = convexTest(schema);

    const { testUserId1, testUserId2 } = await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);
      const testUserId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // testUserId1
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // testUserId1
      await ctx.db.insert("lectures", createLectureData3(testUserId2)); // testUserId2

      return { testUserId1, testUserId2 };
    });

    // getActiveUsersLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getActiveUsersLectureStats,
      {},
    );

    expect(result).toHaveLength(2);

    // 講義数の多い順にソートされているか確認
    expect(result[0].userId).toBe(testUserId1);
    expect(result[0].lectureCount).toBe(2);
    expect(result[1].userId).toBe(testUserId2);
    expect(result[1].lectureCount).toBe(1);
  });

  test("講義がない場合は空の配列が返されること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // 講義を作成しない
    });

    // getActiveUsersLectureStatsを実行
    const result = await t.query(
      internal.queries.lectures.getLectureStats.getActiveUsersLectureStats,
      {},
    );

    expect(result).toHaveLength(0);
  });
});
