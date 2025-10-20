"use client";

import React from "react";
import { CrossAnalysisData } from "../../convex/shared/types/analysis";

interface CrossAnalysisChartsContainerProps {
  crossData: CrossAnalysisData | null;
  isLoading?: boolean;
}

export default function CrossAnalysisChartsContainer({
  crossData,
  isLoading = false,
}: CrossAnalysisChartsContainerProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          クロス集計
        </h3>
        <div className="animate-pulse">
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!crossData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          クロス集計
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
    over60: "60歳以上",
  };

  // クロス集計データを表形式で表示するヘルパー関数
  const renderCrossTable = (
    data: typeof crossData.understandingByGender,
    dim2Labels: Record<string, string>,
    title: string,
  ) => {
    // dim2OptionCodeごとにグループ化
    const grouped = data.reduce(
      (acc, item) => {
        const key = item.dim2OptionCode;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, typeof data>,
    );

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h4>
        <div className="space-y-4">
          {Object.entries(grouped).map(([dim2Value, items]) => (
            <div
              key={dim2Value}
              className="border-b border-gray-200 pb-3 last:border-b-0 dark:border-gray-700"
            >
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {dim2Labels[dim2Value] || dim2Value}
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.dim1OptionCode}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-right font-medium text-gray-900 dark:text-gray-100">
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
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        クロス集計
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 理解度 × 性別 */}
        {renderCrossTable(
          crossData.understandingByGender,
          genderLabels,
          "理解度 × 性別",
        )}

        {/* 理解度 × 年代 */}
        {renderCrossTable(
          crossData.understandingByAgeGroup,
          ageGroupLabels,
          "理解度 × 年代",
        )}

        {/* 満足度 × 性別 */}
        {renderCrossTable(
          crossData.satisfactionByGender,
          genderLabels,
          "満足度 × 性別",
        )}

        {/* 満足度 × 年代 */}
        {renderCrossTable(
          crossData.satisfactionByAgeGroup,
          ageGroupLabels,
          "満足度 × 年代",
        )}
      </div>
    </div>
  );
}
