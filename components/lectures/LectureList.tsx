"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Link from "next/link";
import { useState, useMemo } from "react";
import { LectureCard } from "./LectureCard";
import {
  filterLectures,
  sortLectures,
  paginateLectures,
  LectureListFilter,
  SortBy,
  SortOrder,
} from "../../utils/lectureListUtils";

const ITEMS_PER_PAGE = 10;

export function LectureList() {
  const lectures = useQuery(api.domains.lectures.api.queries.getLectures, {});
  const closeLecture = useMutation(
    api.domains.lectures.api.mutations.closeLecture,
  );
  const deleteLecture = useMutation(
    api.domains.lectures.api.mutations.removeeLecture,
  );

  // State management
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<LectureListFilter>({
    surveyStatus: "all",
    searchText: "",
  });
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Process lectures data using pure functions
  const processedLectures = useMemo(() => {
    if (!lectures) return null;

    const filtered = filterLectures(lectures, filter);
    const sorted = sortLectures(filtered, sortBy, sortOrder);
    const paginated = paginateLectures(sorted, {
      page: currentPage,
      itemsPerPage: ITEMS_PER_PAGE,
    });

    return paginated;
  }, [lectures, filter, sortBy, sortOrder, currentPage]);

  // Event handlers
  const handleCloseSurvey = async (lectureId: string) => {
    setLoading(`close-${lectureId}`);
    try {
      await closeLecture({ lectureId: lectureId as Id<"lectures"> });
    } catch (error) {
      console.error("アンケート終了エラー:", error);
      alert("アンケート終了に失敗しました");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm("この講義を削除してもよろしいですか？")) return;

    setLoading(`delete-${lectureId}`);
    try {
      await deleteLecture({ lectureId: lectureId as Id<"lectures"> });
    } catch (error) {
      console.error("講義削除エラー:", error);
      alert("講義削除に失敗しました");
    } finally {
      setLoading(null);
    }
  };

  const handleFilterChange = (newFilter: Partial<LectureListFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const getSortIcon = (field: SortBy) => {
    if (field !== sortBy) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  // Loading state
  if (lectures === undefined) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          講義管理
        </h1>
        <Link
          href="/lectures/create"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          新しい講義を作成
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              状態
            </label>
            <select
              value={filter.surveyStatus || "all"}
              onChange={(e) =>
                handleFilterChange({
                  surveyStatus: e.target.value as "active" | "closed" | "all",
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">すべて</option>
              <option value="active">実施中</option>
              <option value="closed">締切済み</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              検索
            </label>
            <input
              type="text"
              placeholder="講義タイトルや説明で検索..."
              value={filter.searchText || ""}
              onChange={(e) =>
                handleFilterChange({ searchText: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Sort Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              並び順
            </label>
            <div className="mt-1 flex gap-1">
              <button
                onClick={() => handleSortChange("createdAt")}
                className={`px-2 py-1 text-xs rounded ${
                  sortBy === "createdAt"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                作成日 {getSortIcon("createdAt")}
              </button>
              <button
                onClick={() => handleSortChange("lectureDate")}
                className={`px-2 py-1 text-xs rounded ${
                  sortBy === "lectureDate"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                講義日 {getSortIcon("lectureDate")}
              </button>
              <button
                onClick={() => handleSortChange("title")}
                className={`px-2 py-1 text-xs rounded ${
                  sortBy === "title"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                タイトル {getSortIcon("title")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {processedLectures && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {processedLectures.totalItems}件中 {processedLectures.items.length}
          件を表示
          {processedLectures.totalPages > 1 &&
            ` (${processedLectures.currentPage}/${processedLectures.totalPages}ページ)`}
        </div>
      )}

      {/* Content */}
      {lectures.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            まだ講義が作成されていません
          </p>
          <Link
            href="/lectures/create"
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            最初の講義を作成する
          </Link>
        </div>
      ) : processedLectures?.items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            検索条件に一致する講義がありません
          </p>
        </div>
      ) : (
        <>
          {/* Lecture Cards */}
          <div className="grid gap-4">
            {processedLectures?.items.map((lecture) => (
              <LectureCard
                key={lecture._id}
                lecture={lecture}
                onCloseSurvey={handleCloseSurvey}
                onDeleteLecture={handleDeleteLecture}
                loading={loading}
              />
            ))}
          </div>

          {/* Pagination */}
          {processedLectures && processedLectures.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!processedLectures.hasPreviousPage}
                className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                前へ
              </button>

              <span className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {processedLectures.currentPage} / {processedLectures.totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!processedLectures.hasNextPage}
                className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
