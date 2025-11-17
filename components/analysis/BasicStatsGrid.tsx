"use client";

import React from "react";
import { BasicStatistics } from "../../convex/shared/types/analysis";

interface BasicStatsGridProps {
  statistics: BasicStatistics | null;
  isLoading?: boolean;
}

export default function BasicStatsGrid({
  statistics,
  isLoading = false,
}: BasicStatsGridProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          基本統計
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
          基本統計
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          分析データがありません
        </p>
      </div>
    );
  }

  // ラベルマッピング
  const genderLabels: Record<string, string> = {
    male: "男性",
    female: "女性",
    other: "その他",
    preferNotToSay: "回答しない",
  };

  const ageGroupLabels: Record<string, string> = {
    under20: "20歳未満",
    "20s": "20代",
    "30s": "30代",
    "40s": "40代",
    "50s": "50代",
    "60s": "60代",
    over70: "70歳以上",
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        基本統計
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 性別分布 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
            性別分布
          </h4>
          <div className="space-y-2">
            {statistics.distributions.gender.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {genderLabels[item.dim1OptionCode] || item.dim1OptionCode}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.n}件
                  </span>
                  <span className="w-12 text-right text-xs text-gray-500 dark:text-gray-400">
                    ({item.pct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 年代分布 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
            年代分布
          </h4>
          <div className="space-y-2">
            {statistics.distributions.ageGroup.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {ageGroupLabels[item.dim1OptionCode] || item.dim1OptionCode}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.n}件
                  </span>
                  <span className="w-12 text-right text-xs text-gray-500 dark:text-gray-400">
                    ({item.pct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 理解度分布 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
            理解度分布
          </h4>
          <div className="space-y-2">
            {statistics.distributions.understanding.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.dim1OptionCode}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.n}件
                  </span>
                  <span className="w-12 text-right text-xs text-gray-500 dark:text-gray-400">
                    ({item.pct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 満足度分布 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
            満足度分布
          </h4>
          <div className="space-y-2">
            {statistics.distributions.satisfaction.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.dim1OptionCode}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-pink-500"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.n}件
                  </span>
                  <span className="w-12 text-right text-xs text-gray-500 dark:text-gray-400">
                    ({item.pct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
