"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useState } from "react";
import LectureForm from "../../../../components/lectures/LectureForm";
import { LectureFormData } from "../../../../utils/lectureFormUtils";
import { Id } from "../../../../convex/_generated/dataModel";
import { Breadcrumb } from "../../../../components/common/Breadcrumb";
import { useBreadcrumbForPath } from "../../../../lib/breadcrumb";
import { DeleteConfirmationModal } from "../../../../components/common/DeleteConfirmationModal";

export default function EditLecturePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const lectureId = params.id as Id<"lectures">;

  const lecture = useQuery(api.api.lectures.getLecture, {
    lectureId,
  });
  const updateLecture = useMutation(api.api.lectures.updateExistingLecture);
  const deleteLecture = useMutation(api.api.lectures.removeLecture);
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // パンくずリスト用データ
  const breadcrumbItems = useBreadcrumbForPath(pathname, {
    lectureTitle: lecture?.title,
    lectureId,
  });

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

  const handleDeleteLecture = async () => {
    try {
      setDeleting(true);
      await deleteLecture({ lectureId });
      router.push("/lectures");
    } catch (error) {
      console.error("講義削除エラー:", error);
      alert("講義削除に失敗しました");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  // ローディング状態
  if (lecture === undefined) {
    return (
      <main className="p-8 flex flex-col gap-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="py-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  // 講義が見つからない場合
  if (lecture === null) {
    return (
      <main className="p-8 flex flex-col gap-8">
        <div className="max-w-4xl mx-auto w-full">
          <Breadcrumb items={breadcrumbItems} />
          <h2 className="text-3xl font-bold text-center mb-8">講義を編集</h2>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-700 dark:bg-red-900/20">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              講義が見つかりません
            </h3>
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

  // 削除可能条件の判定
  const canDelete = lecture.surveyStatus === "closed";

  return (
    <main className="p-8 flex flex-col gap-8">
      <div className="max-w-4xl mx-auto w-full">
        <Breadcrumb items={breadcrumbItems} />
        <h2 className="text-3xl font-bold text-center mb-8">講義を編集</h2>

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

        {/* Danger Zone */}
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Danger Zone
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              以下の操作は元に戻すことができません。慎重に操作してください。
            </p>
          </div>

          <div className="rounded border border-red-300 bg-white p-4 dark:border-red-700 dark:bg-red-900">
            <h4 className="font-medium text-red-900 dark:text-red-100">
              この講義を削除
            </h4>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              講義を削除すると、以下のデータもすべて削除されます：
            </p>
            <ul className="mt-2 ml-5 list-disc text-sm text-red-700 dark:text-red-300">
              <li>アンケート回答データ</li>
              <li>分析結果データ</li>
              <li>関連する履歴データ</li>
            </ul>
            <p className="mt-2 text-sm font-semibold text-red-800 dark:text-red-200">
              ⚠️
              この操作は取り消すことができません。削除されたデータは復旧できません。
            </p>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              disabled={!canDelete}
              className="mt-4 rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              title={!canDelete ? "アクティブな講義は削除できません" : ""}
            >
              この講義を削除
            </button>

            {!canDelete && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                アクティブな講義は削除できません。
              </p>
            )}
          </div>
        </div>

        {/* 削除確認モーダル */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteLecture}
          lectureTitle={lecture.title}
          lectureId={lectureId}
          isDeleting={deleting}
        />
      </div>
    </main>
  );
}
