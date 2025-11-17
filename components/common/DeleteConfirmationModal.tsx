"use client";

import React, { useState } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  lectureTitle: string;
  lectureId: string;
  isDeleting: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  lectureTitle,
  lectureId,
  isDeleting,
}: DeleteConfirmationModalProps) {
  const [step, setStep] = useState(1);
  const [titleInput, setTitleInput] = useState("");
  const [showTitleMismatchError, setShowTitleMismatchError] = useState(false);

  const handleClose = () => {
    if (isDeleting) return;
    setStep(1);
    setTitleInput("");
    setShowTitleMismatchError(false);
    onClose();
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (titleInput.trim() === lectureTitle.trim()) {
        setShowTitleMismatchError(false);
        setStep(3);
      } else {
        setShowTitleMismatchError(true);
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error("削除エラー:", error);
      // エラーは親コンポーネントで処理される
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* ステップ1: 初期確認 */}
        {step === 1 && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                講義の削除確認
              </h3>
            </div>
            <div className="mb-6">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                以下の講義を削除しようとしています：
              </p>
              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {lectureTitle}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {lectureId}
                </p>
              </div>
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                削除の影響について詳細を確認してください。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                キャンセル
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                影響を確認する
              </button>
            </div>
          </>
        )}

        {/* ステップ2: 影響説明 & 講義名確認入力 */}
        {step === 2 && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                削除による影響
              </h3>
            </div>
            <div className="mb-6">
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-950">
                <h4 className="mb-3 font-medium text-red-900 dark:text-red-100">
                  以下のデータが完全に削除されます
                </h4>
                <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                  <li>• アンケート回答データ（すべての回答者データ）</li>
                  <li>• 分析結果データ（統計情報など）</li>
                  <li>• 関連する履歴データ</li>
                </ul>
                <p className="mt-3 text-sm font-semibold text-red-900 dark:text-red-100">
                  この操作は取り消すことができません。削除されたデータは復旧できません。
                </p>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="confirmTitle"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  削除を確認するため、講義タイトルを入力してください：
                </label>
                <div className="mb-2 rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-700">
                  <code className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {lectureTitle}
                  </code>
                </div>
                <input
                  id="confirmTitle"
                  type="text"
                  value={titleInput}
                  onChange={(e) => {
                    setTitleInput(e.target.value);
                    setShowTitleMismatchError(false);
                  }}
                  placeholder="講義タイトルを正確に入力してください"
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    showTitleMismatchError
                      ? "border-red-300 bg-red-50 focus:ring-red-500 dark:border-red-600 dark:bg-red-950 dark:focus:ring-red-400"
                      : "border-gray-300 bg-white focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-400"
                  } text-gray-900 dark:text-gray-100`}
                />
                {showTitleMismatchError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    講義タイトルが一致しません。正確に入力してください。
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                戻る
              </button>
              <button
                onClick={handleNextStep}
                disabled={!titleInput.trim()}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
              >
                次へ
              </button>
            </div>
          </>
        )}

        {/* ステップ3: 最終確認 */}
        {step === 3 && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                最終確認
              </h3>
            </div>
            <div className="mb-6">
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-950">
                <p className="text-sm text-red-900 dark:text-red-100">
                  <strong>講義「{lectureTitle}」</strong>を削除しますか？
                </p>
                <p className="mt-2 text-xs text-red-800 dark:text-red-200">
                  この操作は即座に実行され、元に戻すことはできません。
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={isDeleting}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                戻る
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
              >
                {isDeleting ? "削除中..." : "削除を実行"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
