import {
  VALID_GENDERS,
  VALID_AGE_GROUPS,
  VALID_RATING_VALUES,
  MIN_RATING_VALUE,
  MAX_RATING_VALUE,
  type GenderValue,
  type AgeGroupValue,
  type RatingValue,
} from "./constants";

// 講義評価アンケート回答データの型定義
export interface LectureResponseData {
  gender: string;
  ageGroup: string;
  understanding: number;
  satisfaction: number;
  freeComment?: string;
}

// バリデーション関数
export const validateGender = (value: string): value is GenderValue => {
  return VALID_GENDERS.includes(value as GenderValue);
};

export const validateAgeGroup = (value: string): value is AgeGroupValue => {
  return VALID_AGE_GROUPS.includes(value as AgeGroupValue);
};

export const validateRating = (value: number): value is RatingValue => {
  return (
    Number.isInteger(value) &&
    VALID_RATING_VALUES.includes(value as RatingValue)
  );
};

export const validateFreeComment = (value?: string): boolean => {
  // フリーコメントは任意項目なので、undefinedまたは文字列であればOK
  return value === undefined || typeof value === "string";
};

// 統合バリデーション関数
export const validateLectureResponse = (
  data: LectureResponseData,
): string[] => {
  const errors: string[] = [];

  if (!validateGender(data.gender)) {
    errors.push("性別の値が不正です");
  }

  if (!validateAgeGroup(data.ageGroup)) {
    errors.push("年代の値が不正です");
  }

  if (!validateRating(data.understanding)) {
    errors.push(
      `理解度は${MIN_RATING_VALUE}-${MAX_RATING_VALUE}の範囲で入力してください`,
    );
  }

  if (!validateRating(data.satisfaction)) {
    errors.push(
      `満足度は${MIN_RATING_VALUE}-${MAX_RATING_VALUE}の範囲で入力してください`,
    );
  }

  if (!validateFreeComment(data.freeComment)) {
    errors.push("フリーコメントの形式が不正です");
  }

  return errors;
};
