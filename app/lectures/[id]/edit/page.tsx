"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import LectureForm from "../../../../components/lectures/LectureForm";
import { LectureFormData } from "../../../../utils/lectureFormUtils";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EditLecturePage() {
  const router = useRouter();
  const params = useParams();
  const lectureId = params.id as Id<"lectures">;

  const lecture = useQuery(api.api.lectures.getLecture, {
    lectureId,
  });
  const updateLecture = useMutation(api.api.lectures.updateExistingLecture);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: LectureFormData) => {
    setIsLoading(true);

    try {
      const updatedLecture = await updateLecture({
        lectureId,
        title: formData.title,
        lectureDate: formData.lectureDate,
        lectureTime: formData.lectureTime,
        description: formData.description,
        surveyCloseDate: formData.surveyCloseDate,
        surveyCloseTime: formData.surveyCloseTime,
      });

      if (updatedLecture) {
        // 更新成功時は講義一覧画面に遷移
        // TODO: 詳細画面が作成されたらそちらに遷移
        router.push("/lectures");
      } else {
        throw new Error("講義の更新に失敗しました");
      }
    } catch (error) {
      console.error("講義更新エラー:", error);
      throw error; // LectureFormでエラーハンドリング
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/lectures");
  };

  // ローディング状態
  if (lecture === undefined) {
    return (
      <main className="container mx-auto min-h-screen bg-gray-50 p-8 pt-24 dark:bg-gray-900">
        <div className="py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </main>
    );
  }

  // 講義が見つからない場合
  if (lecture === null) {
    return (
      <main className="container mx-auto min-h-screen bg-gray-50 p-8 pt-24 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <Link
              href="/lectures"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              ← 講義一覧に戻る
            </Link>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-700 dark:bg-red-900/20">
            <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              講義が見つかりません
            </h1>
            <p className="text-red-600 dark:text-red-400">
              指定された講義が存在しないか、アクセス権限がありません。
            </p>
          </div>
        </div>
      </main>
    );
  }

  // 初期データを準備
  const initialData: LectureFormData = {
    title: lecture.title,
    lectureDate: lecture.lectureDate,
    lectureTime: lecture.lectureTime,
    description: lecture.description || "",
    surveyCloseDate: lecture.surveyCloseDate,
    surveyCloseTime: lecture.surveyCloseTime,
  };

  return (
    <main className="container mx-auto min-h-screen bg-gray-50 p-8 pt-24 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/lectures"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← 講義一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            講義を編集
          </h1>
        </div>

        {/* 講義の状態表示 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                現在の状態
              </p>
              <p className="font-medium">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    lecture.surveyStatus === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {lecture.surveyStatus === "active" ? "受付中" : "締切済み"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                アンケートURL
              </p>
              <p className="text-sm font-mono text-blue-600 dark:text-blue-400">
                /survey/{lecture._id}
              </p>
            </div>
          </div>
        </div>

        <LectureForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="講義を更新"
          isLoading={isLoading}
          isEditMode={true}
        />
      </div>
    </main>
  );
}
