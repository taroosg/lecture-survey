"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect, use } from "react";
import {
  GENDER_OPTIONS,
  AGE_GROUP_OPTIONS,
  UNDERSTANDING_OPTIONS,
  SATISFACTION_OPTIONS,
} from "../../../lib/questionSets";

export default function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const lectureId = resolvedParams.id as Id<"lectures">;

  const surveyCheck = useQuery(api.api.responses.checkSurveyAvailable, {
    lectureId,
  });
  const submitResponse = useMutation(api.api.responses.submitResponse);

  const [formData, setFormData] = useState({
    gender: "",
    ageGroup: "",
    understanding: 0,
    satisfaction: 0,
    freeComment: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // IPアドレス取得（簡易版）
  const [userInfo, setUserInfo] = useState({
    userAgent: "",
    ipAddress: "",
  });

  useEffect(() => {
    setUserInfo({
      userAgent: navigator.userAgent,
      ipAddress: "", // 実際の実装では別途IP取得APIを使用
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 必須項目のバリデーション
    const requiredFields = [
      { field: "gender", name: "性別" },
      { field: "ageGroup", name: "年代" },
    ];

    for (const { field, name } of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert(`${name}を選択してください`);
        return;
      }
    }

    if (formData.understanding === 0) {
      alert("理解度を選択してください");
      return;
    }

    if (formData.satisfaction === 0) {
      alert("満足度を選択してください");
      return;
    }

    setLoading(true);

    try {
      await submitResponse({
        lectureId,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        understanding: formData.understanding,
        satisfaction: formData.satisfaction,
        freeComment: formData.freeComment || undefined,
        userAgent: userInfo.userAgent,
        ipAddress: userInfo.ipAddress || undefined,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("回答送信エラー:", error);
      alert(`回答送信に失敗しました: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // ローディング状態
  if (surveyCheck === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // アンケート利用不可
  if (!surveyCheck.available) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              アンケートをご利用いただけません
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {surveyCheck.reason}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 回答完了画面
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                回答ありがとうございました
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                アンケートの回答が正常に送信されました。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // アンケートフォーム
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
          {/* ヘッダー */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              講義評価アンケート
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>講義:</strong> {surveyCheck.lecture?.title}
              </p>
              <p>
                <strong>日時:</strong> {surveyCheck.lecture?.lectureDate}{" "}
                {surveyCheck.lecture?.lectureTime}
              </p>
              {surveyCheck.lecture?.description && (
                <p>
                  <strong>説明:</strong> {surveyCheck.lecture?.description}
                </p>
              )}
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* 性別 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                性別を教えてください *
              </label>
              <div className="space-y-2">
                {GENDER_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 年代 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                年代を教えてください *
              </label>
              <div className="space-y-2">
                {AGE_GROUP_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="ageGroup"
                      value={option.value}
                      checked={formData.ageGroup === option.value}
                      onChange={(e) => handleChange("ageGroup", e.target.value)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 理解度 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                講義内容の理解度を5段階で評価してください *
              </label>
              <div className="flex flex-wrap gap-3">
                {UNDERSTANDING_OPTIONS.map(({ value: rating, label }) => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name="understanding"
                      value={rating}
                      checked={formData.understanding === Number(rating)}
                      onChange={(e) =>
                        handleChange("understanding", parseInt(e.target.value))
                      }
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 満足度 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                講義の満足度を5段階で評価してください *
              </label>
              <div className="flex flex-wrap gap-3">
                {SATISFACTION_OPTIONS.map(({ value: rating, label }) => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name="satisfaction"
                      value={rating}
                      checked={formData.satisfaction === Number(rating)}
                      onChange={(e) =>
                        handleChange("satisfaction", parseInt(e.target.value))
                      }
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* フリーコメント */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                今回の講義について、ご意見・ご感想がございましたら自由にお書きください（任意）
              </label>
              <textarea
                name="freeComment"
                value={formData.freeComment}
                onChange={(e) => handleChange("freeComment", e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
                placeholder="ご自由にお書きください..."
              />
            </div>

            {/* 送信ボタン */}
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {loading ? "送信中..." : "回答を送信"}
              </button>
            </div>
          </form>
        </div>

        {/* フッター */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            このアンケートは匿名で実施されます。個人を特定する情報は収集いたしません。
          </p>
        </div>
      </div>
    </div>
  );
}
