/**
 * index.ts
 * Internal Mutations - 講義関連mutations のエクスポート
 */

// 講義作成関連
export { createLecture, bulkCreateLectures } from "./createLecture";

// 講義更新関連
export {
  updateLecture,
  updateLectureSurveyStatus,
  autoCloseLecture,
  bulkUpdateLectures,
} from "./updateLecture";

// アンケート回答関連
export {
  submitResponse,
  bulkSubmitResponses,
  submitResponseWithDuplicateCheck,
  deleteResponse,
  deleteAllResponsesForLecture,
} from "./submitResponse";
