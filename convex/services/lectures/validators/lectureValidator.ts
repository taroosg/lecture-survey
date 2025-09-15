/**
 * 講義データのバリデーション機能
 * 純粋関数として実装し、講義データの検証を行う
 */

import { v } from "convex/values";

/**
 * 講義データのバリデーション型定義（Convex validator）
 */
export const lectureDataValidator = v.object({
  title: v.string(),
  lectureDate: v.string(), // YYYY-MM-DD
  lectureTime: v.string(), // HH:MM
  description: v.optional(v.string()),
  surveyCloseDate: v.string(), // YYYY-MM-DD
  surveyCloseTime: v.string(), // HH:MM
});

/**
 * 講義更新データのバリデーション型定義（Convex validator）
 */
export const lectureUpdateValidator = v.object({
  title: v.optional(v.string()),
  lectureDate: v.optional(v.string()),
  lectureTime: v.optional(v.string()),
  description: v.optional(v.string()),
  surveyCloseDate: v.optional(v.string()),
  surveyCloseTime: v.optional(v.string()),
  surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
});

/**
 * バリデーション結果の型定義
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * 講義データの型定義
 */
export type LectureData = {
  title: string;
  lectureDate: string;
  lectureTime: string;
  description?: string;
  surveyCloseDate: string;
  surveyCloseTime: string;
};

/**
 * 講義更新データの型定義
 */
export type LectureUpdateData = {
  title?: string;
  lectureDate?: string;
  lectureTime?: string;
  description?: string;
  surveyCloseDate?: string;
  surveyCloseTime?: string;
  surveyStatus?: "active" | "closed";
};

/**
 * 日付文字列がYYYY-MM-DD形式で有効かチェック（純粋関数）
 * @param dateString - チェック対象の日付文字列
 * @returns 有効な日付形式かどうか
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
};

/**
 * 時刻文字列がHH:MM形式で有効かチェック（純粋関数）
 * @param timeString - チェック対象の時刻文字列
 * @returns 有効な時刻形式かどうか
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * 締切日時が講義日時より後かチェック（純粋関数）
 * @param lectureDate - 講義日
 * @param lectureTime - 講義時刻
 * @param closeDate - 締切日
 * @param closeTime - 締切時刻
 * @returns 締切日時が講義日時より後かどうか
 */
export const isCloseDateTimeAfterLectureDateTime = (
  lectureDate: string,
  lectureTime: string,
  closeDate: string,
  closeTime: string,
): boolean => {
  const lectureDateTime = new Date(`${lectureDate}T${lectureTime}:00`);
  const closeDateTime = new Date(`${closeDate}T${closeTime}:00`);

  return closeDateTime > lectureDateTime;
};

/**
 * 講義データのバリデーション（純粋関数）
 * @param data - バリデーション対象の講義データ
 * @returns バリデーション結果
 */
export const validateLectureData = (data: LectureData): ValidationResult => {
  const errors: string[] = [];

  // 必須フィールドチェック
  if (!data.title || data.title.trim().length === 0) {
    errors.push("講義タイトルは必須です");
  } else if (data.title.length > 100) {
    errors.push("講義タイトルは100文字以下で入力してください");
  }

  if (!data.lectureDate) {
    errors.push("講義日は必須です");
  } else if (!isValidDateFormat(data.lectureDate)) {
    errors.push("講義日は正しい日付形式（YYYY-MM-DD）で入力してください");
  } else {
    const lectureDate = new Date(data.lectureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lectureDate < today) {
      errors.push("講義日は今日以降の日付を指定してください");
    }
  }

  if (!data.lectureTime) {
    errors.push("講義時刻は必須です");
  } else if (!isValidTimeFormat(data.lectureTime)) {
    errors.push("講義時刻は正しい時刻形式（HH:MM）で入力してください");
  }

  if (data.description && data.description.length > 500) {
    errors.push("講義説明は500文字以下で入力してください");
  }

  if (!data.surveyCloseDate) {
    errors.push("アンケート締切日は必須です");
  } else if (!isValidDateFormat(data.surveyCloseDate)) {
    errors.push(
      "アンケート締切日は正しい日付形式（YYYY-MM-DD）で入力してください",
    );
  }

  if (!data.surveyCloseTime) {
    errors.push("アンケート締切時刻は必須です");
  } else if (!isValidTimeFormat(data.surveyCloseTime)) {
    errors.push(
      "アンケート締切時刻は正しい時刻形式（HH:MM）で入力してください",
    );
  }

  // 日付・時刻が有効な場合、締切日時が講義日時より後かチェック
  if (
    isValidDateFormat(data.lectureDate) &&
    isValidTimeFormat(data.lectureTime) &&
    isValidDateFormat(data.surveyCloseDate) &&
    isValidTimeFormat(data.surveyCloseTime)
  ) {
    if (
      !isCloseDateTimeAfterLectureDateTime(
        data.lectureDate,
        data.lectureTime,
        data.surveyCloseDate,
        data.surveyCloseTime,
      )
    ) {
      errors.push("アンケート締切日時は講義日時より後に設定してください");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 講義更新データのバリデーション（純粋関数）
 * @param data - バリデーション対象の更新データ
 * @returns バリデーション結果
 */
export const validateLectureUpdate = (
  data: LectureUpdateData,
): ValidationResult => {
  const errors: string[] = [];

  // オプショナルフィールドのバリデーション
  if (data.title !== undefined) {
    if (data.title.trim().length === 0) {
      errors.push("講義タイトルは必須です");
    } else if (data.title.length > 100) {
      errors.push("講義タイトルは100文字以下で入力してください");
    }
  }

  if (data.lectureDate !== undefined && !isValidDateFormat(data.lectureDate)) {
    errors.push("講義日は正しい日付形式（YYYY-MM-DD）で入力してください");
  }

  if (data.lectureTime !== undefined && !isValidTimeFormat(data.lectureTime)) {
    errors.push("講義時刻は正しい時刻形式（HH:MM）で入力してください");
  }

  if (data.description !== undefined && data.description.length > 500) {
    errors.push("講義説明は500文字以下で入力してください");
  }

  if (
    data.surveyCloseDate !== undefined &&
    !isValidDateFormat(data.surveyCloseDate)
  ) {
    errors.push(
      "アンケート締切日は正しい日付形式（YYYY-MM-DD）で入力してください",
    );
  }

  if (
    data.surveyCloseTime !== undefined &&
    !isValidTimeFormat(data.surveyCloseTime)
  ) {
    errors.push(
      "アンケート締切時刻は正しい時刻形式（HH:MM）で入力してください",
    );
  }

  if (
    data.surveyStatus !== undefined &&
    !["active", "closed"].includes(data.surveyStatus)
  ) {
    errors.push("アンケート状態は'active'または'closed'である必要があります");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
