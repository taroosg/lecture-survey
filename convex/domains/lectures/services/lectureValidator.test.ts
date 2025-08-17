import { describe, test, expect } from "vitest";
import {
  validateLectureData,
  validateLectureUpdate,
  isValidDateFormat,
  isValidTimeFormat,
  isCloseDateTimeAfterLectureDateTime,
  type LectureData,
  type LectureUpdateData,
} from "./lectureValidator";

describe("lectureValidator", () => {
  describe("isValidDateFormat", () => {
    test("正しい日付形式でtrueが返されること", () => {
      expect(isValidDateFormat("2024-03-15")).toBe(true);
      expect(isValidDateFormat("2024-12-31")).toBe(true);
      expect(isValidDateFormat("2024-01-01")).toBe(true);
    });

    test("不正な日付形式でfalseが返されること", () => {
      expect(isValidDateFormat("2024/03/15")).toBe(false);
      expect(isValidDateFormat("2024-3-15")).toBe(false);
      expect(isValidDateFormat("24-03-15")).toBe(false);
      expect(isValidDateFormat("2024-13-01")).toBe(false);
      expect(isValidDateFormat("2024-02-30")).toBe(false);
      expect(isValidDateFormat("invalid")).toBe(false);
      expect(isValidDateFormat("")).toBe(false);
    });
  });

  describe("isValidTimeFormat", () => {
    test("正しい時刻形式でtrueが返されること", () => {
      expect(isValidTimeFormat("09:30")).toBe(true);
      expect(isValidTimeFormat("23:59")).toBe(true);
      expect(isValidTimeFormat("00:00")).toBe(true);
      expect(isValidTimeFormat("12:00")).toBe(true);
    });

    test("不正な時刻形式でfalseが返されること", () => {
      expect(isValidTimeFormat("9:30")).toBe(true); // 一桁も許可
      expect(isValidTimeFormat("24:00")).toBe(false);
      expect(isValidTimeFormat("12:60")).toBe(false);
      expect(isValidTimeFormat("ab:cd")).toBe(false);
      expect(isValidTimeFormat("12")).toBe(false);
      expect(isValidTimeFormat("")).toBe(false);
    });
  });

  describe("isCloseDateTimeAfterLectureDateTime", () => {
    test("締切日時が講義日時より後の場合trueが返されること", () => {
      expect(
        isCloseDateTimeAfterLectureDateTime(
          "2024-03-15",
          "10:00",
          "2024-03-15",
          "12:00",
        ),
      ).toBe(true);

      expect(
        isCloseDateTimeAfterLectureDateTime(
          "2024-03-15",
          "10:00",
          "2024-03-16",
          "10:00",
        ),
      ).toBe(true);
    });

    test("締切日時が講義日時より前または同じ場合falseが返されること", () => {
      expect(
        isCloseDateTimeAfterLectureDateTime(
          "2024-03-15",
          "10:00",
          "2024-03-15",
          "09:00",
        ),
      ).toBe(false);

      expect(
        isCloseDateTimeAfterLectureDateTime(
          "2024-03-15",
          "10:00",
          "2024-03-14",
          "10:00",
        ),
      ).toBe(false);

      expect(
        isCloseDateTimeAfterLectureDateTime(
          "2024-03-15",
          "10:00",
          "2024-03-15",
          "10:00",
        ),
      ).toBe(false);
    });
  });

  describe("validateLectureData", () => {
    const validLectureData: LectureData = {
      title: "プログラミング基礎",
      lectureDate: "2025-12-31", // 未来日
      lectureTime: "10:00",
      description: "プログラミングの基礎を学びます",
      surveyCloseDate: "2026-01-03",
      surveyCloseTime: "23:59",
    };

    test("正常な講義データでバリデーションが成功すること", () => {
      const result = validateLectureData(validLectureData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("必須フィールド不足（title）でエラーになること", () => {
      const invalidData = { ...validLectureData, title: "" };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("講義タイトルは必須です");
    });

    test("必須フィールド不足（lectureDate）でエラーになること", () => {
      const invalidData = { ...validLectureData, lectureDate: "" };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("講義日は必須です");
    });

    test("必須フィールド不足（lectureTime）でエラーになること", () => {
      const invalidData = { ...validLectureData, lectureTime: "" };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("講義時刻は必須です");
    });

    test("不正な日付形式でエラーになること", () => {
      const invalidData = { ...validLectureData, lectureDate: "2024/03/15" };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "講義日は正しい日付形式（YYYY-MM-DD）で入力してください",
      );
    });

    test("不正な時刻形式でエラーになること", () => {
      const invalidData = { ...validLectureData, lectureTime: "25:00" };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "講義時刻は正しい時刻形式（HH:MM）で入力してください",
      );
    });

    test("締切日時が講義日時より前の場合エラーになること", () => {
      const invalidData = {
        ...validLectureData,
        lectureDate: "2025-12-31",
        lectureTime: "10:00",
        surveyCloseDate: "2025-12-31",
        surveyCloseTime: "09:00",
      };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "アンケート締切日時は講義日時より後に設定してください",
      );
    });

    test("タイトルが100文字を超える場合エラーになること", () => {
      const longTitle = "a".repeat(101);
      const invalidData = { ...validLectureData, title: longTitle };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "講義タイトルは100文字以下で入力してください",
      );
    });

    test("説明が500文字を超える場合エラーになること", () => {
      const longDescription = "a".repeat(501);
      const invalidData = { ...validLectureData, description: longDescription };
      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "講義説明は500文字以下で入力してください",
      );
    });
  });

  describe("validateLectureUpdate", () => {
    test("部分更新データのバリデーションが成功すること", () => {
      const updateData: LectureUpdateData = {
        title: "更新されたタイトル",
        description: "更新された説明",
      };
      const result = validateLectureUpdate(updateData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("空のオブジェクトでバリデーションが成功すること", () => {
      const result = validateLectureUpdate({});
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("不正なタイトル（空文字）でエラーになること", () => {
      const updateData: LectureUpdateData = { title: "" };
      const result = validateLectureUpdate(updateData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("講義タイトルは必須です");
    });

    test("不正な日付形式でエラーになること", () => {
      const updateData: LectureUpdateData = { lectureDate: "2024/03/15" };
      const result = validateLectureUpdate(updateData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "講義日は正しい日付形式（YYYY-MM-DD）で入力してください",
      );
    });

    test("不正な時刻形式でエラーになること", () => {
      const updateData: LectureUpdateData = { lectureTime: "25:00" };
      const result = validateLectureUpdate(updateData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "講義時刻は正しい時刻形式（HH:MM）で入力してください",
      );
    });

    test("状態変更の妥当性チェックが機能すること", () => {
      const updateData: LectureUpdateData = {
        surveyStatus: "invalid" as any,
      };
      const result = validateLectureUpdate(updateData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "アンケート状態は'active'または'closed'である必要があります",
      );
    });

    test("正常な状態変更でバリデーションが成功すること", () => {
      const updateData1: LectureUpdateData = { surveyStatus: "active" };
      const updateData2: LectureUpdateData = { surveyStatus: "closed" };

      expect(validateLectureUpdate(updateData1).isValid).toBe(true);
      expect(validateLectureUpdate(updateData2).isValid).toBe(true);
    });
  });

  describe("エラーメッセージの内容確認", () => {
    test("複数のエラーが同時に発生した場合、すべてのエラーメッセージが含まれること", () => {
      const invalidData: LectureData = {
        title: "",
        lectureDate: "invalid-date",
        lectureTime: "25:00",
        surveyCloseDate: "",
        surveyCloseTime: "invalid-time",
      };

      const result = validateLectureData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain("講義タイトルは必須です");
      expect(result.errors).toContain(
        "講義日は正しい日付形式（YYYY-MM-DD）で入力してください",
      );
      expect(result.errors).toContain(
        "講義時刻は正しい時刻形式（HH:MM）で入力してください",
      );
    });
  });
});
