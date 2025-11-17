import { Doc } from "../convex/_generated/dataModel";

// 講義の並び順タイプ
export type SortBy = "createdAt" | "lectureDate" | "title";
export type SortOrder = "asc" | "desc";

// フィルタ条件タイプ
export interface LectureListFilter {
  surveyStatus?: "active" | "closed" | "all";
  searchText?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ページネーション設定タイプ
export interface PaginationConfig {
  page: number;
  itemsPerPage: number;
}

// ページネーション結果タイプ
export interface PaginationResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * 講義リストをフィルタリングする純粋関数
 * @param lectures - 講義リスト
 * @param filter - フィルタ条件
 * @returns フィルタリングされた講義リスト
 */
export const filterLectures = (
  lectures: Doc<"lectures">[],
  filter: LectureListFilter,
): Doc<"lectures">[] => {
  let filtered = [...lectures];

  // 状態別フィルタリング
  if (filter.surveyStatus && filter.surveyStatus !== "all") {
    filtered = filtered.filter(
      (lecture) => lecture.surveyStatus === filter.surveyStatus,
    );
  }

  // 検索文字列によるフィルタリング
  if (filter.searchText && filter.searchText.trim() !== "") {
    const searchLower = filter.searchText.toLowerCase();
    filtered = filtered.filter(
      (lecture) =>
        lecture.title.toLowerCase().includes(searchLower) ||
        lecture.description?.toLowerCase().includes(searchLower),
    );
  }

  // 日付範囲によるフィルタリング
  if (filter.dateFrom) {
    filtered = filtered.filter(
      (lecture) => lecture.lectureDate >= filter.dateFrom!,
    );
  }

  if (filter.dateTo) {
    filtered = filtered.filter(
      (lecture) => lecture.lectureDate <= filter.dateTo!,
    );
  }

  return filtered;
};

/**
 * 講義リストをソートする純粋関数
 * @param lectures - 講義リスト
 * @param sortBy - ソート対象のフィールド
 * @param sortOrder - ソート順
 * @returns ソートされた講義リスト
 */
export const sortLectures = (
  lectures: Doc<"lectures">[],
  sortBy: SortBy,
  sortOrder: SortOrder,
): Doc<"lectures">[] => {
  const sorted = [...lectures];

  sorted.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "createdAt":
        compareValue = a.createdAt - b.createdAt;
        break;
      case "lectureDate":
        compareValue = a.lectureDate.localeCompare(b.lectureDate);
        break;
      case "title":
        compareValue = a.title.localeCompare(b.title);
        break;
      default:
        compareValue = 0;
    }

    return sortOrder === "desc" ? -compareValue : compareValue;
  });

  return sorted;
};

/**
 * 講義リストをページネーションする純粋関数
 * @param lectures - 講義リスト
 * @param config - ページネーション設定
 * @returns ページネーション結果
 */
export const paginateLectures = (
  lectures: Doc<"lectures">[],
  config: PaginationConfig,
): PaginationResult<Doc<"lectures">> => {
  const { page, itemsPerPage } = config;
  const totalItems = lectures.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const items = lectures.slice(startIndex, endIndex);

  return {
    items,
    totalItems,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

/**
 * 講義データを表示用にフォーマットする純粋関数
 * @param lecture - 講義データ
 * @returns 表示用フォーマット済み講義データ
 */
export const formatLectureForDisplay = (lecture: Doc<"lectures">) => {
  // ステータスラベルの決定
  const statusLabel =
    lecture.surveyStatus === "active"
      ? "受付中"
      : lecture.surveyStatus === "analyzed"
        ? "分析完了"
        : "締切済み";

  // ステータスカラーの決定
  const statusColor =
    lecture.surveyStatus === "active"
      ? "text-green-600"
      : lecture.surveyStatus === "analyzed"
        ? "text-blue-600"
        : "text-yellow-600";

  const statusBadgeColor =
    lecture.surveyStatus === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : lecture.surveyStatus === "analyzed"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

  return {
    ...lecture,
    lectureDateTime: `${lecture.lectureDate} ${lecture.lectureTime}`,
    surveyCloseDateTime: `${lecture.surveyCloseDate} ${lecture.surveyCloseTime}`,
    statusLabel,
    statusColor,
    statusBadgeColor,
  };
};

/**
 * 現在時刻に基づいて講義の状態を計算する純粋関数
 * @param lecture - 講義データ
 * @param currentTime - 現在時刻（テスト用にパラメータ化）
 * @returns 計算された状態情報
 */
export const calculateLectureStatus = (
  lecture: Doc<"lectures">,
  currentTime: Date = new Date(),
) => {
  const closeDateTime = new Date(
    `${lecture.surveyCloseDate} ${lecture.surveyCloseTime}`,
  );
  const isExpired = currentTime > closeDateTime;
  const timeRemaining = closeDateTime.getTime() - currentTime.getTime();

  return {
    isExpired,
    timeRemaining: Math.max(0, timeRemaining),
    shouldAutoClose: isExpired && lecture.surveyStatus === "active",
  };
};
