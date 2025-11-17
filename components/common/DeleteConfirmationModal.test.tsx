import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

describe("DeleteConfirmationModal", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  const lectureTitle = "React基礎講義";
  const lectureId = "lecture123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("表示テスト", () => {
    it("isOpenがfalseの場合は何も表示しない", () => {
      const { container } = render(
        <DeleteConfirmationModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("isOpenがtrueの場合はステップ1を表示", () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );
      expect(screen.getByText("講義の削除確認")).toBeInTheDocument();
      expect(screen.getByText(lectureTitle)).toBeInTheDocument();
      expect(screen.getByText(`ID: ${lectureId}`)).toBeInTheDocument();
    });
  });

  describe("ステップ1: 初期確認", () => {
    it("キャンセルボタンでモーダルを閉じる", async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it("影響を確認するボタンでステップ2に進む", async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );

      const nextButton = screen.getByRole("button", {
        name: "影響を確認する",
      });
      await user.click(nextButton);

      expect(screen.getByText("削除による影響")).toBeInTheDocument();
      expect(
        screen.getByText("以下のデータが完全に削除されます"),
      ).toBeInTheDocument();
    });
  });

  describe("ステップ2: 影響説明と講義タイトル確認", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );
      const nextButton = screen.getByRole("button", {
        name: "影響を確認する",
      });
      await user.click(nextButton);
    });

    it("削除影響が表示される", () => {
      expect(
        screen.getByText("アンケート回答データ（すべての回答者データ）", {
          exact: false,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("分析結果データ（統計情報など）", { exact: false }),
      ).toBeInTheDocument();
    });

    it("戻るボタンでステップ1に戻る", async () => {
      const user = userEvent.setup();
      const backButton = screen.getByRole("button", { name: "戻る" });
      await user.click(backButton);

      expect(screen.getByText("講義の削除確認")).toBeInTheDocument();
    });

    it("講義タイトルが一致しない場合はエラーを表示", async () => {
      const user = userEvent.setup();
      const input =
        screen.getByPlaceholderText("講義タイトルを正確に入力してください");
      await user.type(input, "間違ったタイトル");

      const nextButton = screen.getByRole("button", { name: "次へ" });
      await user.click(nextButton);

      expect(
        screen.getByText(
          "講義タイトルが一致しません。正確に入力してください。",
        ),
      ).toBeInTheDocument();
    });

    it("講義タイトルが一致する場合はステップ3に進む", async () => {
      const user = userEvent.setup();
      const input =
        screen.getByPlaceholderText("講義タイトルを正確に入力してください");
      await user.type(input, lectureTitle);

      const nextButton = screen.getByRole("button", { name: "次へ" });
      await user.click(nextButton);

      expect(screen.getByText("最終確認")).toBeInTheDocument();
    });

    it("入力フィールドが空の場合は次へボタンが無効", () => {
      const nextButton = screen.getByRole("button", { name: "次へ" });
      expect(nextButton).toBeDisabled();
    });
  });

  describe("ステップ3: 最終確認", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );
      // ステップ2へ進む
      const nextButton1 = screen.getByRole("button", {
        name: "影響を確認する",
      });
      await user.click(nextButton1);

      // ステップ3へ進む
      const input =
        screen.getByPlaceholderText("講義タイトルを正確に入力してください");
      await user.type(input, lectureTitle);
      const nextButton2 = screen.getByRole("button", { name: "次へ" });
      await user.click(nextButton2);
    });

    it("最終確認メッセージが表示される", () => {
      expect(
        screen.getByText(`講義「${lectureTitle}」`, { exact: false }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "この操作は即座に実行され、元に戻すことはできません。",
        ),
      ).toBeInTheDocument();
    });

    it("戻るボタンでステップ2に戻る", async () => {
      const user = userEvent.setup();
      const backButton = screen.getByRole("button", { name: "戻る" });
      await user.click(backButton);

      expect(screen.getByText("削除による影響")).toBeInTheDocument();
    });

    it("削除を実行ボタンでonConfirmが呼ばれる", async () => {
      const user = userEvent.setup();
      mockOnConfirm.mockResolvedValue(undefined);

      const deleteButton = screen.getByRole("button", { name: "削除を実行" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledOnce();
        expect(mockOnClose).toHaveBeenCalledOnce();
      });
    });

    it("削除中はボタンが無効化される", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );

      // ステップ2へ進む
      const nextButton1 = screen.getByRole("button", {
        name: "影響を確認する",
      });
      await user.click(nextButton1);

      // ステップ3へ進む
      const input =
        screen.getByPlaceholderText("講義タイトルを正確に入力してください");
      await user.click(input);
      await user.paste(lectureTitle);
      const nextButton2 = screen.getByRole("button", { name: "次へ" });
      await user.click(nextButton2);

      // isDeleting=trueで再レンダリング
      rerender(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={true}
        />,
      );

      const deleteButton = screen.getByRole("button", { name: "削除中..." });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe("エラーハンドリング", () => {
    it("削除失敗時はエラーをコンソールに出力", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("削除失敗");
      mockOnConfirm.mockRejectedValue(error);

      render(
        <DeleteConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          lectureTitle={lectureTitle}
          lectureId={lectureId}
          isDeleting={false}
        />,
      );

      // ステップ3まで進む
      const nextButton1 = screen.getByRole("button", {
        name: "影響を確認する",
      });
      await user.click(nextButton1);

      const input =
        screen.getByPlaceholderText("講義タイトルを正確に入力してください");
      await user.type(input, lectureTitle);
      const nextButton2 = screen.getByRole("button", { name: "次へ" });
      await user.click(nextButton2);

      const deleteButton = screen.getByRole("button", { name: "削除を実行" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("削除エラー:", error);
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
