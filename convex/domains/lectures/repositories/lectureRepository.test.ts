import { describe, test, expect, vi, beforeEach } from "vitest";
import { Id } from "../../../_generated/dataModel";
import {
  createLecture,
  updateLecture,
  getLectureBySlug,
  getLectureById,
  getLecturesByUser,
  deleteLecture,
  getLectureStats,
  type CreateLectureData,
  type UpdateLectureData,
  type LectureData,
} from "./lectureRepository";

// モックの型定義（any型でTypeScriptエラーを回避）
interface MockDb {
  query: any;
  insert: any;
  patch: any;
  delete: any;
  get: any;
}

interface MockQuery {
  withIndex: any;
  unique: any;
  collect: any;
}

describe("lectureRepository", () => {
  let mockDb: MockDb;
  let mockQuery: MockQuery;

  const testUserId = "user123" as Id<"users">;
  const testLectureId = "lecture123" as Id<"lectures">;

  const createMockLecture = (
    overrides: Partial<LectureData> = {},
  ): LectureData => ({
    _id: testLectureId,
    title: "プログラミング基礎",
    lectureDate: "2024-12-31",
    lectureTime: "10:00",
    description: "プログラミングの基礎を学びます",
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    surveyUrl: "https://example.com/survey/test_slug",
    surveySlug: "test_slug",
    surveyStatus: "active",
    createdBy: testUserId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  beforeEach(() => {
    mockQuery = {
      withIndex: vi.fn().mockReturnThis(),
      unique: vi.fn(),
      collect: vi.fn(),
    };

    mockDb = {
      query: vi.fn().mockReturnValue(mockQuery),
      insert: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
    };
  });

  describe("createLecture", () => {
    const validCreateData: CreateLectureData = {
      title: "プログラミング基礎",
      lectureDate: "2024-12-31",
      lectureTime: "10:00",
      description: "プログラミングの基礎を学びます",
      surveyCloseDate: "2025-01-03",
      surveyCloseTime: "23:59",
      createdBy: testUserId,
      baseUrl: "https://example.com",
    };

    test("正常な講義作成のテスト", async () => {
      const expectedLecture = createMockLecture();

      mockQuery.unique.mockResolvedValue(null); // スラッグ重複なし
      mockDb.insert.mockResolvedValue(testLectureId);
      mockDb.get.mockResolvedValue(expectedLecture);

      const result = await createLecture(mockDb as any, validCreateData);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.get).toHaveBeenCalledWith(testLectureId);
      expect(result).toEqual(expectedLecture);
      expect(result.surveyStatus).toBe("active");
    });

    test("重複slug検出のテスト", async () => {
      const existingLecture = createMockLecture();

      // 最初の呼び出しで重複あり、2回目で重複なし
      mockQuery.unique
        .mockResolvedValueOnce(existingLecture)
        .mockResolvedValueOnce(null);

      mockDb.insert.mockResolvedValue(testLectureId);
      mockDb.get.mockResolvedValue(createMockLecture());

      const result = await createLecture(mockDb as any, validCreateData);

      // スラッグ重複チェックが2回実行されることを確認
      expect(mockQuery.unique).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    test("スラッグ生成の最大試行回数を超えた場合エラーになること", async () => {
      const existingLecture = createMockLecture();

      // 常に重複ありとして返す
      mockQuery.unique.mockResolvedValue(existingLecture);

      await expect(
        createLecture(mockDb as any, validCreateData),
      ).rejects.toThrow(
        "スラッグの生成に失敗しました。時間をおいて再試行してください。",
      );
    });

    test("講義取得に失敗した場合エラーになること", async () => {
      mockQuery.unique.mockResolvedValue(null);
      mockDb.insert.mockResolvedValue(testLectureId);
      mockDb.get.mockResolvedValue(null); // 取得失敗

      await expect(
        createLecture(mockDb as any, validCreateData),
      ).rejects.toThrow("講義の作成に失敗しました");
    });
  });

  describe("updateLecture", () => {
    const updateData: UpdateLectureData = {
      title: "更新されたタイトル",
      description: "更新された説明",
    };

    test("正常な講義更新のテスト", async () => {
      const existingLecture = createMockLecture();
      const updatedLecture = createMockLecture({
        title: "更新されたタイトル",
        description: "更新された説明",
      });

      mockDb.get
        .mockResolvedValueOnce(existingLecture) // 更新前の取得
        .mockResolvedValueOnce(updatedLecture); // 更新後の取得

      const result = await updateLecture(
        mockDb as any,
        testLectureId,
        updateData,
        testUserId,
      );

      expect(mockDb.patch).toHaveBeenCalledWith(
        testLectureId,
        expect.objectContaining({
          title: "更新されたタイトル",
          description: "更新された説明",
          updatedAt: expect.any(Number),
        }),
      );
      expect(result).toEqual(updatedLecture);
    });

    test("存在しない講義更新でエラーになること", async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(
        updateLecture(mockDb as any, testLectureId, updateData, testUserId),
      ).rejects.toThrow("指定された講義が見つかりません");
    });

    test("権限がない場合エラーになること", async () => {
      const existingLecture = createMockLecture({
        createdBy: "other_user" as Id<"users">,
      });
      mockDb.get.mockResolvedValue(existingLecture);

      await expect(
        updateLecture(mockDb as any, testLectureId, updateData, testUserId),
      ).rejects.toThrow("この講義を編集する権限がありません");
    });

    test("状態をclosedに変更する際にclosedAtが設定されること", async () => {
      const existingLecture = createMockLecture({ surveyStatus: "active" });
      const updateDataWithStatus: UpdateLectureData = {
        surveyStatus: "closed",
      };

      mockDb.get
        .mockResolvedValueOnce(existingLecture)
        .mockResolvedValueOnce(createMockLecture({ surveyStatus: "closed" }));

      await updateLecture(
        mockDb as any,
        testLectureId,
        updateDataWithStatus,
        testUserId,
      );

      expect(mockDb.patch).toHaveBeenCalledWith(
        testLectureId,
        expect.objectContaining({
          surveyStatus: "closed",
          closedAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      );
    });
  });

  describe("getLectureBySlug", () => {
    test("存在する講義の取得テスト", async () => {
      const expectedLecture = createMockLecture();
      mockQuery.unique.mockResolvedValue(expectedLecture);

      const result = await getLectureBySlug(mockDb as any, "test_slug");

      expect(mockDb.query).toHaveBeenCalledWith("lectures");
      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        "by_survey_slug",
        expect.any(Function),
      );
      expect(result).toEqual(expectedLecture);
    });

    test("存在しない講義でnullが返されるテスト", async () => {
      mockQuery.unique.mockResolvedValue(null);

      const result = await getLectureBySlug(mockDb as any, "nonexistent_slug");

      expect(result).toBeNull();
    });
  });

  describe("getLectureById", () => {
    test("存在する講義の取得テスト", async () => {
      const expectedLecture = createMockLecture();
      mockDb.get.mockResolvedValue(expectedLecture);

      const result = await getLectureById(mockDb as any, testLectureId);

      expect(mockDb.get).toHaveBeenCalledWith(testLectureId);
      expect(result).toEqual(expectedLecture);
    });

    test("存在しない講義でnullが返されるテスト", async () => {
      mockDb.get.mockResolvedValue(null);

      const result = await getLectureById(mockDb as any, testLectureId);

      expect(result).toBeNull();
    });
  });

  describe("getLecturesByUser", () => {
    test("ユーザー別の講義一覧取得テスト", async () => {
      const lectures = [
        createMockLecture({
          lectureDate: "2024-03-15",
          lectureTime: "10:00",
        }),
        createMockLecture({
          lectureDate: "2024-03-16",
          lectureTime: "14:00",
        }),
      ];
      mockQuery.collect.mockResolvedValue(lectures);

      const result = await getLecturesByUser(mockDb as any, testUserId);

      expect(mockDb.query).toHaveBeenCalledWith("lectures");
      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        "by_creator",
        expect.any(Function),
      );
      expect(result).toHaveLength(2);
    });

    test("ソート順の確認テスト（新しい順）", async () => {
      const lectures = [
        createMockLecture({
          lectureDate: "2024-03-15",
          lectureTime: "10:00",
        }),
        createMockLecture({
          lectureDate: "2024-03-16",
          lectureTime: "14:00",
        }),
        createMockLecture({
          lectureDate: "2024-03-16",
          lectureTime: "10:00",
        }),
      ];
      mockQuery.collect.mockResolvedValue(lectures);

      const result = await getLecturesByUser(mockDb as any, testUserId);

      // 新しい順にソートされていることを確認
      expect(result[0].lectureDate).toBe("2024-03-16");
      expect(result[0].lectureTime).toBe("14:00");
      expect(result[1].lectureDate).toBe("2024-03-16");
      expect(result[1].lectureTime).toBe("10:00");
      expect(result[2].lectureDate).toBe("2024-03-15");
    });

    test("状態フィルタリングのテスト", async () => {
      const lectures = [
        createMockLecture({ surveyStatus: "active" }),
        createMockLecture({ surveyStatus: "closed" }),
      ];
      mockQuery.collect.mockResolvedValue(lectures);

      const result = await getLecturesByUser(mockDb as any, testUserId, {
        surveyStatus: "active",
      });

      expect(result).toHaveLength(1);
      expect(result[0].surveyStatus).toBe("active");
    });
  });

  describe("deleteLecture", () => {
    test("正常な講義削除のテスト", async () => {
      const existingLecture = createMockLecture();
      mockDb.get.mockResolvedValue(existingLecture);

      await deleteLecture(mockDb as any, testLectureId, testUserId);

      expect(mockDb.delete).toHaveBeenCalledWith(testLectureId);
    });

    test("存在しない講義削除でエラーになること", async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(
        deleteLecture(mockDb as any, testLectureId, testUserId),
      ).rejects.toThrow("指定された講義が見つかりません");
    });

    test("権限がない場合エラーになること", async () => {
      const existingLecture = createMockLecture({
        createdBy: "other_user" as Id<"users">,
      });
      mockDb.get.mockResolvedValue(existingLecture);

      await expect(
        deleteLecture(mockDb as any, testLectureId, testUserId),
      ).rejects.toThrow("この講義を削除する権限がありません");
    });
  });

  describe("getLectureStats", () => {
    test("講義統計情報の取得テスト", async () => {
      const lectures = [
        createMockLecture({ surveyStatus: "active" }),
        createMockLecture({ surveyStatus: "active" }),
        createMockLecture({ surveyStatus: "closed" }),
      ];
      mockQuery.collect.mockResolvedValue(lectures);

      const result = await getLectureStats(mockDb as any, testUserId);

      expect(result).toEqual({
        totalLectures: 3,
        activeLectures: 2,
        closedLectures: 1,
      });
    });

    test("講義が0件の場合の統計情報テスト", async () => {
      mockQuery.collect.mockResolvedValue([]);

      const result = await getLectureStats(mockDb as any, testUserId);

      expect(result).toEqual({
        totalLectures: 0,
        activeLectures: 0,
        closedLectures: 0,
      });
    });
  });
});
