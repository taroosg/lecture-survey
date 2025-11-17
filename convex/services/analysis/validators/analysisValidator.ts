/**
 * Analysis Validators - Pure Functions
 *
 * 分析データのバリデーションPure関数群
 */

import type { Doc } from "../../../_generated/dataModel";

/**
 * 講義が分析可能かどうかを判定
 */
export const isAnalyzable = (lecture: Doc<"lectures">): boolean => {
  return (
    lecture.surveyStatus === "closed" || lecture.surveyStatus === "analyzed"
  );
};

/**
 * タイムスタンプが有効かどうかを判定
 */
export const isValidTimestamp = (timestamp: number): boolean => {
  // 有効な範囲: 2020年以降、現在+1年以内
  const MIN_TIMESTAMP = new Date("2020-01-01").getTime();
  const MAX_TIMESTAMP = Date.now() + 365 * 24 * 60 * 60 * 1000; // 現在+1年

  return timestamp >= MIN_TIMESTAMP && timestamp <= MAX_TIMESTAMP;
};

/**
 * レスポンス数が有効かどうかを判定
 */
export const isValidResponseCount = (count: number): boolean => {
  return Number.isInteger(count) && count >= 0 && count <= 100000; // 最大10万件
};

/**
 * 結果セットバージョンが有効かどうかを判定
 */
export const isValidVersion = (version: string): boolean => {
  // セマンティックバージョニング形式をチェック
  const versionPattern = /^\d+\.\d+(\.\d+)?$/;
  return versionPattern.test(version);
};

/**
 * 結果セット作成引数の包括的バリデーション
 */
export const validateCreateResultSetArgs = (args: {
  lectureId: string;
  closedAt: number;
  totalResponses: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isValidTimestamp(args.closedAt)) {
    errors.push(`無効なタイムスタンプ: closedAt=${args.closedAt}`);
  }

  if (!isValidResponseCount(args.totalResponses)) {
    errors.push(`無効なレスポンス数: totalResponses=${args.totalResponses}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 結果セットが重複しているかチェック（同一講義・同一時刻）
 */
export const isDuplicateResultSet = (
  lectureId: string,
  closedAt: number,
  existingResultSets: Array<{ lectureId: string; closedAt: number }>,
): boolean => {
  return existingResultSets.some(
    (rs) => rs.lectureId === lectureId && rs.closedAt === closedAt,
  );
};

/**
 * 講義IDの有効性をチェック
 */
export const isValidLectureId = (lectureId: string): boolean => {
  // ConvexのIDフォーマットをチェック（基本的な形式確認）
  return typeof lectureId === "string" && lectureId.length > 0;
};
