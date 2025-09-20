/**
 * submitResponse.ts のテスト
 * Internal Mutations - 講義アンケート回答機能のテスト
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

// テスト用の回答データファクトリー関数
const createResponseData = (lectureId: Id<"lectures">) => ({
  lectureId,
  gender: "男性",
  ageGroup: "20代",
  understanding: 4,
  satisfaction: 5,
  freeComment: "とても分かりやすい講義でした",
  userAgent: "Mozilla/5.0",
  ipAddress: "192.168.1.100",
  responseTime: 120,
});

describe("submitResponse", () => {
  test("アンケート回答を正常に投稿できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.submitResponse,
      createResponseData(lectureId),
    );

    expect(result).not.toBeNull();
    expect(result?.lectureId).toBe(lectureId);
    expect(result?.gender).toBe("男性");
    expect(result?.understanding).toBe(4);
    expect(result?.satisfaction).toBe(5);
    expect(result?.createdAt).toBeDefined();
  });

  test("存在しない講義IDでnullが返されること", async () => {
    const t = convexTest(schema);

    const nonExistentLectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      // create-and-delete pattern
      const tempId = await ctx.db.insert("lectures", createLectureData(userId));
      await ctx.db.delete(tempId);
      return tempId;
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.submitResponse,
      createResponseData(nonExistentLectureId),
    );

    expect(result).toBeNull();
  });

  test("クローズされた講義では回答投稿できないこと", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const closedLectureData = {
        ...createLectureData(userId),
        surveyStatus: "closed" as const,
      };
      return await ctx.db.insert("lectures", closedLectureData);
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.submitResponse,
      createResponseData(lectureId),
    );

    expect(result).toBeNull();
  });

  test("freeCommentなしで回答投稿できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    const { freeComment, ...responseData } = createResponseData(lectureId);

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.submitResponse,
      responseData,
    );

    expect(result?.freeComment).toBeUndefined();
  });

  test("オプショナルフィールドなしで回答投稿できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    const minimalResponseData = {
      lectureId,
      gender: "女性",
      ageGroup: "30代",
      understanding: 3,
      satisfaction: 4,
    };

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.submitResponse,
      minimalResponseData,
    );

    expect(result).not.toBeNull();
    expect(result?.userAgent).toBeUndefined();
    expect(result?.ipAddress).toBeUndefined();
    expect(result?.responseTime).toBeUndefined();
  });
});

describe("bulkSubmitResponses", () => {
  test("複数の回答を一括投稿できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    const responsesData = [
      createResponseData(lectureId),
      {
        ...createResponseData(lectureId),
        gender: "女性",
        understanding: 3,
        ipAddress: "192.168.1.101",
      },
    ];

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.bulkSubmitResponses,
      { responses: responsesData },
    );

    expect(result).toHaveLength(2);
    expect(result[0].gender).toBe("男性");
    expect(result[1].gender).toBe("女性");
    expect(result[0].createdAt).toBe(result[1].createdAt);
  });

  test("存在しない講義への回答は無視されること", async () => {
    const t = convexTest(schema);

    const { validLectureId, nonExistentLectureId } = await t.run(
      async (ctx) => {
        const userId = await ctx.db.insert("users", testUserData);
        const validLectureId = await ctx.db.insert(
          "lectures",
          createLectureData(userId),
        );
        // create-and-delete pattern
        const nonExistentLectureId = await ctx.db.insert(
          "lectures",
          createLectureData(userId),
        );
        await ctx.db.delete(nonExistentLectureId);
        return { validLectureId, nonExistentLectureId };
      },
    );

    const responsesData = [
      createResponseData(validLectureId),
      createResponseData(nonExistentLectureId),
    ];

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.bulkSubmitResponses,
      { responses: responsesData },
    );

    // 有効な講義への回答のみが処理される
    expect(result).toHaveLength(1);
    expect(result[0].lectureId).toBe(validLectureId);
  });

  test("クローズされた講義への回答は無視されること", async () => {
    const t = convexTest(schema);

    const { activeLectureId, closedLectureId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const activeLectureId = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      const closedLectureId = await ctx.db.insert("lectures", {
        ...createLectureData(userId),
        surveyStatus: "closed" as const,
      });
      return { activeLectureId, closedLectureId };
    });

    const responsesData = [
      createResponseData(activeLectureId),
      createResponseData(closedLectureId),
    ];

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.bulkSubmitResponses,
      { responses: responsesData },
    );

    // アクティブな講義への回答のみが処理される
    expect(result).toHaveLength(1);
    expect(result[0].lectureId).toBe(activeLectureId);
  });
});

describe("submitResponseWithDuplicateCheck", () => {
  test("重複チェック付きで回答投稿できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      createResponseData(lectureId),
    );

    expect(result.success).toBe(true);
    expect(result.response).not.toBeNull();
    expect(result.response?.lectureId).toBe(lectureId);
  });

  test("存在しない講義で適切なエラーが返されること", async () => {
    const t = convexTest(schema);

    const nonExistentLectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const tempId = await ctx.db.insert("lectures", createLectureData(userId));
      await ctx.db.delete(tempId);
      return tempId;
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      createResponseData(nonExistentLectureId),
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe("lecture_not_found");
  });

  test("クローズされた講義で適切なエラーが返されること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const closedLectureData = {
        ...createLectureData(userId),
        surveyStatus: "closed" as const,
      };
      return await ctx.db.insert("lectures", closedLectureData);
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      createResponseData(lectureId),
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe("survey_not_active");
  });

  test("同一IPアドレスからの重複投稿が検出されること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    // 最初の回答
    const firstResponse = await t.mutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      createResponseData(lectureId),
    );

    expect(firstResponse.success).toBe(true);

    // 同じIPアドレスからの2回目の回答
    const secondResponse = await t.mutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      createResponseData(lectureId),
    );

    expect(secondResponse.success).toBe(false);
    expect(secondResponse.reason).toBe("duplicate_response");
  });

  test("IPアドレスが異なれば重複投稿として扱われないこと", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    // 最初の回答
    const firstResponse = await t.mutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      createResponseData(lectureId),
    );

    expect(firstResponse.success).toBe(true);

    // 異なるIPアドレスからの回答
    const secondResponseData = {
      ...createResponseData(lectureId),
      ipAddress: "192.168.1.200",
    };

    const secondResponse = await t.mutation(
      internal.mutations.lectures.submitResponse
        .submitResponseWithDuplicateCheck,
      secondResponseData,
    );

    expect(secondResponse.success).toBe(true);
  });
});

describe("deleteResponse", () => {
  test("回答を正常に削除できること", async () => {
    const t = convexTest(schema);

    const responseId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureId = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      return await ctx.db.insert("requiredResponses", {
        lectureId,
        gender: "男性",
        ageGroup: "20代",
        understanding: 4,
        satisfaction: 5,
        createdAt: Date.now(),
      });
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.deleteResponse,
      { responseId },
    );

    expect(result).not.toBeNull();
    expect(result?.gender).toBe("男性");

    // 削除されたことを確認
    const deletedResponse = await t.run(async (ctx) => {
      return await ctx.db.get(responseId);
    });
    expect(deletedResponse).toBeNull();
  });

  test("存在しない回答IDでnullが返されること", async () => {
    const t = convexTest(schema);

    const nonExistentResponseId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureId = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );
      // create-and-delete pattern
      const tempId = await ctx.db.insert("requiredResponses", {
        lectureId,
        gender: "男性",
        ageGroup: "20代",
        understanding: 4,
        satisfaction: 5,
        createdAt: Date.now(),
      });
      await ctx.db.delete(tempId);
      return tempId;
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.deleteResponse,
      { responseId: nonExistentResponseId },
    );

    expect(result).toBeNull();
  });
});

describe("deleteAllResponsesForLecture", () => {
  test("講義の全回答を削除できること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      const lectureId = await ctx.db.insert(
        "lectures",
        createLectureData(userId),
      );

      // 複数の回答を作成
      await ctx.db.insert("requiredResponses", {
        lectureId,
        gender: "男性",
        ageGroup: "20代",
        understanding: 4,
        satisfaction: 5,
        createdAt: Date.now(),
      });
      await ctx.db.insert("requiredResponses", {
        lectureId,
        gender: "女性",
        ageGroup: "30代",
        understanding: 3,
        satisfaction: 4,
        createdAt: Date.now(),
      });

      return lectureId;
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.deleteAllResponsesForLecture,
      { lectureId },
    );

    expect(result.deletedCount).toBe(2);
    expect(result.lectureId).toBe(lectureId);

    // すべて削除されたことを確認
    const remainingResponses = await t.run(async (ctx) => {
      return await ctx.db
        .query("requiredResponses")
        .withIndex("by_lecture", (q) => q.eq("lectureId", lectureId))
        .collect();
    });
    expect(remainingResponses).toHaveLength(0);
  });

  test("回答がない講義で0件の削除が報告されること", async () => {
    const t = convexTest(schema);

    const lectureId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", testUserData);
      return await ctx.db.insert("lectures", createLectureData(userId));
    });

    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.deleteAllResponsesForLecture,
      { lectureId },
    );

    expect(result.deletedCount).toBe(0);
    expect(result.lectureId).toBe(lectureId);
  });

  test("他の講義の回答は影響を受けないこと", async () => {
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

      // 各講義に回答を作成
      await ctx.db.insert("requiredResponses", {
        lectureId: lectureId1,
        gender: "男性",
        ageGroup: "20代",
        understanding: 4,
        satisfaction: 5,
        createdAt: Date.now(),
      });
      await ctx.db.insert("requiredResponses", {
        lectureId: lectureId2,
        gender: "女性",
        ageGroup: "30代",
        understanding: 3,
        satisfaction: 4,
        createdAt: Date.now(),
      });

      return { lectureId1, lectureId2 };
    });

    // lectureId1の回答のみ削除
    const result = await t.mutation(
      internal.mutations.lectures.submitResponse.deleteAllResponsesForLecture,
      { lectureId: lectureId1 },
    );

    expect(result.deletedCount).toBe(1);

    // lectureId2の回答は残っていることを確認
    const remainingResponses = await t.run(async (ctx) => {
      return await ctx.db
        .query("requiredResponses")
        .withIndex("by_lecture", (q) => q.eq("lectureId", lectureId2))
        .collect();
    });
    expect(remainingResponses).toHaveLength(1);
  });
});
