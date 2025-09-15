/**
 * getLecture.ts のテスト
 * Internal Queries - 講義取得機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../schema";
import { internal } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";

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
  createdAt: Date.now(),
  updatedAt: Date.now(),
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
  createdAt: Date.now(),
  updatedAt: Date.now(),
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

describe("getLectureById", () => {
  test("存在する講義IDで講義が取得できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      const lectureId = await ctx.db.insert(
        "lectures",
        createLectureData1(userId),
      );

      return lectureId;
    });

    // getLectureByIdを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.getLectureById,
      {
        lectureId,
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(lectureId);
    expect(result?.title).toBe("プログラミング基礎");
    expect(result?.surveySlug).toBe("abc123");
  });

  test("存在しない講義IDでnullが返されること", async () => {
    const t = convexTest(schema);

    const nonExistentLectureId = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // 講義を作成して削除（create-and-delete pattern）
      const tempId = await ctx.db.insert(
        "lectures",
        createLectureData1(userId),
      );
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getLectureByIdを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.getLectureById,
      {
        lectureId: nonExistentLectureId,
      },
    );

    expect(result).toBeNull();
  });
});

describe("getLectureBySlug", () => {
  test("存在するスラッグで講義が取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId));
    });

    // getLectureBySlugを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.getLectureBySlug,
      {
        slug: "abc123",
      },
    );

    expect(result).not.toBeNull();
    expect(result?.title).toBe("プログラミング基礎");
    expect(result?.surveySlug).toBe("abc123");
  });

  test("存在しないスラッグでnullが返されること", async () => {
    const t = convexTest(schema);

    // getLectureBySlugを実行（存在しないスラッグ）
    const result = await t.query(
      internal.queries.lectures.getLecture.getLectureBySlug,
      {
        slug: "nonexistent",
      },
    );

    expect(result).toBeNull();
  });
});

describe("getLecturesByIds", () => {
  test("複数の講義IDで一括取得ができること", async () => {
    const t = convexTest(schema);

    const { lectureId1, lectureId2 } = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を2つ作成
      const lectureId1 = await ctx.db.insert(
        "lectures",
        createLectureData1(userId),
      );
      const lectureId2 = await ctx.db.insert(
        "lectures",
        createLectureData2(userId),
      );

      return { lectureId1, lectureId2 };
    });

    // getLecturesByIdsを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.getLecturesByIds,
      {
        lectureIds: [lectureId1, lectureId2],
      },
    );

    expect(result).toHaveLength(2);
    expect(result[0]._id).toBe(lectureId1);
    expect(result[1]._id).toBe(lectureId2);
  });

  test("存在しないIDが含まれていても正常に動作すること", async () => {
    const t = convexTest(schema);

    const { lectureId1, nonExistentLectureId } = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を1つ作成
      const lectureId1 = await ctx.db.insert(
        "lectures",
        createLectureData1(userId),
      );

      // 存在しないIDを生成（create-and-delete pattern）
      const nonExistentLectureId = await ctx.db.insert(
        "lectures",
        createLectureData2(userId),
      );
      await ctx.db.delete(nonExistentLectureId);

      return { lectureId1, nonExistentLectureId };
    });

    // getLecturesByIdsを実行（存在するIDと存在しないIDを混在）
    const result = await t.query(
      internal.queries.lectures.getLecture.getLecturesByIds,
      {
        lectureIds: [lectureId1, nonExistentLectureId],
      },
    );

    // 存在する講義のみが返されること
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe(lectureId1);
  });

  test("空の配列を渡した場合は空の配列が返されること", async () => {
    const t = convexTest(schema);

    // getLecturesByIdsを実行（空の配列）
    const result = await t.query(
      internal.queries.lectures.getLecture.getLecturesByIds,
      {
        lectureIds: [],
      },
    );

    expect(result).toHaveLength(0);
  });
});

describe("lectureExists", () => {
  test("存在する講義IDでtrueが返されること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      const lectureId = await ctx.db.insert(
        "lectures",
        createLectureData1(userId),
      );

      return lectureId;
    });

    // lectureExistsを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.lectureExists,
      {
        lectureId,
      },
    );

    expect(result).toBe(true);
  });

  test("存在しない講義IDでfalseが返されること", async () => {
    const t = convexTest(schema);

    const nonExistentLectureId = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // 存在しない講義IDを生成（create-and-delete pattern）
      const nonExistentLectureId = await ctx.db.insert(
        "lectures",
        createLectureData1(userId),
      );
      await ctx.db.delete(nonExistentLectureId);

      return nonExistentLectureId;
    });

    // lectureExistsを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.lectureExists,
      {
        lectureId: nonExistentLectureId,
      },
    );

    expect(result).toBe(false);
  });
});

describe("lectureExistsBySlug", () => {
  test("存在するスラッグでtrueが返されること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId));
    });

    // lectureExistsBySlugを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.lectureExistsBySlug,
      {
        slug: "abc123",
      },
    );

    expect(result).toBe(true);
  });

  test("存在しないスラッグでfalseが返されること", async () => {
    const t = convexTest(schema);

    // lectureExistsBySlugを実行
    const result = await t.query(
      internal.queries.lectures.getLecture.lectureExistsBySlug,
      {
        slug: "nonexistent",
      },
    );

    expect(result).toBe(false);
  });
});

describe("searchLecturesByTitle", () => {
  test("タイトルの部分文字列で検索できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId1 = await ctx.db.insert("users", testUserData1);
      const userId2 = await ctx.db.insert("users", testUserData2);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId1)); // プログラミング基礎
      await ctx.db.insert("lectures", createLectureData2(userId1)); // データベース設計
      await ctx.db.insert("lectures", createLectureData3(userId2)); // ウェブプログラミング
    });

    // "プログラミング"で検索
    const result = await t.query(
      internal.queries.lectures.getLecture.searchLecturesByTitle,
      {
        titlePattern: "プログラミング",
      },
    );

    expect(result).toHaveLength(2);
    result.forEach((lecture) => {
      expect(lecture.title).toContain("プログラミング");
    });
  });

  test("大文字小文字を区別せずに検索できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData3(userId)); // ウェブプログラミング
    });

    // 大文字で検索
    const result = await t.query(
      internal.queries.lectures.getLecture.searchLecturesByTitle,
      {
        titlePattern: "ウェブ",
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("ウェブプログラミング");
  });

  test("マッチしないパターンで空の配列が返されること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData1);

      // テスト講義を作成
      await ctx.db.insert("lectures", createLectureData1(userId));
    });

    // マッチしないパターンで検索
    const result = await t.query(
      internal.queries.lectures.getLecture.searchLecturesByTitle,
      {
        titlePattern: "存在しない",
      },
    );

    expect(result).toHaveLength(0);
  });
});
