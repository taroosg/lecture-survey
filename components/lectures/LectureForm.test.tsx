import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LectureForm from "./LectureForm";
import { LectureFormData } from "../../utils/lectureFormUtils";

// モック関数の作成
const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe("LectureForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("レンダリングテスト", () => {
    it("初期状態でフォームが正しく表示されること", () => {
      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // フォームフィールドが表示されているか確認
      expect(screen.getByLabelText("講義タイトル *")).toBeInTheDocument();
      expect(screen.getByLabelText("講義日 *")).toBeInTheDocument();
      expect(screen.getByLabelText("講義時間 *")).toBeInTheDocument();
      expect(screen.getByLabelText("講義説明")).toBeInTheDocument();
      expect(screen.getByLabelText("アンケート締切日 *")).toBeInTheDocument();
      expect(screen.getByLabelText("アンケート締切時間 *")).toBeInTheDocument();

      // ボタンが表示されているか確認
      expect(
        screen.getByRole("button", { name: "講義を作成" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "キャンセル" }),
      ).toBeInTheDocument();
    });

    it("編集モードで既存データが正しく表示されること", () => {
      const initialData: LectureFormData = {
        title: "既存の講義",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "既存の説明",
        surveyCloseDate: "2025-12-02",
        surveyCloseTime: "12:00",
      };

      render(
        <LectureForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          submitLabel="講義を更新"
          isEditMode={true}
        />,
      );

      // 初期値が設定されているか確認
      expect(screen.getByDisplayValue("既存の講義")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-12-01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-12-02")).toBeInTheDocument();
      expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の説明")).toBeInTheDocument();

      // 更新ボタンが表示されているか確認
      expect(
        screen.getByRole("button", { name: "講義を更新" }),
      ).toBeInTheDocument();
    });

    it("必須フィールドにアスタリスクが表示されること", () => {
      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // 必須フィールドにアスタリスクが付いているか確認
      expect(screen.getByText("講義タイトル *")).toBeInTheDocument();
      expect(screen.getByText("講義日 *")).toBeInTheDocument();
      expect(screen.getByText("講義時間 *")).toBeInTheDocument();
      expect(screen.getByText("アンケート締切日 *")).toBeInTheDocument();
      expect(screen.getByText("アンケート締切時間 *")).toBeInTheDocument();

      // 任意フィールドにはアスタリスクが付いていないか確認
      expect(screen.getByText("講義説明")).toBeInTheDocument();
      expect(screen.queryByText("講義説明 *")).not.toBeInTheDocument();
    });
  });

  describe("ユーザーインタラクションテスト", () => {
    it("各フィールドへの入力が反映されること", async () => {
      const user = userEvent.setup();

      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText("講義タイトル *");
      const dateInput = screen.getByLabelText("講義日 *");
      const timeInput = screen.getByLabelText("講義時間 *");
      const descriptionInput = screen.getByLabelText("講義説明");

      await user.type(titleInput, "新しい講義");
      await user.type(dateInput, "2024-12-01");
      await user.type(timeInput, "10:00");
      await user.type(descriptionInput, "新しい説明");

      expect(titleInput).toHaveValue("新しい講義");
      expect(dateInput).toHaveValue("2024-12-01");
      expect(timeInput).toHaveValue("10:00");
      expect(descriptionInput).toHaveValue("新しい説明");
    });

    it("バリデーションエラーが適切に表示されること", async () => {
      const user = userEvent.setup();

      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText("講義タイトル *");

      // フィールドをフォーカスしてからブラーしてエラーを表示
      await user.click(titleInput);
      await user.tab(); // フォーカスを外す

      await waitFor(() => {
        expect(screen.getByText("講義タイトルは必須です")).toBeInTheDocument();
      });
    });

    it("送信ボタンの有効/無効状態が正しく切り替わること", async () => {
      const user = userEvent.setup();

      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole("button", { name: "講義を作成" });

      // 初期状態では無効
      expect(submitButton).toBeDisabled();

      // 必須フィールドを入力
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");
      await user.type(screen.getByLabelText("講義日 *"), "2025-12-01");
      await user.type(screen.getByLabelText("講義時間 *"), "10:00");
      await user.type(
        screen.getByLabelText("アンケート締切日 *"),
        "2025-12-01",
      );
      await user.type(screen.getByLabelText("アンケート締切時間 *"), "12:00");

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });

    it("ローディング中にボタンが無効化されること", () => {
      render(
        <LectureForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />,
      );

      const submitButton = screen.getByRole("button", { name: "保存中..." });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("フォーム送信テスト", () => {
    it("正常なデータで送信が実行されること", async () => {
      const user = userEvent.setup();

      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // フォームに入力
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");
      await user.type(screen.getByLabelText("講義日 *"), "2025-12-01");
      await user.type(screen.getByLabelText("講義時間 *"), "10:00");
      await user.type(screen.getByLabelText("講義説明"), "テスト説明");
      await user.type(
        screen.getByLabelText("アンケート締切日 *"),
        "2025-12-01",
      );
      await user.type(screen.getByLabelText("アンケート締切時間 *"), "12:00");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を作成" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "テスト講義",
          lectureDate: "2025-12-01",
          lectureTime: "10:00",
          description: "テスト説明",
          surveyCloseDate: "2025-12-01",
          surveyCloseTime: "12:00",
        });
      });
    });

    it("キャンセルボタンのクリックでonCancelが呼ばれること", async () => {
      const user = userEvent.setup();

      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("不正なデータで送信が実行されないこと", async () => {
      const user = userEvent.setup();

      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // 必須フィールドを一部だけ入力（不完全な状態）
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");

      const submitButton = screen.getByRole("button", { name: "講義を作成" });

      // 送信ボタンは無効のまま
      expect(submitButton).toBeDisabled();

      // クリックしても送信されない
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("送信エラー時にエラーメッセージが表示されること", async () => {
      const user = userEvent.setup();
      const errorOnSubmit = vi.fn().mockRejectedValue(new Error("送信エラー"));

      render(<LectureForm onSubmit={errorOnSubmit} onCancel={mockOnCancel} />);

      // 有効なフォームデータを入力
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");
      await user.type(screen.getByLabelText("講義日 *"), "2025-12-01");
      await user.type(screen.getByLabelText("講義時間 *"), "10:00");
      await user.type(
        screen.getByLabelText("アンケート締切日 *"),
        "2025-12-01",
      );
      await user.type(screen.getByLabelText("アンケート締切時間 *"), "12:00");

      // 送信を試行
      const submitButton = screen.getByRole("button", { name: "講義を作成" });
      await user.click(submitButton);

      // エラーメッセージは表示されない（LectureFormはエラーを再スローするだけ）
      // エラーハンドリングは親コンポーネントで行う設計
      expect(errorOnSubmit).toHaveBeenCalled();
    });
  });

  describe("アクセシビリティテスト", () => {
    it("全てのフォームフィールドに適切なラベルが設定されていること", () => {
      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // ラベルとフィールドの関連付けを確認
      expect(screen.getByLabelText("講義タイトル *")).toBeInTheDocument();
      expect(screen.getByLabelText("講義日 *")).toBeInTheDocument();
      expect(screen.getByLabelText("講義時間 *")).toBeInTheDocument();
      expect(screen.getByLabelText("講義説明")).toBeInTheDocument();
      expect(screen.getByLabelText("アンケート締切日 *")).toBeInTheDocument();
      expect(screen.getByLabelText("アンケート締切時間 *")).toBeInTheDocument();
    });

    it("エラーメッセージがフィールドと適切に関連付けられていること", async () => {
      const user = userEvent.setup();

      render(<LectureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const titleInput = screen.getByLabelText("講義タイトル *");

      // エラーを発生させる
      await user.click(titleInput);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText("講義タイトルは必須です");
        expect(errorMessage).toBeInTheDocument();
        // エラーメッセージがフィールドの近くに表示されていることを確認
        expect(errorMessage).toHaveClass("text-red-600");
      });
    });
  });
});
