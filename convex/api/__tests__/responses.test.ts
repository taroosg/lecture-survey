import { convexTest } from "convex-test";
import { test, expect, describe } from "vitest";
import { api } from "../../_generated/api";
import schema from "../../schema";

describe("responses API", () => {
  // テスト用講義データ作成関数
  const createTestLectureData = (
    createdBy: any,
    status: "active" | "closed" = "active",
  ) => {
    const now = Date.now();
    // 未来の日付を設定してアンケート期限エラーを回避
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7日後
    const futureDateString = futureDate.toISOString().split("T")[0]; // YYYY-MM-DD形式

    return {
      title: "Test Lecture",
      lectureDate: futureDateString,
      lectureTime: "13:00",
      description: "Test lecture description",
      surveyCloseDate: futureDateString,
      surveyCloseTime: "23:59", // 当日の最後
      surveyStatus: status,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
  };

  describe("checkSurveyAvailable", () => {
    test("未認証でも正常にアンケート可否をチェックできる（公開アクセス）", async () => {
      const t = convexTest(schema);

      // ダミーユーザーを作成（講義の作成者として）
      const dummyUserId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Dummy User",
          email: "dummy@example.com",
          role: "user",
          isActive: true,
          image: undefined,
          emailVerificationTime: undefined,
        });
      });

      // アクティブな講義を作成
      const lectureId = await t.run(async (ctx) => {
        return await ctx.db.insert(
          "lectures",
          createTestLectureData(dummyUserId, "active"),
        );
      });

      // 未認証でのアクセス（公開API）
      const result = await t.query(api.api.responses.checkSurveyAvailable, {
        lectureId,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.available).toBe("boolean");
    });

    test("認証済みユーザーでも正常にアンケート可否をチェックできる", async () => {
      const t = convexTest(schema);

      // ユーザーを作成
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          role: "user",
          isActive: true,
          image: undefined,
          emailVerificationTime: undefined,
        });
      });

      // アクティブな講義を作成
      const lectureId = await t.run(async (ctx) => {
        return await ctx.db.insert(
          "lectures",
          createTestLectureData(userId, "active"),
        );
      });

      // 認証済みユーザーとしてアクセス
      const result = await t
        .withIdentity({ subject: userId, issuer: "test" })
        .query(api.api.responses.checkSurveyAvailable, { lectureId });

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.available).toBe("boolean");
    });

    test("管理者でも正常にアンケート可否をチェックできる", async () => {
      const t = convexTest(schema);

      // 管理者ユーザーを作成
      const adminUserId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          isActive: true,
          image: undefined,
          emailVerificationTime: undefined,
        });
      });

      // アクティブな講義を作成
      const lectureId = await t.run(async (ctx) => {
        return await ctx.db.insert(
          "lectures",
          createTestLectureData(adminUserId, "active"),
        );
      });

      // 管理者としてアクセス
      const result = await t
        .withIdentity({ subject: adminUserId, issuer: "test" })
        .query(api.api.responses.checkSurveyAvailable, { lectureId });

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.available).toBe("boolean");
    });
  });

  describe("submitResponse", () => {
    // テスト用回答データ
    const createTestResponseData = (lectureId: any) => ({
      lectureId,
      gender: "male",
      ageGroup: "30s",
      understanding: 5,
      satisfaction: 4,
      freeComment: "とても良い講義でした",
      userAgent: "test-user-agent",
      ipAddress: "192.168.1.1",
    });

    test("未認証でも正常に回答を送信できる（公開アクセス）", async () => {
      const t = convexTest(schema);

      // ダミーユーザーを作成（講義の作成者として）
      const dummyUserId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Dummy User",
          email: "dummy@example.com",
          role: "user",
          isActive: true,
          image: undefined,
          emailVerificationTime: undefined,
        });
      });

      // アクティブな講義を作成
      const lectureId = await t.run(async (ctx) => {
        return await ctx.db.insert(
          "lectures",
          createTestLectureData(dummyUserId, "active"),
        );
      });

      const responseData = createTestResponseData(lectureId);

      // 未認証での回答送信（公開API）
      const result = await t.mutation(
        api.api.responses.submitResponse,
        responseData,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result.success).toBe(true);
      expect(result.responseId).toBeDefined();
    });

    test("認証済みユーザーでも正常に回答を送信できる", async () => {
      const t = convexTest(schema);

      // ユーザーを作成
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          role: "user",
          isActive: true,
          image: undefined,
          emailVerificationTime: undefined,
        });
      });

      // アクティブな講義を作成
      const lectureId = await t.run(async (ctx) => {
        return await ctx.db.insert(
          "lectures",
          createTestLectureData(userId, "active"),
        );
      });

      const responseData = createTestResponseData(lectureId);

      // 認証済みユーザーとしての回答送信
      const result = await t
        .withIdentity({ subject: userId, issuer: "test" })
        .mutation(api.api.responses.submitResponse, responseData);

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result.success).toBe(true);
      expect(result.responseId).toBeDefined();
    });

    test("管理者でも正常に回答を送信できる", async () => {
      const t = convexTest(schema);

      // 管理者ユーザーを作成
      const adminUserId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          isActive: true,
          image: undefined,
          emailVerificationTime: undefined,
        });
      });

      // アクティブな講義を作成
      const lectureId = await t.run(async (ctx) => {
        return await ctx.db.insert(
          "lectures",
          createTestLectureData(adminUserId, "active"),
        );
      });

      const responseData = createTestResponseData(lectureId);

      // 管理者としての回答送信
      const result = await t
        .withIdentity({ subject: adminUserId, issuer: "test" })
        .mutation(api.api.responses.submitResponse, responseData);

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result.success).toBe(true);
      expect(result.responseId).toBeDefined();
    });
  });
});
