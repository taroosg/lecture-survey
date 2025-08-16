import { v } from "convex/values";

// アンケート状態の型
export type SurveyStatus = "active" | "closed";

// 講義の基本情報型
export interface LectureInfo {
  title: string;
  lectureDate: string;
  lectureTime: string;
  surveyCloseDate: string;
  surveyCloseTime: string;
}

/**
 * アンケート用スラッグを生成（純粋関数）
 */
export const generateSurveySlug = (
  lectureTitle: string,
  lectureDate: string,
  lectureTime: string,
): string => {
  // タイトルから日本語および英数字以外の文字を除去し、英数字のみにする
  const titlePart = lectureTitle
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, "")
    .replace(/\s+/g, "")
    .slice(0, 20); // 20文字まで

  // 日付と時刻を結合
  const datePart = lectureDate.replace(/-/g, "");
  const timePart = lectureTime.replace(":", "");

  // ランダム文字列（実際の実装では外部から注入される）
  const randomPart = Math.random().toString(36).substring(2, 8);

  return `${titlePart}_${datePart}_${timePart}_${randomPart}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
};

/**
 * アンケートURLを生成（純粋関数）
 */
export const generateSurveyUrl = (baseUrl: string, slug: string): string => {
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/survey/${slug}`;
};

/**
 * 現在時刻と締切時刻を比較してアンケート状態を計算（純粋関数）
 */
export const calculateSurveyStatus = (
  closeDate: string,
  closeTime: string,
  currentTime?: number,
): SurveyStatus => {
  const closeDateTime = new Date(`${closeDate}T${closeTime}:00`);
  const now = currentTime ? new Date(currentTime) : new Date();

  return now >= closeDateTime ? "closed" : "active";
};

/**
 * アンケートが手動で締切可能な状態かを判定（純粋関数）
 */
export const isClosable = (
  currentStatus: SurveyStatus,
  closeDate: string,
  closeTime: string,
  currentTime?: number,
): boolean => {
  // 既に締切済みの場合は締切不可
  if (currentStatus === "closed") {
    return false;
  }

  // 自動締切時刻を過ぎている場合は締切不可（既に自動で締切られているはず）
  const closeDateTime = new Date(`${closeDate}T${closeTime}:00`);
  const now = currentTime ? new Date(currentTime) : new Date();

  return now <= closeDateTime;
};

/**
 * アンケート状態の遷移が有効かをチェック（純粋関数）
 */
export const isValidStatusTransition = (
  currentStatus: SurveyStatus,
  newStatus: SurveyStatus,
): boolean => {
  // 同じ状態への遷移は常に有効
  if (currentStatus === newStatus) {
    return true;
  }

  // active -> closed は有効
  if (currentStatus === "active" && newStatus === "closed") {
    return true;
  }

  // closed -> active は無効（一度締切ったアンケートは再開できない）
  return false;
};

/**
 * 講義タイトルからサジェスト用のキーワードを抽出（純粋関数）
 */
export const extractSuggestionKeywords = (title: string): string[] => {
  const keywords: string[] = [];

  // 一般的な講義キーワード
  const commonKeywords = [
    "基礎",
    "応用",
    "入門",
    "実習",
    "演習",
    "実験",
    "講義",
    "セミナー",
    "プログラミング",
    "データベース",
    "ネットワーク",
    "AI",
    "機械学習",
    "Web",
    "アプリ",
    "システム",
    "設計",
    "開発",
  ];

  // タイトルに含まれるキーワードを抽出
  for (const keyword of commonKeywords) {
    if (title.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return keywords;
};

/**
 * 講義の検索用キーワードを生成（純粋関数）
 */
export const generateSearchKeywords = (
  title: string,
  description?: string,
): string[] => {
  const keywords: string[] = [];

  // タイトルから抽出
  keywords.push(...extractSuggestionKeywords(title));

  // 説明からもキーワード抽出（あれば）
  if (description) {
    keywords.push(...extractSuggestionKeywords(description));
  }

  // 重複を除去して返す
  return [...new Set(keywords)];
};

/**
 * アンケート回答可能期間を計算（純粋関数）
 */
export const calculateResponsePeriod = (
  lectureDate: string,
  lectureTime: string,
  closeDate: string,
  closeTime: string,
): {
  startDateTime: Date;
  endDateTime: Date;
  durationHours: number;
} => {
  const startDateTime = new Date(`${lectureDate}T${lectureTime}:00`);
  const endDateTime = new Date(`${closeDate}T${closeTime}:00`);

  const durationMs = endDateTime.getTime() - startDateTime.getTime();
  const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

  return {
    startDateTime,
    endDateTime,
    durationHours,
  };
};

/**
 * 講義日時の表示用フォーマット（純粋関数）
 */
export const formatLectureDateTime = (
  lectureDate: string,
  lectureTime: string,
  locale: string = "ja-JP",
): string => {
  const dateTime = new Date(`${lectureDate}T${lectureTime}:00`);

  if (locale === "ja-JP") {
    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1;
    const day = dateTime.getDate();
    const hour = dateTime.getHours();
    const minute = dateTime.getMinutes();

    return `${year}年${month}月${day}日 ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  return dateTime.toLocaleString(locale);
};

/**
 * 週の曜日を取得（純粋関数）
 */
export const getWeekdayName = (
  lectureDate: string,
  locale: string = "ja-JP",
): string => {
  const date = new Date(lectureDate);

  if (locale === "ja-JP") {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return weekdays[date.getDay()];
  }

  return date.toLocaleDateString(locale, { weekday: "long" });
};
