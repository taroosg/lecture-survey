/**
 * updateLecture.ts のテスト
 * Internal Mutations - 講義更新機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../schema";
import { internal } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";

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
const createLectureData = (userId: Id<"users">) => ({
  title: "プログラミング基礎",
  lectureDate: "2025-12-01",
  lectureTime: "10:00",
  description: "プログラミングの基礎を学ぶ講義です",
  surveyCloseDate: "2025-12-02",
  surveyCloseTime: "18:00",
  surveyStatus: "active" as const,
  createdBy: userId,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

describe("updateLecture", () => {
  test("講義情報を正常に更新できること", async () => {
    const t = convexTest(schema);

    const { lectureId, userId } = await t.run(async (ctx) => {
      // テストユーザーを作成
      const userId = await ctx.db.insert("users", testUserData);
      // テスト講義を作成
      const lectureId = await ctx.db.insert("lectures", createLectureData(userId));
      return { lectureId, userId };
    });

    // updateLectureを実行
    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.updateLectureInternal,
      {
        lectureId,
        userId,
        title: "プログラミング応用",
        description: "より高度なプログラミング技法を学ぶ",
      },
    );

    expect(result).not.toBeNull();
    expect(result?.title).toBe("プログラミング応用");
    expect(result?.description).toBe("より高度なプログラミング技法を学ぶ");
    expect(result?.lectureDate).toBe("2025-12-01"); // 更新されていない値は保持
  });

  test("存在しない講義IDでnullが返されること", async () => {
    const t = convexTest(schema);

    const { nonExistentLectureId, userId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      // create-and-delete pattern
      const tempId = await ctx.db.insert("lectures", createLectureData(userId));
      await ctx.db.delete(tempId);
      return { nonExistentLectureId: tempId, userId };
    });

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.updateLectureInternal,
      {
        lectureId: nonExistentLectureId,
        userId,
        title: "更新タイトル",
      },
    );

    expect(result).toBeNull();
  });

  test("一部のフィールドのみ更新できること", async () => {
    const t = convexTest(schema);

    const { lectureId, originalData, userId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureId = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      const originalData = await ctx.db.get(lectureId);
      return { lectureId, originalData, userId };
    });

    await new Promise((resolve) => setTimeout(resolve, 1)); // タイミング調整

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.updateLectureInternal,
      {
        lectureId,
        userId,
        title: "新しいタイトル",
      },
    );

    expect(result?.title).toBe("新しいタイトル");
    expect(result?.lectureDate).toBe(originalData?.lectureDate); // 元のまま
    expect(result?.updatedAt).toBeGreaterThan(originalData?.updatedAt!); // 更新されている
  });

  test("updatedAtが更新されること", async () => {
    const t = convexTest(schema);

    const { lectureId, originalUpdatedAt, userId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureId = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      const lecture = await ctx.db.get(lectureId);
      return { lectureId, originalUpdatedAt: lecture?.updatedAt, userId };
    });

    await new Promise((resolve) => setTimeout(resolve, 1)); // タイミング調整

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.updateLectureInternal,
      {
        lectureId,
        userId,
        title: "更新タイトル",
      },
    );

    expect(result?.updatedAt).toBeGreaterThan(originalUpdatedAt!);
  });
});

describe("updateLectureSurveyStatus", () => {
  test("アンケート状態をactiveからclosedに変更できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.updateLectureSurveyStatus,
      {
        lectureId,
        surveyStatus: "closed",
      },
    );

    expect(result?.surveyStatus).toBe("closed");
    expect(result?.closedAt).toBeDefined();
  });

  test("アンケート状態をclosedからactiveに変更できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureData = {
        ...createLectureData(userId),
        surveyStatus: "closed" as const,
        closedAt: Date.now(),
      };
      return await ctx.db.insert("lectures", lectureData);
    });

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.updateLectureSurveyStatus,
      {
        lectureId,
        surveyStatus: "active",
      },
    );

    expect(result?.surveyStatus).toBe("active");
    // closedAtは残る（過去の情報として）
  });

  test("存在しない講義IDでnullが返されること", async () => {
    const t = convexTest(schema);

    const nonExistentLectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const tempId = await ctx.db.insert("lectures", createLectureData(userId));
      await ctx.db.delete(tempId);
      return tempId;
    });

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.updateLectureSurveyStatus,
      {
        lectureId: nonExistentLectureId,
        surveyStatus: "closed",
      },
    );

    expect(result).toBeNull();
  });
});

describe("autoCloseLecture", () => {
  test("期限切れの講義が自動クローズされること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const expiredLectureData = {
        ...createLectureData(userId),
        surveyCloseDate: "2025-01-01", // 過去の日付
        surveyCloseTime: "18:00",
      };
      return await ctx.db.insert("lectures", expiredLectureData);
    });

    // 現在時刻として2025年12月1日を使用
    const currentTime = new Date("2025-12-01T20:00:00").getTime();

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.autoCloseLecture,
      {
        lectureId,
        currentTime,
      },
    );

    expect(result?.surveyStatus).toBe("closed");
    expect(result?.closedAt).toBe(currentTime);
  });

  test("期限内の講義は変更されないこと", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const futureLectureData = {
        ...createLectureData(userId),
        surveyCloseDate: "2025-12-10", // 未来の日付
      };
      return await ctx.db.insert("lectures", futureLectureData);
    });

    const currentTime = new Date("2025-12-01T12:00:00").getTime();

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.autoCloseLecture,
      {
        lectureId,
        currentTime,
      },
    );

    expect(result?.surveyStatus).toBe("active");
    expect(result?.closedAt).toBeUndefined();
  });

  test("既にクローズされた講義はnullが返されること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const closedLectureData = {
        ...createLectureData(userId),
        surveyStatus: "closed" as const,
      };
      return await ctx.db.insert("lectures", closedLectureData);
    });

    const currentTime = new Date("2025-12-01T20:00:00").getTime();

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.autoCloseLecture,
      {
        lectureId,
        currentTime,
      },
    );

    expect(result).toBeNull();
  });
});

describe("bulkUpdateLectures", () => {
  test("複数の講義を一括更新できること", async () => {
    const t = convexTest(schema);

    const { lectureId1, lectureId2 } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureId1 = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      const lectureId2 = await ctx.db.insert("lectures", {
        ...createLectureData(userId),
        title: "データベース設計",
      });
      return { lectureId1, lectureId2 };
    });

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.bulkUpdateLectures,
      {
        updates: [
          {
            lectureId: lectureId1,
            title: "プログラミング応用",
          },
          {
            lectureId: lectureId2,
            title: "高度なデータベース設計",
            surveyStatus: "closed" as const,
          },
        ],
      },
    );

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("プログラミング応用");
    expect(result[1].title).toBe("高度なデータベース設計");
    expect(result[1].surveyStatus).toBe("closed");
    expect(result[1].closedAt).toBeDefined();
  });

  test("存在しない講義IDは無視されること", async () => {
    const t = convexTest(schema);

    const { lectureId1, nonExistentLectureId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureId1 = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      // create-and-delete pattern
      const nonExistentLectureId = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      await ctx.db.delete(nonExistentLectureId);
      return { lectureId1, nonExistentLectureId };
    });

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.bulkUpdateLectures,
      {
        updates: [
          {
            lectureId: lectureId1,
            title: "存在する講義",
          },
          {
            lectureId: nonExistentLectureId,
            title: "存在しない講義",
          },
        ],
      },
    );

    // 存在する講義のみが返される
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("存在する講義");
  });

  test("空の更新配列で空の配列が返されること", async () => {
    const t = convexTest(schema);

    const result = await t.mutation(
      internal.mutations.lectures.updateLecture.bulkUpdateLectures,
      {
        updates: [],
      },
    );

    expect(result).toHaveLength(0);
  });
});
