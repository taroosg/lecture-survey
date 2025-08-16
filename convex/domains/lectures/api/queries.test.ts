import { describe, test, expect, vi, beforeEach } from "vitest";
import { Id } from "../../../_generated/dataModel";

// モックを設定
vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(),
}));

vi.mock("../repositories/lectureRepository", () => ({
  getLecturesByUser: vi.fn(),
  getLectureById: vi.fn(),
  getLectureBySlug: vi.fn(),
  getLectureStats: vi.fn(),
  getLecturesByOrganization: vi.fn(),
}));

// テスト対象のクエリをインポート（モック後）
import {
  getLectures,
  getLecture,
  getLectureBySlugPublic,
  getLectureStatistics,
  getRecentLectures,
  getActiveLectures,
  getClosedLectures,
  getLectureDetails,
} from "./queries";

// モック関数を取得
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  getLecturesByUser,
  getLectureById,
  getLectureBySlug,
  getLectureStats,
  getLecturesByOrganization,
} from "../repositories/lectureRepository";

const mockGetAuthUserId = vi.mocked(getAuthUserId);
const mockGetLecturesByUser = vi.mocked(getLecturesByUser);
const mockGetLectureById = vi.mocked(getLectureById);
const mockGetLectureBySlug = vi.mocked(getLectureBySlug);
const mockGetLectureStats = vi.mocked(getLectureStats);
const mockGetLecturesByOrganization = vi.mocked(getLecturesByOrganization);

describe("lectures queries", () => {
  let mockCtx: any;
  const testUserId = "user123" as Id<"users">;
  const testLectureId = "lecture123" as Id<"lectures">;

  const createMockLecture = (overrides: any = {}) => ({
    _id: testLectureId,
    title: "プログラミング基礎",
    lectureDate: "2024-12-31",
    lectureTime: "10:00",
    description: "プログラミングの基礎を学びます",
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    surveyUrl: "https://example.com/survey/test_slug",
    surveySlug: "test_slug",
    surveyStatus: "active" as const,
    createdBy: testUserId,
    organizationName: "テスト大学",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  const createMockUser = (overrides: any = {}) => ({
    _id: testUserId,
    email: "test@example.com",
    name: "テストユーザー",
    organizationName: "テスト大学",
    ...overrides,
  });

  beforeEach(() => {
    mockCtx = {
      db: {
        get: vi.fn(),
      },
    };

    // モックをリセット
    vi.clearAllMocks();
  });

  describe("getLectures", () => {
    test("認証済みユーザーがデータを取得できること", async () => {
      const mockLectures = [createMockLecture()];
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLecturesByUser.mockResolvedValue(mockLectures);

      const args = {};
      const result = await getLectures.handler(mockCtx, args);

      expect(mockGetAuthUserId).toHaveBeenCalledWith(mockCtx);
      expect(mockGetLecturesByUser).toHaveBeenCalledWith(
        mockCtx.db,
        testUserId,
        {},
      );
      expect(result).toEqual(mockLectures);
    });

    test("認証されていない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      const args = {};
      await expect(getLectures.handler(mockCtx, args)).rejects.toThrow(
        "認証が必要です",
      );
    });

    test("フィルタパラメータが正しく渡されること", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLecturesByUser.mockResolvedValue([]);

      const args = {
        surveyStatus: "active" as const,
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      };

      await getLectures.handler(mockCtx, args);

      expect(mockGetLecturesByUser).toHaveBeenCalledWith(
        mockCtx.db,
        testUserId,
        {
          surveyStatus: "active",
          dateFrom: "2024-01-01",
          dateTo: "2024-12-31",
        },
      );
    });
  });

  describe("getLecture", () => {
    test("認証済みユーザーが自分の講義を取得できること", async () => {
      const mockLecture = createMockLecture();
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLectureById.mockResolvedValue(mockLecture);

      const args = { lectureId: testLectureId };
      const result = await getLecture.handler(mockCtx, args);

      expect(mockGetLectureById).toHaveBeenCalledWith(
        mockCtx.db,
        testLectureId,
      );
      expect(result).toEqual(mockLecture);
    });

    test("認証されていない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      const args = { lectureId: testLectureId };
      await expect(getLecture.handler(mockCtx, args)).rejects.toThrow(
        "認証が必要です",
      );
    });

    test("存在しない講義の場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLectureById.mockResolvedValue(null);

      const args = { lectureId: testLectureId };
      await expect(getLecture.handler(mockCtx, args)).rejects.toThrow(
        "指定された講義が見つかりません",
      );
    });

    test("他のユーザーの講義にアクセスしようとした場合エラーになること", async () => {
      const otherUserId = "other_user" as Id<"users">;
      const mockLecture = createMockLecture({ createdBy: otherUserId });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLectureById.mockResolvedValue(mockLecture);

      const args = { lectureId: testLectureId };
      await expect(getLecture.handler(mockCtx, args)).rejects.toThrow(
        "この講義にアクセスする権限がありません",
      );
    });
  });

  describe("getLectureBySlugPublic", () => {
    test("公開アンケート用に講義情報が取得できること", async () => {
      const mockLecture = createMockLecture();
      mockGetLectureBySlug.mockResolvedValue(mockLecture);

      const args = { slug: "test_slug" };
      const result = await getLectureBySlugPublic.handler(mockCtx, args);

      expect(mockGetLectureBySlug).toHaveBeenCalledWith(
        mockCtx.db,
        "test_slug",
      );

      // 公開用フィールドのみが含まれることを確認
      expect(result).toEqual({
        _id: mockLecture._id,
        title: mockLecture.title,
        lectureDate: mockLecture.lectureDate,
        lectureTime: mockLecture.lectureTime,
        description: mockLecture.description,
        surveyStatus: mockLecture.surveyStatus,
        organizationName: mockLecture.organizationName,
      });

      // 非公開フィールドが含まれないことを確認
      expect(result).not.toHaveProperty("surveyUrl");
      expect(result).not.toHaveProperty("createdBy");
    });

    test("存在しないスラッグの場合nullが返されること", async () => {
      mockGetLectureBySlug.mockResolvedValue(null);

      const args = { slug: "nonexistent_slug" };
      const result = await getLectureBySlugPublic.handler(mockCtx, args);

      expect(result).toBeNull();
    });
  });

  describe("getLectureStatistics", () => {
    test("認証済みユーザーの統計情報が取得できること", async () => {
      const mockStats = {
        totalLectures: 5,
        activeLectures: 3,
        closedLectures: 2,
      };

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLectureStats.mockResolvedValue(mockStats);

      const result = await getLectureStatistics.handler(mockCtx, {});

      expect(mockGetLectureStats).toHaveBeenCalledWith(mockCtx.db, testUserId);
      expect(result).toEqual(mockStats);
    });

    test("認証されていない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      await expect(getLectureStatistics.handler(mockCtx, {})).rejects.toThrow(
        "認証が必要です",
      );
    });
  });

  describe("getRecentLectures", () => {
    test("最近の講義が制限数で取得できること", async () => {
      const mockLectures = [
        createMockLecture({ _id: "1" }),
        createMockLecture({ _id: "2" }),
        createMockLecture({ _id: "3" }),
        createMockLecture({ _id: "4" }),
        createMockLecture({ _id: "5" }),
        createMockLecture({ _id: "6" }),
      ];

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLecturesByUser.mockResolvedValue(mockLectures);

      const args = { limit: 3 };
      const result = await getRecentLectures.handler(mockCtx, args);

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockLectures.slice(0, 3));
    });

    test("デフォルトで5件取得されること", async () => {
      const mockLectures = Array.from({ length: 10 }, (_, i) =>
        createMockLecture({ _id: `lecture_${i}` }),
      );

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLecturesByUser.mockResolvedValue(mockLectures);

      const result = await getRecentLectures.handler(mockCtx, {});

      expect(result).toHaveLength(5);
    });
  });

  describe("getActiveLectures", () => {
    test("アクティブな講義のみが取得されること", async () => {
      const mockLectures = [createMockLecture({ surveyStatus: "active" })];

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLecturesByUser.mockResolvedValue(mockLectures);

      const result = await getActiveLectures.handler(mockCtx, {});

      expect(mockGetLecturesByUser).toHaveBeenCalledWith(
        mockCtx.db,
        testUserId,
        {
          surveyStatus: "active",
        },
      );
      expect(result).toEqual(mockLectures);
    });
  });

  describe("getClosedLectures", () => {
    test("締切済み講義のみが取得されること", async () => {
      const mockLectures = [createMockLecture({ surveyStatus: "closed" })];

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLecturesByUser.mockResolvedValue(mockLectures);

      const result = await getClosedLectures.handler(mockCtx, {});

      expect(mockGetLecturesByUser).toHaveBeenCalledWith(
        mockCtx.db,
        testUserId,
        {
          surveyStatus: "closed",
        },
      );
      expect(result).toEqual(mockLectures);
    });
  });

  describe("getLectureDetails", () => {
    test("講義詳細情報が取得できること", async () => {
      const mockLecture = createMockLecture();

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLectureById.mockResolvedValue(mockLecture);

      const args = { lectureId: testLectureId };
      const result = await getLectureDetails.handler(mockCtx, args);

      expect(result).toMatchObject({
        ...mockLecture,
        responseCount: 0, // プレースホルダー
      });
    });

    test("権限がない場合エラーになること", async () => {
      const otherUserId = "other_user" as Id<"users">;
      const mockLecture = createMockLecture({ createdBy: otherUserId });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockGetLectureById.mockResolvedValue(mockLecture);

      const args = { lectureId: testLectureId };
      await expect(getLectureDetails.handler(mockCtx, args)).rejects.toThrow(
        "この講義にアクセスする権限がありません",
      );
    });
  });
});
