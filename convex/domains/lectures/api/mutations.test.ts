import { describe, test, expect, vi, beforeEach } from "vitest";
import { Id } from "../../../_generated/dataModel";

// モックを設定
vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(),
}));

vi.mock("../repositories/lectureRepository", () => ({
  createLecture: vi.fn(),
  updateLecture: vi.fn(),
  deleteLecture: vi.fn(),
}));

vi.mock("../services/lectureValidator", () => ({
  validateLectureData: vi.fn(),
  validateLectureUpdate: vi.fn(),
  lectureDataValidator: {},
  lectureUpdateValidator: {},
}));

vi.mock("../services/lectureService", () => ({
  isValidStatusTransition: vi.fn(),
  isClosable: vi.fn(),
}));

// テスト対象のミューテーションをインポート（モック後）
import {
  createNewLecture,
  updateExistingLecture,
  closeLecture,
  removeeLecture,
  duplicateLecture,
  bulkDeleteLectures,
  bulkUpdateLectureStatus,
} from "./mutations";

// モック関数を取得
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  createLecture,
  updateLecture,
  deleteLecture,
} from "../repositories/lectureRepository";
import {
  validateLectureData,
  validateLectureUpdate,
} from "../services/lectureValidator";
import {
  isValidStatusTransition,
  isClosable,
} from "../services/lectureService";

const mockGetAuthUserId = vi.mocked(getAuthUserId);
const mockCreateLecture = vi.mocked(createLecture);
const mockUpdateLecture = vi.mocked(updateLecture);
const mockDeleteLecture = vi.mocked(deleteLecture);
const mockValidateLectureData = vi.mocked(validateLectureData);
const mockValidateLectureUpdate = vi.mocked(validateLectureUpdate);
const mockIsValidStatusTransition = vi.mocked(isValidStatusTransition);
const mockIsClosable = vi.mocked(isClosable);

describe("lectures mutations", () => {
  let mockCtx: any;
  const testUserId = "user123" as Id<"users">;
  const testLectureId = "lecture123" as Id<"lectures">;

  const createMockUser = (overrides: any = {}) => ({
    _id: testUserId,
    email: "test@example.com",
    name: "テストユーザー",
    organizationName: "テスト大学",
    ...overrides,
  });

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

  beforeEach(() => {
    mockCtx = {
      db: {
        get: vi.fn(),
      },
    };

    // モックをリセット
    vi.clearAllMocks();
  });

  describe("createNewLecture", () => {
    const validArgs = {
      title: "プログラミング基礎",
      lectureDate: "2024-12-31",
      lectureTime: "10:00",
      description: "プログラミングの基礎を学びます",
      surveyCloseDate: "2025-01-03",
      surveyCloseTime: "23:59",
      baseUrl: "https://example.com",
    };

    test("正常な講義作成のテスト", async () => {
      const mockUser = createMockUser();
      const mockLecture = createMockLecture();

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(mockUser);
      mockValidateLectureData.mockReturnValue({ isValid: true, errors: [] });
      mockCreateLecture.mockResolvedValue(mockLecture);

      const result = await createNewLecture.handler(mockCtx, validArgs);

      expect(mockValidateLectureData).toHaveBeenCalled();
      expect(mockCreateLecture).toHaveBeenCalledWith(
        mockCtx.db,
        expect.objectContaining({
          title: validArgs.title,
          createdBy: testUserId,
          organizationName: mockUser.organizationName,
          baseUrl: validArgs.baseUrl,
        }),
      );
      expect(result).toEqual(mockLecture);
    });

    test("認証されていない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      await expect(
        createNewLecture.handler(mockCtx, validArgs),
      ).rejects.toThrow("認証が必要です");
    });

    test("ユーザー情報が見つからない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(null);

      await expect(
        createNewLecture.handler(mockCtx, validArgs),
      ).rejects.toThrow("ユーザー情報が見つかりません");
    });

    test("バリデーションエラーの場合例外が投げられること", async () => {
      const mockUser = createMockUser();

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(mockUser);
      mockValidateLectureData.mockReturnValue({
        isValid: false,
        errors: ["タイトルは必須です", "日付形式が正しくありません"],
      });

      await expect(
        createNewLecture.handler(mockCtx, validArgs),
      ).rejects.toThrow(
        "バリデーションエラー: タイトルは必須です, 日付形式が正しくありません",
      );
    });

    test("baseUrlが未指定の場合デフォルト値が使用されること", async () => {
      const mockUser = createMockUser();
      const mockLecture = createMockLecture();
      const argsWithoutBaseUrl = { ...validArgs };
      delete argsWithoutBaseUrl.baseUrl;

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(mockUser);
      mockValidateLectureData.mockReturnValue({ isValid: true, errors: [] });
      mockCreateLecture.mockResolvedValue(mockLecture);

      await createNewLecture.handler(mockCtx, argsWithoutBaseUrl);

      expect(mockCreateLecture).toHaveBeenCalledWith(
        mockCtx.db,
        expect.objectContaining({
          baseUrl: "http://localhost:3000",
        }),
      );
    });
  });

  describe("updateExistingLecture", () => {
    const updateArgs = {
      lectureId: testLectureId,
      title: "更新されたタイトル",
      description: "更新された説明",
    };

    test("正常な講義更新のテスト", async () => {
      const mockLecture = createMockLecture();

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockValidateLectureUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockUpdateLecture.mockResolvedValue(mockLecture);

      const result = await updateExistingLecture.handler(mockCtx, updateArgs);

      expect(mockValidateLectureUpdate).toHaveBeenCalled();
      expect(mockUpdateLecture).toHaveBeenCalledWith(
        mockCtx.db,
        testLectureId,
        expect.objectContaining({
          title: updateArgs.title,
          description: updateArgs.description,
        }),
        testUserId,
      );
      expect(result).toEqual(mockLecture);
    });

    test("認証されていない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      await expect(
        updateExistingLecture.handler(mockCtx, updateArgs),
      ).rejects.toThrow("認証が必要です");
    });

    test("バリデーションエラーの場合例外が投げられること", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockValidateLectureUpdate.mockReturnValue({
        isValid: false,
        errors: ["タイトルが長すぎます"],
      });

      await expect(
        updateExistingLecture.handler(mockCtx, updateArgs),
      ).rejects.toThrow("バリデーションエラー: タイトルが長すぎます");
    });

    test("状態変更時の妥当性チェックが機能すること", async () => {
      const statusUpdateArgs = {
        ...updateArgs,
        surveyStatus: "closed" as const,
      };
      const existingLecture = createMockLecture({ surveyStatus: "active" });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockValidateLectureUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockCtx.db.get.mockResolvedValue(existingLecture);
      mockIsValidStatusTransition.mockReturnValue(true);
      mockIsClosable.mockReturnValue(true);
      mockUpdateLecture.mockResolvedValue(existingLecture);

      await updateExistingLecture.handler(mockCtx, statusUpdateArgs);

      expect(mockIsValidStatusTransition).toHaveBeenCalledWith(
        "active",
        "closed",
      );
      expect(mockIsClosable).toHaveBeenCalled();
    });

    test("無効な状態遷移の場合エラーになること", async () => {
      const statusUpdateArgs = {
        ...updateArgs,
        surveyStatus: "active" as const,
      };
      const existingLecture = createMockLecture({ surveyStatus: "closed" });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockValidateLectureUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockCtx.db.get.mockResolvedValue(existingLecture);
      mockIsValidStatusTransition.mockReturnValue(false);

      await expect(
        updateExistingLecture.handler(mockCtx, statusUpdateArgs),
      ).rejects.toThrow("無効な状態遷移です");
    });
  });

  describe("closeLecture", () => {
    const closeArgs = { lectureId: testLectureId };

    test("正常な講義締切のテスト", async () => {
      const existingLecture = createMockLecture({ surveyStatus: "active" });
      const closedLecture = createMockLecture({ surveyStatus: "closed" });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(existingLecture);
      mockIsClosable.mockReturnValue(true);
      mockUpdateLecture.mockResolvedValue(closedLecture);

      const result = await closeLecture.handler(mockCtx, closeArgs);

      expect(mockIsClosable).toHaveBeenCalledWith(
        "active",
        existingLecture.surveyCloseDate,
        existingLecture.surveyCloseTime,
      );
      expect(mockUpdateLecture).toHaveBeenCalledWith(
        mockCtx.db,
        testLectureId,
        { surveyStatus: "closed" },
        testUserId,
      );
      expect(result).toEqual(closedLecture);
    });

    test("認証されていない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      await expect(closeLecture.handler(mockCtx, closeArgs)).rejects.toThrow(
        "認証が必要です",
      );
    });

    test("講義が見つからない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(null);

      await expect(closeLecture.handler(mockCtx, closeArgs)).rejects.toThrow(
        "指定された講義が見つかりません",
      );
    });

    test("権限がない場合エラーになること", async () => {
      const otherUserId = "other_user" as Id<"users">;
      const existingLecture = createMockLecture({ createdBy: otherUserId });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(existingLecture);

      await expect(closeLecture.handler(mockCtx, closeArgs)).rejects.toThrow(
        "この講義を締切る権限がありません",
      );
    });

    test("締切不可能な状態の場合エラーになること", async () => {
      const existingLecture = createMockLecture({ surveyStatus: "active" });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get.mockResolvedValue(existingLecture);
      mockIsClosable.mockReturnValue(false);

      await expect(closeLecture.handler(mockCtx, closeArgs)).rejects.toThrow(
        "現在の状況では講義を締切ることができません",
      );
    });
  });

  describe("removeeLecture", () => {
    const deleteArgs = { lectureId: testLectureId };

    test("正常な講義削除のテスト", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockDeleteLecture.mockResolvedValue(undefined);

      const result = await removeeLecture.handler(mockCtx, deleteArgs);

      expect(mockDeleteLecture).toHaveBeenCalledWith(
        mockCtx.db,
        testLectureId,
        testUserId,
      );
      expect(result).toEqual({ success: true });
    });

    test("認証されていない場合エラーになること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      await expect(removeeLecture.handler(mockCtx, deleteArgs)).rejects.toThrow(
        "認証が必要です",
      );
    });
  });

  describe("duplicateLecture", () => {
    const duplicateArgs = {
      lectureId: testLectureId,
      newTitle: "複製された講義",
      newLectureDate: "2024-04-01",
    };

    test("正常な講義複製のテスト", async () => {
      const mockUser = createMockUser();
      const originalLecture = createMockLecture();
      const duplicatedLecture = createMockLecture({
        _id: "new_lecture_id",
        title: "複製された講義",
      });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(originalLecture);
      mockValidateLectureData.mockReturnValue({ isValid: true, errors: [] });
      mockCreateLecture.mockResolvedValue(duplicatedLecture);

      const result = await duplicateLecture.handler(mockCtx, duplicateArgs);

      expect(mockValidateLectureData).toHaveBeenCalled();
      expect(mockCreateLecture).toHaveBeenCalledWith(
        mockCtx.db,
        expect.objectContaining({
          title: "複製された講義",
          lectureDate: "2024-04-01",
        }),
      );
      expect(result).toEqual(duplicatedLecture);
    });

    test("複製元が見つからない場合エラーになること", async () => {
      const mockUser = createMockUser();

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      await expect(
        duplicateLecture.handler(mockCtx, duplicateArgs),
      ).rejects.toThrow("複製元の講義が見つかりません");
    });

    test("複製権限がない場合エラーになること", async () => {
      const mockUser = createMockUser();
      const otherUserId = "other_user" as Id<"users">;
      const originalLecture = createMockLecture({ createdBy: otherUserId });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockCtx.db.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(originalLecture);

      await expect(
        duplicateLecture.handler(mockCtx, duplicateArgs),
      ).rejects.toThrow("この講義を複製する権限がありません");
    });
  });

  describe("bulkDeleteLectures", () => {
    const bulkDeleteArgs = {
      lectureIds: [testLectureId, "lecture456" as Id<"lectures">],
    };

    test("複数講義の一括削除が成功すること", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockDeleteLecture.mockResolvedValue(undefined);

      const result = await bulkDeleteLectures.handler(mockCtx, bulkDeleteArgs);

      expect(mockDeleteLecture).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        successCount: 2,
        errorCount: 0,
        errors: [],
      });
    });

    test("一部削除失敗の場合、エラー情報が含まれること", async () => {
      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockDeleteLecture
        .mockResolvedValueOnce(undefined) // 1つ目は成功
        .mockRejectedValueOnce(new Error("削除権限がありません")); // 2つ目は失敗

      const result = await bulkDeleteLectures.handler(mockCtx, bulkDeleteArgs);

      expect(result).toEqual({
        successCount: 1,
        errorCount: 1,
        errors: [
          {
            lectureId: "lecture456",
            error: "削除権限がありません",
          },
        ],
      });
    });
  });

  describe("bulkUpdateLectureStatus", () => {
    const bulkUpdateArgs = {
      lectureIds: [testLectureId, "lecture456" as Id<"lectures">],
      surveyStatus: "closed" as const,
    };

    test("複数講義の状態一括更新が成功すること", async () => {
      const updatedLecture1 = createMockLecture({ surveyStatus: "closed" });
      const updatedLecture2 = createMockLecture({
        _id: "lecture456",
        surveyStatus: "closed",
      });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockUpdateLecture
        .mockResolvedValueOnce(updatedLecture1)
        .mockResolvedValueOnce(updatedLecture2);

      const result = await bulkUpdateLectureStatus.handler(
        mockCtx,
        bulkUpdateArgs,
      );

      expect(mockUpdateLecture).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        successCount: 2,
        errorCount: 0,
        updatedLectures: [
          { lectureId: testLectureId, lecture: updatedLecture1 },
          { lectureId: "lecture456", lecture: updatedLecture2 },
        ],
        errors: [],
      });
    });

    test("一部更新失敗の場合、エラー情報が含まれること", async () => {
      const updatedLecture = createMockLecture({ surveyStatus: "closed" });

      mockGetAuthUserId.mockResolvedValue(testUserId);
      mockUpdateLecture
        .mockResolvedValueOnce(updatedLecture) // 1つ目は成功
        .mockRejectedValueOnce(new Error("更新権限がありません")); // 2つ目は失敗

      const result = await bulkUpdateLectureStatus.handler(
        mockCtx,
        bulkUpdateArgs,
      );

      expect(result).toEqual({
        successCount: 1,
        errorCount: 1,
        updatedLectures: [
          { lectureId: testLectureId, lecture: updatedLecture },
        ],
        errors: [
          {
            lectureId: "lecture456",
            error: "更新権限がありません",
          },
        ],
      });
    });
  });
});
