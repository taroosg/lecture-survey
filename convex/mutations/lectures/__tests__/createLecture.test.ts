/**
 * createLecture.ts のテスト
 * Internal Mutations - 講義作成機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../schema";
import { internal } from "../../../_generated/api";

// テスト用のユーザーデータ
const testUserData = {
  name: "テスト講師",
  email: "teacher@example.com",
  role: "admin" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

// テスト用の講義データファクトリー関数
const createLectureTestData = (userId: any) => ({
  title: "プログラミング基礎",
  lectureDate: "2025-12-01",
  lectureTime: "10:00",
  description: "プログラミングの基礎を学ぶ講義です",
  surveyCloseDate: "2025-12-02",
  surveyCloseTime: "18:00",
  surveyUrl: "https://example.com/survey/abc123",
  surveySlug: "abc123",
  createdBy: userId,
});

describe("createLecture", () => {
  test("新しい講義を正常に作成できること", async () => {
    const t = convexTest(schema);

    const userId = await t.run(async (ctx) => {
      // テストユーザーを作成
      return await ctx.db.insert("users", testUserData);
    });

    // createLectureを実行
    const result = await t.mutation(
      internal.mutations.lectures.createLecture.createLecture,
      createLectureTestData(userId),
    );

    expect(result).not.toBeNull();
    expect(result?.title).toBe("プログラミング基礎");
    expect(result?.lectureDate).toBe("2025-12-01");
    expect(result?.surveyStatus).toBe("active");
    expect(result?.createdBy).toBe(userId);
    expect(result?.createdAt).toBeDefined();
    expect(result?.updatedAt).toBeDefined();
  });

  test("作成時にcreatedAtとupdatedAtが同じ値になること", async () => {
    const t = convexTest(schema);

    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    const result = await t.mutation(
      internal.mutations.lectures.createLecture.createLecture,
      createLectureTestData(userId),
    );

    expect(result?.createdAt).toBe(result?.updatedAt);
  });

  test("description未指定で作成できること", async () => {
    const t = convexTest(schema);

    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    const { description, ...lectureData } = createLectureTestData(userId);

    const result = await t.mutation(
      internal.mutations.lectures.createLecture.createLecture,
      lectureData,
    );

    expect(result).not.toBeNull();
    expect(result?.description).toBeUndefined();
  });

  test("surveyStatusがactiveで初期化されること", async () => {
    const t = convexTest(schema);

    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    const result = await t.mutation(
      internal.mutations.lectures.createLecture.createLecture,
      createLectureTestData(userId),
    );

    expect(result?.surveyStatus).toBe("active");
    expect(result?.closedAt).toBeUndefined();
  });
});

describe("bulkCreateLectures", () => {
  test("複数の講義を一括作成できること", async () => {
    const t = convexTest(schema);

    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    const lecturesData = [
      createLectureTestData(userId),
      {
        ...createLectureTestData(userId),
        title: "データベース設計",
        surveySlug: "db123",
      },
    ];

    const result = await t.mutation(
      internal.mutations.lectures.createLecture.bulkCreateLectures,
      { lectures: lecturesData },
    );

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("プログラミング基礎");
    expect(result[1].title).toBe("データベース設計");
    result.forEach((lecture) => {
      expect(lecture.surveyStatus).toBe("active");
      expect(lecture.createdBy).toBe(userId);
    });
  });

  test("空の配列で実行した場合は空の配列が返されること", async () => {
    const t = convexTest(schema);

    const result = await t.mutation(
      internal.mutations.lectures.createLecture.bulkCreateLectures,
      { lectures: [] },
    );

    expect(result).toHaveLength(0);
  });

  test("一括作成時に全ての講義が同じcreatedAt/updatedAtを持つこと", async () => {
    const t = convexTest(schema);

    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    const lecturesData = [
      createLectureTestData(userId),
      {
        ...createLectureTestData(userId),
        title: "データベース設計",
        surveySlug: "db123",
      },
    ];

    const result = await t.mutation(
      internal.mutations.lectures.createLecture.bulkCreateLectures,
      { lectures: lecturesData },
    );

    expect(result).toHaveLength(2);
    expect(result[0].createdAt).toBe(result[1].createdAt);
    expect(result[0].updatedAt).toBe(result[1].updatedAt);
  });
});
