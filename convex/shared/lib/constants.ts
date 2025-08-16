/**
 * 講義用アンケートシステムの定数定義
 * plan.mdで定義された講義評価用質問項目の定数
 */

// 性別の選択肢
export const VALID_GENDERS = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
] as const;

// 年代の選択肢
export const VALID_AGE_GROUPS = [
  "under_20",
  "20s",
  "30s",
  "40s",
  "50s",
  "60s",
  "over_70",
] as const;

// 理解度・満足度評価の定数（1-5段階）
export const VALID_RATING_VALUES = [1, 2, 3, 4, 5] as const;
export const MIN_RATING_VALUE = 1;
export const MAX_RATING_VALUE = 5;

// 講義評価質問IDの定数
export const LECTURE_QUESTION_IDS = [
  "gender",
  "age_group",
  "understanding",
  "satisfaction",
  "free_comment",
] as const;

// アンケート状態の定数
export const VALID_SURVEY_STATUSES = ["active", "closed"] as const;

// 型定義
export type GenderValue = (typeof VALID_GENDERS)[number];
export type AgeGroupValue = (typeof VALID_AGE_GROUPS)[number];
export type RatingValue = (typeof VALID_RATING_VALUES)[number];
export type LectureQuestionId = (typeof LECTURE_QUESTION_IDS)[number];
export type SurveyStatus = (typeof VALID_SURVEY_STATUSES)[number];
