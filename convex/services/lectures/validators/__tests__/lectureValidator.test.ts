/**
 * lectureValidator.ts のテスト
 * 講義バリデーション機能のテスト
 */

import { describe, test, expect } from "vitest";
import {
  validateLectureData,
  validateLectureUpdate,
  isValidDateFormat,
  isValidTimeFormat,
  isCloseDateTimeAfterLectureDateTime,
  type LectureData,
  type LectureUpdateData,
} from "../lectureValidator";

// テスト用データ
const validLectureData: LectureData = {
  title: "テスト講義",
  lectureDate: "2025-12-01",
  lectureTime: "10:00",
  description: "テスト講義の説明",
  surveyCloseDate: "2025-12-02",
  surveyCloseTime: "18:00",
};

const validUpdateData: LectureUpdateData = {
  title: "更新されたタイトル",
  description: "更新された説明",
};

describe("isValidDateFormat", () => {
  test("有効な日付形式でtrueが返されること", () => {
    const validDates = [
      "2024-01-01",
      "2024-12-31",
      "2023-02-28",
      "2024-02-29", // うるう年
    ];

    validDates.forEach((date) => {
      expect(isValidDateFormat(date)).toBe(true);
    });
  });

  test("無効な日付形式でfalseが返されること", () => {
    const invalidDates = [
      "2024/01/01", // スラッシュ区切り
      "2024-1-1", // ゼロパディングなし
      "24-01-01", // 年が2桁
      "2024-13-01", // 存在しない月
      "2024-02-30", // 存在しない日
      "invalid", // 文字列
      "", // 空文字
    ];

    invalidDates.forEach((date) => {
      expect(isValidDateFormat(date)).toBe(false);
    });
  });
});

describe("isValidTimeFormat", () => {
  test("有効な時刻形式でtrueが返されること", () => {
    const validTimes = [
      "00:00",
      "12:30",
      "23:59",
      "9:00", // 1桁の時間
      "09:05", // ゼロパディング
    ];

    validTimes.forEach((time) => {
      expect(isValidTimeFormat(time)).toBe(true);
    });
  });

  test("無効な時刻形式でfalseが返されること", () => {
    const invalidTimes = [
      "24:00", // 24時間
      "12:60", // 60分
      "12", // 分なし
      "12:5", // 分が1桁（ゼロパディングなし）
      "invalid", // 文字列
      "", // 空文字
    ];

    invalidTimes.forEach((time) => {
      expect(isValidTimeFormat(time)).toBe(false);
    });
  });
});

describe("isCloseDateTimeAfterLectureDateTime", () => {
  test("締切日時が講義日時より後の場合、trueが返されること", () => {
    const result = isCloseDateTimeAfterLectureDateTime(
      "2024-12-01",
      "10:00",
      "2024-12-01",
      "15:00",
    );

    expect(result).toBe(true);
  });

  test("締切日時が講義日時より前の場合、falseが返されること", () => {
    const result = isCloseDateTimeAfterLectureDateTime(
      "2024-12-01",
      "15:00",
      "2024-12-01",
      "10:00",
    );

    expect(result).toBe(false);
  });

  test("締切日時と講義日時が同じ場合、falseが返されること", () => {
    const result = isCloseDateTimeAfterLectureDateTime(
      "2024-12-01",
      "10:00",
      "2024-12-01",
      "10:00",
    );

    expect(result).toBe(false);
  });

  test("異なる日付で比較が正しく行われること", () => {
    const result = isCloseDateTimeAfterLectureDateTime(
      "2024-12-01",
      "15:00",
      "2024-12-02",
      "09:00",
    );

    expect(result).toBe(true);
  });
});

describe("validateLectureData", () => {
  test("正常な講義データでバリデーションが成功すること", () => {
    const result = validateLectureData(validLectureData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("タイトルが空の場合、エラーが返されること", () => {
    const invalidData = { ...validLectureData, title: "" };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("講義タイトルは必須です");
  });

  test("タイトルが長すぎる場合、エラーが返されること", () => {
    const invalidData = { ...validLectureData, title: "あ".repeat(101) };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "講義タイトルは100文字以下で入力してください",
    );
  });

  test("講義日が無効な形式の場合、エラーが返されること", () => {
    const invalidData = { ...validLectureData, lectureDate: "invalid-date" };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "講義日は正しい日付形式（YYYY-MM-DD）で入力してください",
    );
  });

  test("講義時刻が無効な形式の場合、エラーが返されること", () => {
    const invalidData = { ...validLectureData, lectureTime: "25:00" };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "講義時刻は正しい時刻形式（HH:MM）で入力してください",
    );
  });

  test("説明が長すぎる場合、エラーが返されること", () => {
    const invalidData = {
      ...validLectureData,
      description: "あ".repeat(501),
    };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("講義説明は500文字以下で入力してください");
  });

  test("アンケート締切日が無効な形式の場合、エラーが返されること", () => {
    const invalidData = {
      ...validLectureData,
      surveyCloseDate: "invalid-date",
    };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "アンケート締切日は正しい日付形式（YYYY-MM-DD）で入力してください",
    );
  });

  test("アンケート締切時刻が無効な形式の場合、エラーが返されること", () => {
    const invalidData = {
      ...validLectureData,
      surveyCloseTime: "25:00",
    };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "アンケート締切時刻は正しい時刻形式（HH:MM）で入力してください",
    );
  });

  test("締切日時が講義日時より前の場合、エラーが返されること", () => {
    const invalidData = {
      ...validLectureData,
      surveyCloseDate: "2024-12-01",
      surveyCloseTime: "09:00", // 講義時刻(10:00)より前
    };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "アンケート締切日時は講義日時より後に設定してください",
    );
  });

  test("複数のエラーが同時に発生した場合、すべてのエラーが返されること", () => {
    const invalidData = {
      title: "",
      lectureDate: "invalid",
      lectureTime: "25:00",
      description: "あ".repeat(501),
      surveyCloseDate: "invalid",
      surveyCloseTime: "25:00",
    };
    const result = validateLectureData(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe("validateLectureUpdate", () => {
  test("正常な更新データでバリデーションが成功すること", () => {
    const result = validateLectureUpdate(validUpdateData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("空のオブジェクトでバリデーションが成功すること", () => {
    const result = validateLectureUpdate({});

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("タイトルが空文字の場合、エラーが返されること", () => {
    const updateData = { title: "" };
    const result = validateLectureUpdate(updateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("講義タイトルは必須です");
  });

  test("タイトルが長すぎる場合、エラーが返されること", () => {
    const updateData = { title: "あ".repeat(101) };
    const result = validateLectureUpdate(updateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "講義タイトルは100文字以下で入力してください",
    );
  });

  test("無効な講義日が指定された場合、エラーが返されること", () => {
    const updateData = { lectureDate: "invalid-date" };
    const result = validateLectureUpdate(updateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "講義日は正しい日付形式（YYYY-MM-DD）で入力してください",
    );
  });

  test("無効な講義時刻が指定された場合、エラーが返されること", () => {
    const updateData = { lectureTime: "25:00" };
    const result = validateLectureUpdate(updateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "講義時刻は正しい時刻形式（HH:MM）で入力してください",
    );
  });

  test("説明が長すぎる場合、エラーが返されること", () => {
    const updateData = { description: "あ".repeat(501) };
    const result = validateLectureUpdate(updateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("講義説明は500文字以下で入力してください");
  });

  test("無効なアンケート状態が指定された場合、エラーが返されること", () => {
    const updateData = { surveyStatus: "invalid" as any };
    const result = validateLectureUpdate(updateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "アンケート状態は'active'または'closed'である必要があります",
    );
  });

  test("有効な値が部分的に指定された場合、バリデーションが成功すること", () => {
    const updateData1 = { title: "新しいタイトル" };
    const updateData2 = { lectureDate: "2024-12-15" };

    expect(validateLectureUpdate(updateData1).isValid).toBe(true);
    expect(validateLectureUpdate(updateData2).isValid).toBe(true);
  });

  test("undefinedが明示的に指定された場合、バリデーションが成功すること", () => {
    const updateData = {
      title: undefined,
      lectureDate: undefined,
      description: undefined,
    };
    const result = validateLectureUpdate(updateData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
