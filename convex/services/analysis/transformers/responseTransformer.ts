/**
 * Response Transformer - Pure Functions
 *
 * 回答データの変換処理
 */

import type { AnalysisDataRow } from "../../../shared/types/analysis";
import type { Doc } from "../../../_generated/dataModel";

/**
 * データベースからの生レスポンスデータ型
 */
export interface RawResponseData {
  _id: string;
  lectureId: string;
  gender: string;
  ageGroup: string;
  understanding: number;
  satisfaction: number;
  freeComment?: string;
  userAgent?: string;
  ipAddress?: string;
  responseTime?: number;
  createdAt: number;
}

/**
 * 有効性チェック済みのレスポンスデータ型
 */
export interface ValidResponse extends RawResponseData {
  isValid: true;
  normalizedData: AnalysisDataRow;
}

/**
 * 有効なレスポンスのみをフィルタリング
 *
 * @param responses - 生レスポンスデータ配列
 * @returns 有効性チェック済みレスポンス配列
 */
export const filterValidResponses = (
  responses: RawResponseData[],
): ValidResponse[] => {
  return responses
    .filter((response) => isValidResponseData(response))
    .map((response) => ({
      ...response,
      isValid: true as const,
      normalizedData: normalizeResponseData(response),
    }));
};

/**
 * レスポンスデータの有効性をチェック
 *
 * @param response - レスポンスデータ
 * @returns 有効性判定結果
 */
export const isValidResponseData = (response: RawResponseData): boolean => {
  // 必須フィールドの存在チェック
  if (!response.gender || !response.ageGroup) {
    return false;
  }

  // 数値データの有効性チェック（1-5の範囲）
  if (
    typeof response.understanding !== "number" ||
    response.understanding < 1 ||
    response.understanding > 5
  ) {
    return false;
  }

  if (
    typeof response.satisfaction !== "number" ||
    response.satisfaction < 1 ||
    response.satisfaction > 5
  ) {
    return false;
  }

  // 作成日時の有効性チェック
  if (!response.createdAt || response.createdAt <= 0) {
    return false;
  }

  return true;
};

/**
 * レスポンスデータの正規化
 *
 * @param response - 生レスポンスデータ
 * @returns 正規化済み分析用データ行
 */
export const normalizeResponseData = (
  response: RawResponseData,
): AnalysisDataRow => {
  return {
    gender: response.gender.trim(),
    ageGroup: response.ageGroup.trim(),
    understanding: response.understanding,
    satisfaction: response.satisfaction,
  };
};

/**
 * 無効データのフィルタリング強化
 *
 * @param responses - 生レスポンスデータ配列
 * @returns フィルタリング済みレスポンス配列
 */
export const filterValidResponsesForAnalysis = (
  responses: RawResponseData[],
): RawResponseData[] => {
  return responses.filter((response) => {
    // understanding/satisfaction > 5の除外
    if (response.understanding && response.understanding > 5) {
      return false;
    }
    if (response.satisfaction && response.satisfaction > 5) {
      return false;
    }

    // preferNotToSayの除外
    if (response.gender === "preferNotToSay") {
      return false;
    }

    // 必須項目の欠損チェック
    return isValidResponseData(response);
  });
};

/**
 * 分析用データの正規化
 *
 * @param responses - 有効なレスポンス配列
 * @returns 正規化済み分析用データ行配列
 */
export const normalizeForAnalysis = (
  responses: RawResponseData[],
): AnalysisDataRow[] => {
  return responses.map((response) => ({
    // 文字列データの正規化
    gender: normalizeStringValue(response.gender),
    ageGroup: normalizeStringValue(response.ageGroup),

    // 数値データの正規化（数値のまま維持）
    understanding: normalizeNumberValue(response.understanding),
    satisfaction: normalizeNumberValue(response.satisfaction),
  }));
};

/**
 * 文字列値の正規化
 */
const normalizeStringValue = (value: string): string => {
  if (!value) return "";
  return value.toLowerCase().trim();
};

/**
 * 数値の正規化
 */
const normalizeNumberValue = (value: number): number => {
  if (typeof value !== "number" || isNaN(value)) return 0;
  return Math.round(value * 100) / 100; // 小数点以下2桁に丸め
};

/**
 * 講義情報からレスポンスデータを取得するための型定義
 */
export interface LectureInfo {
  _id: string;
  title: string;
  lectureDate: string;
  lectureTime: string;
  surveyStatus: "active" | "closed" | "analyzed";
  closedAt?: number;
  analyzedAt?: number;
  createdBy: string;
  createdAt: number;
}

/**
 * Doc<"lectures">からLectureInfo型に変換
 */
export const convertToLectureInfo = (lecture: Doc<"lectures">): LectureInfo => {
  return {
    _id: lecture._id,
    title: lecture.title,
    lectureDate: lecture.lectureDate,
    lectureTime: lecture.lectureTime,
    surveyStatus: lecture.surveyStatus,
    closedAt: lecture.closedAt,
    analyzedAt: lecture.analyzedAt,
    createdBy: lecture.createdBy,
    createdAt: lecture.createdAt,
  };
};
