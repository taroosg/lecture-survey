"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import React, { useState, use } from "react";
import SatisfactionSummary from "../../../components/analysis/SatisfactionSummary";
import BasicStatsGrid from "../../../components/analysis/BasicStatsGrid";
import CrossAnalysisChartsContainer from "../../../components/analysis/CrossAnalysisChartsContainer";

export default function LectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <main className="container mx-auto min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <LectureDetailContent lectureId={resolvedParams.id} />
      </div>
    </main>
  );
}

type TabType = "summary" | "basic" | "cross";

function LectureDetailContent({ lectureId }: { lectureId: string }) {
  const lecture = useQuery(api.api.lectures.getLecture, {
    lectureId: lectureId as Id<"lectures">,
  });
  const responseData = useQuery(api.api.responses.getResponseCount, {
    lectureId: lectureId as Id<"lectures">,
  });
  const basicStatistics = useQuery(api.api.analysisResults.getBasicStatistics, {
    lectureId: lectureId as Id<"lectures">,
  });
  const crossAnalysisData = useQuery(
    api.api.analysisResults.getCrossAnalysisData,
    {
      lectureId: lectureId as Id<"lectures">,
    },
  );

  // タブ状態管理
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // 分析完了状態の判定
  const analysisCompleted = lecture?.surveyStatus === "analyzed";

  // タブ定義配列
  const tabs = [
    {
      id: "summary",
      label: "サマリー",
      show: analysisCompleted,
    },
    {
      id: "basic",
      label: "基本統計",
      show: analysisCompleted,
    },
    {
      id: "cross",
      label: "クロス集計",
      show: analysisCompleted,
    },
  ] as const;

  // 表示可能なタブをフィルタリング
  const visibleTabs = tabs.filter((tab) => tab.show);

  if (
    lecture === undefined ||
    responseData === undefined ||
    basicStatistics === undefined ||
    crossAnalysisData === undefined
  ) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (lecture === null) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">講義が見つかりません</p>
        <Link
          href="/lectures"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          講義一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          講義詳細
        </h1>
      </div>

      <div>
        {/* メイン情報 */}
        <div className="flex flex-col">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {lecture.title}
              </h2>
              <div className="mt-3">
                <Link
                  href={`/lectures/${lectureId}/edit`}
                  className="inline-block rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  編集
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="text-gray-700 dark:text-gray-300">
                <p>
                  <strong>講義日時:</strong> {lecture.lectureDate}{" "}
                  {lecture.lectureTime}
                </p>
                <p>
                  <strong>アンケート締切:</strong> {lecture.surveyCloseDate}{" "}
                  {lecture.surveyCloseTime}
                </p>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <div className="mt-2">
                  <div className="mb-2 flex items-center gap-2">
                    <strong>ステータス:</strong>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        lecture.surveyStatus === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : lecture.surveyStatus === "closed"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {lecture.surveyStatus === "active"
                        ? "実施中"
                        : lecture.surveyStatus === "closed"
                          ? "終了"
                          : "分析完了"}
                    </span>
                  </div>
                  <p>
                    <strong>回答件数:</strong>
                    <span className="ml-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                      {responseData.count}件
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {lecture.description && (
              <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                  講義概要
                </h3>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {lecture.description}
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                アクション
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {responseData.count > 0 && (
                  <Link
                    href={`/lectures/${lecture._id}/responses`}
                    className="inline-block rounded bg-blue-600 px-3 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    回答データを確認
                  </Link>
                )}
                {lecture.surveyStatus === "active" && (
                  <Link
                    href={`/survey/${lecture._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded bg-green-600 px-3 py-2 text-center text-sm text-white transition-colors hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    アンケートを開く
                  </Link>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/survey/${lecture._id}`,
                    );
                    alert("URLをコピーしました");
                  }}
                  className="rounded bg-gray-600 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-400"
                >
                  URLをコピー
                </button>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  アンケートURL
                </h4>
                <div className="break-all rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                  {typeof window !== "undefined" &&
                    `${window.location.origin}/survey/${lecture._id}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分析結果セクション */}
      {analysisCompleted && (
        <div className="mt-4">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            分析結果
          </h2>

          {/* タブナビゲーション */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav
              className="-mb-px flex w-full flex-nowrap space-x-8 overflow-x-auto"
              aria-label="Tabs"
            >
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex-shrink-0 whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab.id as TabType)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="mt-6">
            {/* サマリータブ */}
            {activeTab === "summary" && (
              <div>
                <SatisfactionSummary
                  statistics={basicStatistics}
                  isLoading={false}
                />
              </div>
            )}

            {/* 基本統計タブ */}
            {activeTab === "basic" && (
              <div>
                <BasicStatsGrid
                  statistics={basicStatistics}
                  isLoading={false}
                />
              </div>
            )}

            {/* クロス集計タブ */}
            {activeTab === "cross" && (
              <div>
                <CrossAnalysisChartsContainer
                  crossData={crossAnalysisData}
                  isLoading={false}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
