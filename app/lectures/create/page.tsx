"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LectureForm from "../../../components/lectures/LectureForm";
import { LectureFormData } from "../../../utils/lectureFormUtils";

export default function CreateLecturePage() {
  const router = useRouter();
  const createLecture = useMutation(api.api.lectures.createNewLecture);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: LectureFormData) => {
    setIsLoading(true);

    try {
      const newLecture = await createLecture({
        title: formData.title,
        lectureDate: formData.lectureDate,
        lectureTime: formData.lectureTime,
        description: formData.description,
        surveyCloseDate: formData.surveyCloseDate,
        surveyCloseTime: formData.surveyCloseTime,
      });

      if (newLecture?._id) {
        // 作成成功時は講義一覧画面に遷移
        // TODO: 詳細画面が作成されたらそちらに遷移
        router.push("/lectures");
      } else {
        throw new Error("講義の作成に失敗しました");
      }
    } catch (error) {
      console.error("講義作成エラー:", error);
      throw error; // LectureFormでエラーハンドリング
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/lectures");
  };

  return (
    <main className="p-8 flex flex-col gap-8">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-8">
          新しい講義を作成
        </h2>
        <div className="mb-6">
          <Link
            href="/lectures"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← 講義一覧に戻る
          </Link>
        </div>
        <LectureForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="講義を作成"
          isLoading={isLoading}
          isEditMode={false}
        />
      </div>
    </main>
  );
}
