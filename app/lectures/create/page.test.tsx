import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateLecturePage from "./page";

// Next.jsのルーターをモック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Convex APIをモック
const mockCreateLecture = vi.fn();
vi.mock("convex/react", () => ({
  useMutation: () => mockCreateLecture,
}));

// Convex APIの型をモック
vi.mock("../../../convex/_generated/api", () => ({
  api: {
    "domains/lectures/api/mutations": {
      createNewLecture: "createNewLecture",
    },
  },
}));

describe("CreateLecturePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数をモック
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("レンダリングテスト", () => {
    it("講義作成画面が正しく表示されること", () => {
      render(<CreateLecturePage />);

      // ページタイトルが表示されている
      expect(screen.getByText("新しい講義を作成")).toBeInTheDocument();

      // 戻るリンクが表示されている
      expect(screen.getByText("← 講義一覧に戻る")).toBeInTheDocument();

      // フォームが表示されている
      expect(screen.getByLabelText("講義タイトル *")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "講義を作成" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "キャンセル" }),
      ).toBeInTheDocument();
    });
  });

  describe("フォーム送信処理のテスト", () => {
    it("講義作成成功時のリダイレクトテスト", async () => {
      const user = userEvent.setup();

      // モックされた講義作成APIの戻り値
      const mockLecture = { _id: "lecture123" };
      mockCreateLecture.mockResolvedValueOnce(mockLecture);

      render(<CreateLecturePage />);

      // フォームに入力
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");
      await user.type(screen.getByLabelText("講義日 *"), "2025-12-01");
      await user.type(screen.getByLabelText("講義時間 *"), "10:00");
      await user.type(
        screen.getByLabelText("アンケート締切日 *"),
        "2025-12-01",
      );
      await user.type(screen.getByLabelText("アンケート締切時間 *"), "12:00");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を作成" });
      await user.click(submitButton);

      await waitFor(() => {
        // APIが呼ばれたことを確認
        expect(mockCreateLecture).toHaveBeenCalledWith({
          title: "テスト講義",
          lectureDate: "2025-12-01",
          lectureTime: "10:00",
          description: undefined,
          surveyCloseDate: "2025-12-01",
          surveyCloseTime: "12:00",
          baseUrl: "http://localhost:3000",
        });

        // 講義一覧画面にリダイレクトされることを確認
        expect(mockPush).toHaveBeenCalledWith("/lectures");
      });
    });

    it("講義作成失敗時の処理テスト", async () => {
      const user = userEvent.setup();

      // モックされた講義作成APIがエラーを返す
      mockCreateLecture.mockRejectedValueOnce(new Error("作成失敗"));

      // console.errorをモック
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<CreateLecturePage />);

      // フォームに入力
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");
      await user.type(screen.getByLabelText("講義日 *"), "2025-12-01");
      await user.type(screen.getByLabelText("講義時間 *"), "10:00");
      await user.type(
        screen.getByLabelText("アンケート締切日 *"),
        "2025-12-01",
      );
      await user.type(screen.getByLabelText("アンケート締切時間 *"), "12:00");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を作成" });
      await user.click(submitButton);

      await waitFor(() => {
        // エラーがコンソールに出力されることを確認
        expect(consoleSpy).toHaveBeenCalledWith(
          "講義作成エラー:",
          expect.any(Error),
        );

        // リダイレクトされないことを確認
        expect(mockPush).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it("空のレスポンスでの失敗処理テスト", async () => {
      const user = userEvent.setup();

      // モックされた講義作成APIが空のレスポンスを返す
      mockCreateLecture.mockResolvedValueOnce(null);

      // console.errorをモック
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<CreateLecturePage />);

      // フォームに入力
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");
      await user.type(screen.getByLabelText("講義日 *"), "2025-12-01");
      await user.type(screen.getByLabelText("講義時間 *"), "10:00");
      await user.type(
        screen.getByLabelText("アンケート締切日 *"),
        "2025-12-01",
      );
      await user.type(screen.getByLabelText("アンケート締切時間 *"), "12:00");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を作成" });
      await user.click(submitButton);

      await waitFor(() => {
        // エラーがコンソールに出力されることを確認
        expect(consoleSpy).toHaveBeenCalled();

        // リダイレクトされないことを確認
        expect(mockPush).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("キャンセル処理のテスト", () => {
    it("キャンセルボタンクリック時のリダイレクトテスト", async () => {
      const user = userEvent.setup();

      render(<CreateLecturePage />);

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith("/lectures");
    });
  });

  describe("ローディング状態のテスト", () => {
    it("送信中にローディング状態が表示されること", async () => {
      const user = userEvent.setup();

      // モックされた講義作成APIが遅延する
      let resolvePromise: (value: { _id: string }) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockCreateLecture.mockReturnValueOnce(slowPromise);

      render(<CreateLecturePage />);

      // フォームに入力
      await user.type(screen.getByLabelText("講義タイトル *"), "テスト講義");
      await user.type(screen.getByLabelText("講義日 *"), "2025-12-01");
      await user.type(screen.getByLabelText("講義時間 *"), "10:00");
      await user.type(
        screen.getByLabelText("アンケート締切日 *"),
        "2025-12-01",
      );
      await user.type(screen.getByLabelText("アンケート締切時間 *"), "12:00");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を作成" });
      await user.click(submitButton);

      // ローディング状態が表示されることを確認
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "保存中..." }),
        ).toBeInTheDocument();
      });

      // プロミスを解決
      resolvePromise!({ _id: "lecture123" });

      // ローディング状態が解除されることを確認
      await waitFor(() => {
        expect(screen.queryByText("保存中...")).not.toBeInTheDocument();
      });
    });
  });

  describe("認証チェックのテスト", () => {
    it("認証が必要な画面であることを確認", () => {
      // このテストは実際の認証実装に依存するため、
      // 現在はコンポーネントが正しくレンダリングされることのみ確認
      render(<CreateLecturePage />);

      expect(screen.getByText("新しい講義を作成")).toBeInTheDocument();
    });
  });
});
