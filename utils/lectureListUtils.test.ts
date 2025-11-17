import { describe, it, expect } from "vitest";
import {
  filterLectures,
  sortLectures,
  paginateLectures,
  formatLectureForDisplay,
  calculateLectureStatus,
  LectureListFilter,
  SortBy,
  SortOrder,
} from "./lectureListUtils";
import { Doc } from "../convex/_generated/dataModel";

// テスト用のモックデータ
const mockLectures: Doc<"lectures">[] = [
  {
    _id: "1" as any,
    title: "React基礎講義",
    lectureDate: "2024-01-15",
    lectureTime: "10:00",
    description: "Reactの基本的な使い方を学ぶ",
    surveyCloseDate: "2024-01-16",
    surveyCloseTime: "18:00",
    surveyStatus: "active",
    createdBy: "user1" as any,
    createdAt: 1705200000000, // 2024-01-14
    updatedAt: 1705200000000,
  },
  {
    _id: "2" as any,
    title: "Vue.js応用講義",
    lectureDate: "2024-01-20",
    lectureTime: "14:00",
    description: "Vue.jsの応用的な機能を学ぶ",
    surveyCloseDate: "2024-01-21",
    surveyCloseTime: "18:00",
    surveyStatus: "closed",
    createdBy: "user1" as any,
    createdAt: 1705600000000, // 2024-01-19
    updatedAt: 1705600000000,
  },
  {
    _id: "3" as any,
    title: "JavaScript基礎",
    lectureDate: "2024-01-10",
    lectureTime: "09:00",
    description: "JavaScriptの基本を学ぶ",
    surveyCloseDate: "2024-01-11",
    surveyCloseTime: "18:00",
    surveyStatus: "active",
    createdBy: "user1" as any,
    createdAt: 1705000000000, // 2024-01-12
    updatedAt: 1705000000000,
  },
  {
    _id: "4" as any,
    title: "TypeScript応用",
    lectureDate: "2024-01-25",
    lectureTime: "13:00",
    description: "TypeScriptの応用的な使い方",
    surveyCloseDate: "2024-01-26",
    surveyCloseTime: "18:00",
    surveyStatus: "analyzed",
    closedAt: 1706284800000,
    analyzedAt: 1706288400000,
    createdBy: "user1" as any,
    createdAt: 1706100000000,
    updatedAt: 1706288400000,
  },
];

describe("filterLectures", () => {
  it("状態別フィルタリング: active状態の講義のみが返されること", () => {
    const filter: LectureListFilter = { surveyStatus: "active" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(2);
    expect(result.every((lecture) => lecture.surveyStatus === "active")).toBe(
      true,
    );
  });

  it("状態別フィルタリング: closed状態の講義のみが返されること", () => {
    const filter: LectureListFilter = { surveyStatus: "closed" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(1);
    expect(result[0].surveyStatus).toBe("closed");
  });

  it("状態別フィルタリング: all指定時は全ての講義が返されること", () => {
    const filter: LectureListFilter = { surveyStatus: "all" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(4);
  });

  it("検索文字列による絞り込み: タイトルに一致する講義が返されること", () => {
    const filter: LectureListFilter = { searchText: "React" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("React");
  });

  it("検索文字列による絞り込み: 説明に一致する講義が返されること", () => {
    const filter: LectureListFilter = { searchText: "応用" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(2); // Vue.js応用講義とTypeScript応用
    expect(result.every((lecture) => lecture.description?.includes("応用"))).toBe(
      true,
    );
  });

  it("検索文字列による絞り込み: 大文字小文字を区別しないこと", () => {
    const filter: LectureListFilter = { searchText: "react" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("React");
  });

  it("日付範囲による絞り込み: dateFromより後の講義が返されること", () => {
    const filter: LectureListFilter = { dateFrom: "2024-01-15" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(3); // React基礎, Vue.js応用, TypeScript応用
    expect(result.every((lecture) => lecture.lectureDate >= "2024-01-15")).toBe(
      true,
    );
  });

  it("日付範囲による絞り込み: dateToより前の講義が返されること", () => {
    const filter: LectureListFilter = { dateTo: "2024-01-15" };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(2);
    expect(result.every((lecture) => lecture.lectureDate <= "2024-01-15")).toBe(
      true,
    );
  });

  it("複合条件でのフィルタリング: 複数条件すべてを満たす講義が返されること", () => {
    const filter: LectureListFilter = {
      surveyStatus: "active",
      searchText: "JavaScript",
      dateFrom: "2024-01-10",
      dateTo: "2024-01-15",
    };
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("JavaScript");
    expect(result[0].surveyStatus).toBe("active");
  });

  it("空のフィルタ条件で全ての講義が返されること", () => {
    const filter: LectureListFilter = {};
    const result = filterLectures(mockLectures, filter);

    expect(result).toHaveLength(4);
  });
});

describe("sortLectures", () => {
  it("作成日時順ソート: 昇順でソートされること", () => {
    const result = sortLectures(mockLectures, "createdAt", "asc");

    expect(result[0].createdAt).toBe(1705000000000);
    expect(result[1].createdAt).toBe(1705200000000);
    expect(result[2].createdAt).toBe(1705600000000);
  });

  it("作成日時順ソート: 降順でソートされること", () => {
    const result = sortLectures(mockLectures, "createdAt", "desc");

    expect(result[0].createdAt).toBe(1706100000000); // TypeScript応用
    expect(result[1].createdAt).toBe(1705600000000); // Vue.js応用
    expect(result[2].createdAt).toBe(1705200000000); // React基礎
    expect(result[3].createdAt).toBe(1705000000000); // JavaScript基礎
  });

  it("講義日時順ソート: 昇順でソートされること", () => {
    const result = sortLectures(mockLectures, "lectureDate", "asc");

    expect(result[0].lectureDate).toBe("2024-01-10");
    expect(result[1].lectureDate).toBe("2024-01-15");
    expect(result[2].lectureDate).toBe("2024-01-20");
  });

  it("講義日時順ソート: 降順でソートされること", () => {
    const result = sortLectures(mockLectures, "lectureDate", "desc");

    expect(result[0].lectureDate).toBe("2024-01-25"); // TypeScript応用
    expect(result[1].lectureDate).toBe("2024-01-20"); // Vue.js応用
    expect(result[2].lectureDate).toBe("2024-01-15"); // React基礎
    expect(result[3].lectureDate).toBe("2024-01-10"); // JavaScript基礎
  });

  it("タイトル順ソート: 昇順でソートされること", () => {
    const result = sortLectures(mockLectures, "title", "asc");

    expect(result[0].title).toBe("JavaScript基礎");
    expect(result[1].title).toBe("React基礎講義");
    expect(result[2].title).toBe("TypeScript応用");
    expect(result[3].title).toBe("Vue.js応用講義");
  });

  it("タイトル順ソート: 降順でソートされること", () => {
    const result = sortLectures(mockLectures, "title", "desc");

    expect(result[0].title).toBe("Vue.js応用講義");
    expect(result[1].title).toBe("TypeScript応用");
    expect(result[2].title).toBe("React基礎講義");
    expect(result[3].title).toBe("JavaScript基礎");
  });

  it("元の配列が変更されないこと", () => {
    const original = [...mockLectures];
    sortLectures(mockLectures, "title", "asc");

    expect(mockLectures).toEqual(original);
  });
});

describe("paginateLectures", () => {
  it("ページネーション計算: 正しいページの要素が返されること", () => {
    const result = paginateLectures(mockLectures, { page: 1, itemsPerPage: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.currentPage).toBe(1);
    expect(result.totalItems).toBe(4);
    expect(result.totalPages).toBe(2);
  });

  it("ページネーション計算: 2ページ目の要素が正しく返されること", () => {
    const result = paginateLectures(mockLectures, { page: 2, itemsPerPage: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.currentPage).toBe(2);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(true);
  });

  it("件数制限: 指定したitemsPerPageの数だけ返されること", () => {
    const result = paginateLectures(mockLectures, { page: 1, itemsPerPage: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.totalPages).toBe(4);
  });

  it("最終ページの処理: hasNextPageがfalseになること", () => {
    const result = paginateLectures(mockLectures, { page: 2, itemsPerPage: 2 });

    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(true);
  });

  it("エッジケース: 0件の場合の処理", () => {
    const result = paginateLectures([], { page: 1, itemsPerPage: 10 });

    expect(result.items).toHaveLength(0);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });

  it("エッジケース: 1件の場合の処理", () => {
    const result = paginateLectures([mockLectures[0]], {
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.totalItems).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });
});

describe("formatLectureForDisplay", () => {
  it("講義データの表示用変換: 日時が正しく結合されること", () => {
    const result = formatLectureForDisplay(mockLectures[0]);

    expect(result.lectureDateTime).toBe("2024-01-15 10:00");
    expect(result.surveyCloseDateTime).toBe("2024-01-16 18:00");
  });

  it("ステータス表示の変換: active状態の場合", () => {
    const result = formatLectureForDisplay(mockLectures[0]);

    expect(result.statusLabel).toBe("受付中");
    expect(result.statusColor).toBe("text-green-600");
    expect(result.statusBadgeColor).toContain("bg-green-100");
  });

  it("ステータス表示の変換: closed状態の場合", () => {
    const result = formatLectureForDisplay(mockLectures[1]);

    expect(result.statusLabel).toBe("締切済み");
    expect(result.statusColor).toBe("text-yellow-600");
    expect(result.statusBadgeColor).toContain("bg-yellow-100");
  });

  it("ステータス表示の変換: analyzed状態の場合", () => {
    const result = formatLectureForDisplay(mockLectures[3]);

    expect(result.statusLabel).toBe("分析完了");
    expect(result.statusColor).toBe("text-blue-600");
    expect(result.statusBadgeColor).toContain("bg-blue-100");
  });

  it("元のデータが保持されること", () => {
    const result = formatLectureForDisplay(mockLectures[0]);

    expect(result.title).toBe(mockLectures[0].title);
    expect(result._id).toBe(mockLectures[0]._id);
    expect(result.surveyStatus).toBe(mockLectures[0].surveyStatus);
  });
});

describe("calculateLectureStatus", () => {
  const lecture = mockLectures[0]; // 2024-01-16 18:00締切

  it("現在時刻に基づく状態判定: 締切前の場合", () => {
    const currentTime = new Date("2024-01-16T10:00:00");
    const result = calculateLectureStatus(lecture, currentTime);

    expect(result.isExpired).toBe(false);
    expect(result.timeRemaining).toBeGreaterThan(0);
    expect(result.shouldAutoClose).toBe(false);
  });

  it("現在時刻に基づく状態判定: 締切後の場合", () => {
    const currentTime = new Date("2024-01-16T19:00:00");
    const result = calculateLectureStatus(lecture, currentTime);

    expect(result.isExpired).toBe(true);
    expect(result.timeRemaining).toBe(0);
    expect(result.shouldAutoClose).toBe(true);
  });

  it("締切までの時間計算: 正確な残り時間が計算されること", () => {
    const currentTime = new Date("2024-01-16T17:00:00");
    const result = calculateLectureStatus(lecture, currentTime);

    expect(result.timeRemaining).toBe(3600000); // 1時間 = 3600000ms
  });

  it("状態変更の境界値テスト: 締切時刻ちょうどの場合", () => {
    const currentTime = new Date("2024-01-16T18:00:00");
    const result = calculateLectureStatus(lecture, currentTime);

    expect(result.isExpired).toBe(false);
    expect(result.timeRemaining).toBe(0);
  });

  it("closed状態の講義では自動締切フラグが立たないこと", () => {
    const closedLecture = { ...lecture, surveyStatus: "closed" as const };
    const currentTime = new Date("2024-01-16T19:00:00");
    const result = calculateLectureStatus(closedLecture, currentTime);

    expect(result.isExpired).toBe(true);
    expect(result.shouldAutoClose).toBe(false);
  });
});
