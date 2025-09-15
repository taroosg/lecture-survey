/**
 * getLectures.ts のテスト
 * Internal Queries - 講義一覧取得機能のテスト
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
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const testUserData2 = {
  name: "テストユーザー2",
  email: "test2@example.com",
  role: "admin" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

// テスト用の講義データファクトリー関数
const createLectureData1 = (userId: Id<"users">) => ({
  title: "プログラミング基礎",
  lectureDate: "2025-12-01",
  lectureTime: "10:00",
  description: "プログラミングの基礎を学ぶ講義です",
  surveyCloseDate: "2025-12-02",
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/abc123",
  surveySlug: "abc123",
  surveyStatus: "active" as const,
  createdBy: userId,
  createdAt: Date.now() - 2000,
  updatedAt: Date.now() - 2000,
});

const createLectureData2 = (userId: Id<"users">) => ({
  title: "データベース設計",
  lectureDate: "2025-12-03",
  lectureTime: "14:00",
  description: "データベース設計の基本を学ぶ",
  surveyCloseDate: "2025-12-04",
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/def456",
  surveySlug: "def456",
  surveyStatus: "active" as const,
  createdBy: userId,
  createdAt: Date.now() - 1000,
  updatedAt: Date.now() - 1000,
});

const createLectureData3 = (userId: Id<"users">) => ({
  title: "ウェブプログラミング",
  lectureDate: "2025-12-05",
  lectureTime: "16:00",
  description: "ウェブアプリケーション開発を学ぶ",
  surveyCloseDate: "2025-12-06",
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/ghi789",
  surveySlug: "ghi789",
  surveyStatus: "closed" as const,
  createdBy: userId,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const createExpiredLectureData = (userId: Id<"users">) => ({
  title: "期限切れ講義",
  lectureDate: "2025-12-01",
  lectureTime: "10:00",
  description: "期限が切れた講義",
  surveyCloseDate: "2025-01-01", // 過去の日付
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/exp123",
  surveySlug: "exp123",
  surveyStatus: "active" as const,
  createdBy: userId,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

describe("getLecturesByUser", () => {
  test("指定ユーザーの講義一覧を取得できること", async () => {
    const t = convexTest(schema);

    const testUserId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId1 = await ctx.db.insert("users", testUserData1);
      const userId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId1));
      await ctx.db.insert("lectures", createLectureData2(userId1));
      await ctx.db.insert("lectures", createLectureData3(userId2));

      return userId1;
    });

    // getLecturesByUserを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getLecturesByUser,
      {
        userId: testUserId1,
      },
    );

    expect(result).toHaveLength(2);
    result.forEach((lecture) => {
      expect(lecture.createdBy).toBe(testUserId1);
    });
  });

  test("ステータスフィルターが正しく動作すること", async () => {
    const t = convexTest(schema);

    const testUserId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // active
      await ctx.db.insert("lectures", {
        ...createLectureData2(testUserId1),
        surveyStatus: "closed" as const,
      }); // closed

      return testUserId1;
    });

    // アクティブな講義のみ取得
    const result = await t.query(
      internal.queries.lectures.getLectures.getLecturesByUser,
      {
        userId: testUserId1,
        filter: { surveyStatus: "active" },
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].surveyStatus).toBe("active");
  });

  test("日付範囲フィルターが正しく動作すること", async () => {
    const t = convexTest(schema);

    const testUserId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // 2025-12-01
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // 2025-12-03

      return testUserId1;
    });

    // 2025-12-02以降の講義のみ取得
    const result = await t.query(
      internal.queries.lectures.getLectures.getLecturesByUser,
      {
        userId: testUserId1,
        filter: { dateFrom: "2025-12-02" },
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].lectureDate).toBe("2025-12-03");
  });

  test("講義が日付順にソートされていること", async () => {
    const t = convexTest(schema);

    const testUserId1 = await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成（日付順ではない順序で挿入）
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // 2025-12-03
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // 2025-12-01

      return testUserId1;
    });

    // getLecturesByUserを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getLecturesByUser,
      {
        userId: testUserId1,
      },
    );

    expect(result).toHaveLength(2);
    // 新しい順にソートされているか確認
    expect(result[0].lectureDate).toBe("2025-12-03");
    expect(result[1].lectureDate).toBe("2025-12-01");
  });
});

describe("getActiveLecturesForAutoClosure", () => {
  test("期限切れのアクティブ講義を取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId)); // 未来の締切
      await ctx.db.insert("lectures", createExpiredLectureData(userId)); // 過去の締切
    });

    // 現在時刻として2025年12月1日を使用
    const currentTime = new Date("2025-12-01T20:00:00").getTime();

    // getActiveLecturesForAutoClosureを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getActiveLecturesForAutoClosure,
      {
        currentTime,
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("期限切れ講義");
  });

  test("期限内の講義は取得されないこと", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // 未来の締切の講義のみ作成
      await ctx.db.insert("lectures", createLectureData1(userId));
    });

    // 現在時刻として2025年12月1日を使用
    const currentTime = new Date("2025-12-01T12:00:00").getTime();

    // getActiveLecturesForAutoClosureを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getActiveLecturesForAutoClosure,
      {
        currentTime,
      },
    );

    expect(result).toHaveLength(0);
  });
});

describe("getAllLectures", () => {
  test("全講義を取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId1 = await ctx.db.insert("users", testUserData1);
      const userId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId1));
      await ctx.db.insert("lectures", createLectureData2(userId1));
      await ctx.db.insert("lectures", createLectureData3(userId2));
    });

    // getAllLecturesを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getAllLectures,
      {},
    );

    expect(result).toHaveLength(3);
  });

  test("フィルター条件を適用できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId1 = await ctx.db.insert("users", testUserData1);
      const userId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId1)); // active
      await ctx.db.insert("lectures", createLectureData3(userId2)); // closed
    });

    // アクティブな講義のみフィルタリング
    const result = await t.query(
      internal.queries.lectures.getLectures.getAllLectures,
      {
        filter: { surveyStatus: "active" },
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].surveyStatus).toBe("active");
  });
});

describe("getActiveLectures", () => {
  test("アクティブな講義のみ取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId1 = await ctx.db.insert("users", testUserData1);
      const userId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId1)); // active
      await ctx.db.insert("lectures", createLectureData2(userId1)); // active
      await ctx.db.insert("lectures", createLectureData3(userId2)); // closed
    });

    // getActiveLecturesを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getActiveLectures,
      {},
    );

    expect(result).toHaveLength(2);
    result.forEach((lecture) => {
      expect(lecture.surveyStatus).toBe("active");
    });
  });
});

describe("getClosedLectures", () => {
  test("終了した講義のみ取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId1 = await ctx.db.insert("users", testUserData1);
      const userId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId1)); // active
      await ctx.db.insert("lectures", createLectureData3(userId2)); // closed
    });

    // getClosedLecturesを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getClosedLectures,
      {},
    );

    expect(result).toHaveLength(1);
    expect(result[0].surveyStatus).toBe("closed");
  });
});

describe("getLecturesByDate", () => {
  test("指定日の講義を取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId)); // 2025-12-01
      await ctx.db.insert("lectures", createLectureData2(userId)); // 2025-12-03
      await ctx.db.insert("lectures", {
        ...createLectureData1(userId),
        lectureTime: "15:00",
      }); // 2025-12-01
    });

    // 2025-12-01の講義を取得
    const result = await t.query(
      internal.queries.lectures.getLectures.getLecturesByDate,
      {
        lectureDate: "2025-12-01",
      },
    );

    expect(result).toHaveLength(2);
    result.forEach((lecture) => {
      expect(lecture.lectureDate).toBe("2025-12-01");
    });

    // 時間順にソートされているか確認
    expect(result[0].lectureTime).toBe("10:00");
    expect(result[1].lectureTime).toBe("15:00");
  });
});

describe("getLecturesByDateRange", () => {
  test("指定した日付範囲の講義を取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);
      const testUserId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // 2025-12-01
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // 2025-12-03
      await ctx.db.insert("lectures", createLectureData3(testUserId2)); // 2025-12-05
    });

    // 2025-12-01から2025-12-03の範囲で取得
    const result = await t.query(
      internal.queries.lectures.getLectures.getLecturesByDateRange,
      {
        dateFrom: "2025-12-01",
        dateTo: "2025-12-03",
      },
    );

    expect(result).toHaveLength(2);
    expect(result[0].lectureDate).toBe("2025-12-01");
    expect(result[1].lectureDate).toBe("2025-12-03");
  });

  test("日付順にソートされていること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const testUserId1 = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成（日付順ではない順序で挿入）
      await ctx.db.insert("lectures", createLectureData2(testUserId1)); // 2025-12-03
      await ctx.db.insert("lectures", createLectureData1(testUserId1)); // 2025-12-01
    });

    // getLecturesByDateRangeを実行
    const result = await t.query(
      internal.queries.lectures.getLectures.getLecturesByDateRange,
      {
        dateFrom: "2025-12-01",
        dateTo: "2025-12-03",
      },
    );

    expect(result).toHaveLength(2);
    // 古い順にソートされているか確認
    expect(result[0].lectureDate).toBe("2025-12-01");
    expect(result[1].lectureDate).toBe("2025-12-03");
  });
});
