"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BasicStatistics } from "../../convex/shared/types/analysis";

interface SatisfactionSummaryProps {
  statistics: BasicStatistics | null;
  isLoading?: boolean;
}

export default function SatisfactionSummary({
  statistics,
  isLoading = false,
}: SatisfactionSummaryProps) {
  // 全講義平均を取得
  const understandingAllAvg = useQuery(
    api.api.analysisResults.getAllLecturesAverage,
    {
      targetQuestion: "understanding",
    },
  );
  const satisfactionAllAvg = useQuery(
    api.api.analysisResults.getAllLecturesAverage,
    {
      targetQuestion: "satisfaction",
    },
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          サマリー
        </h3>
        <div className="animate-pulse">
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          サマリー
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          分析データがありません
        </p>
      </div>
    );
  }

  // 5段階評価のパーセンテージを計算（20% × スコア）
  const understandingPercentage = (statistics.averages.understanding / 5) * 100;
  const satisfactionPercentage = (statistics.averages.satisfaction / 5) * 100;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        サマリー
      </h3>

      {/* 総回答数 */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          総回答数
        </h4>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {statistics.totalResponses}件
        </p>
      </div>

      {/* 理解度スコア */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          理解度
        </h4>
        <div className="mb-2 flex items-end justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {statistics.averages.understanding.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / 5.00
          </span>
        </div>
        {/* プログレスバー */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${understandingPercentage}%` }}
          ></div>
        </div>
        {/* 全講義平均との比較 */}
        {understandingAllAvg && understandingAllAvg.totalLectures > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              全講義平均:{" "}
              <span className="font-medium">
                {understandingAllAvg.average.toFixed(2)}
              </span>
              <span className="ml-2 text-xs">
                (全{understandingAllAvg.totalLectures}講義)
              </span>
            </p>
            <p
              className={`mt-1 ${
                statistics.averages.understanding >= understandingAllAvg.average
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {statistics.averages.understanding >= understandingAllAvg.average
                ? "▲"
                : "▼"}{" "}
              {Math.abs(
                statistics.averages.understanding - understandingAllAvg.average,
              ).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* 満足度スコア */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          満足度
        </h4>
        <div className="mb-2 flex items-end justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {statistics.averages.satisfaction.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / 5.00
          </span>
        </div>
        {/* プログレスバー */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${satisfactionPercentage}%` }}
          ></div>
        </div>
        {/* 全講義平均との比較 */}
        {satisfactionAllAvg && satisfactionAllAvg.totalLectures > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              全講義平均:{" "}
              <span className="font-medium">
                {satisfactionAllAvg.average.toFixed(2)}
              </span>
              <span className="ml-2 text-xs">
                (全{satisfactionAllAvg.totalLectures}講義)
              </span>
            </p>
            <p
              className={`mt-1 ${
                statistics.averages.satisfaction >= satisfactionAllAvg.average
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {statistics.averages.satisfaction >= satisfactionAllAvg.average
                ? "▲"
                : "▼"}{" "}
              {Math.abs(
                statistics.averages.satisfaction - satisfactionAllAvg.average,
              ).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
