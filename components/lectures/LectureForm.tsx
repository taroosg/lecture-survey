"use client";

import { useState, useEffect } from "react";
import {
  LectureFormData,
  FormErrors,
  validateLectureForm,
  isFormValid,
  getFormSubmitData,
} from "../../utils/lectureFormUtils";

interface LectureFormProps {
  initialData?: Partial<LectureFormData>;
  onSubmit: (data: LectureFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export default function LectureForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "講義を作成",
  isLoading = false,
  isEditMode = false,
}: LectureFormProps) {
  const [formData, setFormData] = useState<LectureFormData>({
    title: initialData.title || "",
    lectureDate: initialData.lectureDate || "",
    lectureTime: initialData.lectureTime || "",
    description: initialData.description || "",
    surveyCloseDate: initialData.surveyCloseDate || "",
    surveyCloseTime: initialData.surveyCloseTime || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // フォームデータが変更されたときにバリデーションを実行
  useEffect(() => {
    const validation = validateLectureForm(formData, isEditMode);
    setErrors(validation.errors);
  }, [formData, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 全フィールドをtouchedにする
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setTouched(allTouched);

    const validation = validateLectureForm(formData, isEditMode);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const submitData = getFormSubmitData(formData);
      await onSubmit(submitData);
    } catch (error) {
      console.error("講義の保存に失敗しました:", error);
      setErrors({
        general: "講義の保存に失敗しました。もう一度お試しください。",
      });
    }
  };

  const formIsValid = isFormValid(formData, isEditMode);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">
            {errors.general}
          </p>
        </div>
      )}

      {/* 講義タイトル */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          講義タイトル *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
          placeholder="例: プログラミング入門講座"
        />
        {touched.title && errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title}
          </p>
        )}
      </div>

      {/* 講義日時 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="lectureDate"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            講義日 *
          </label>
          <input
            type="date"
            id="lectureDate"
            name="lectureDate"
            required
            value={formData.lectureDate}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
          />
          {touched.lectureDate && errors.lectureDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.lectureDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lectureTime"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            講義時間 *
          </label>
          <input
            type="time"
            id="lectureTime"
            name="lectureTime"
            required
            value={formData.lectureTime}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
          />
          {touched.lectureTime && errors.lectureTime && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.lectureTime}
            </p>
          )}
        </div>
      </div>

      {/* 講義説明 */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          講義説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
          placeholder="講義の内容や目的について簡単に説明してください（任意）"
        />
        {touched.description && errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description}
          </p>
        )}
      </div>

      {/* アンケート締切日時 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="surveyCloseDate"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            アンケート締切日 *
          </label>
          <input
            type="date"
            id="surveyCloseDate"
            name="surveyCloseDate"
            required
            value={formData.surveyCloseDate}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
          />
          {touched.surveyCloseDate && errors.surveyCloseDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.surveyCloseDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="surveyCloseTime"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            アンケート締切時間 *
          </label>
          <input
            type="time"
            id="surveyCloseTime"
            name="surveyCloseTime"
            required
            value={formData.surveyCloseTime}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
          />
          {touched.surveyCloseTime && errors.surveyCloseTime && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.surveyCloseTime}
            </p>
          )}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={!formIsValid || isLoading}
          className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isLoading ? "保存中..." : submitLabel}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-400"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
