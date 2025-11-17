"use client";

import Link from "next/link";
import { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";
import {
  formatLectureForDisplay,
  calculateLectureStatus,
} from "../../utils/lectureListUtils";

interface LectureCardProps {
  lecture: Doc<"lectures">;
}

export function LectureCard({ lecture }: LectureCardProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const formattedLecture = formatLectureForDisplay(lecture);
  const statusInfo = calculateLectureStatus(lecture);

  const handleCopyUrl = async () => {
    try {
      const surveyUrl = `/survey/${lecture._id}`;
      const fullUrl = `${window.location.origin}${surveyUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error("URL copy failed:", error);
      alert("URLのコピーに失敗しました");
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <div>
          <Link href={`/lectures/${lecture._id}`}>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400 cursor-pointer">
              {lecture.title}
            </h2>
          </Link>
          {lecture.description && (
            <p className="mb-3 text-gray-600 dark:text-gray-400">
              {lecture.description}
            </p>
          )}
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">講義日時:</span>{" "}
              {formattedLecture.lectureDateTime}
            </p>
            <p>
              <span className="font-medium">アンケート締切:</span>{" "}
              {formattedLecture.surveyCloseDateTime}
            </p>
            <div className="mt-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${formattedLecture.statusBadgeColor}`}
              >
                {formattedLecture.statusLabel}
              </span>
            </div>
            {statusInfo.shouldAutoClose && (
              <p className="text-orange-600 dark:text-orange-400">
                <span className="font-medium">注意:</span>{" "}
                締切時刻を過ぎていますが、まだ自動締切されていません
              </p>
            )}
          </div>
        </div>
      </div>

      {lecture.surveyStatus === "active" && (
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                アンケートURL:
              </p>
              <button
                onClick={handleCopyUrl}
                className="rounded bg-gray-500 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                {copiedUrl ? "コピー済み" : "URLコピー"}
              </button>
            </div>
            <div className="break-all text-sm">
              <a
                href={`${window.location.origin}/survey/${lecture._id}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                {window.location.origin}/survey/{lecture._id}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
