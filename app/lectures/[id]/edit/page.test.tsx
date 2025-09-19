import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditLecturePage from "./page";

// Next.jsのルーターをモック
const mockPush = vi.fn();
const mockParams = { id: "lecture123" };
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

// Convex APIをモック
const mockGetLecture = vi.fn();
const mockUpdateLecture = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: () => mockGetLecture(),
  useMutation: () => mockUpdateLecture,
}));

// Convex APIの型をモック
vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    domains: {
      lectures: {
        api: {
          queries: {
            getLecture: "getLecture",
          },
          mutations: {
            updateExistingLecture: "updateExistingLecture",
          },
        },
      },
    },
  },
}));

// Convex IDの型をモック
vi.mock("../../../../convex/_generated/dataModel", () => ({
  Id: vi.fn(),
}));

describe("EditLecturePage", () => {
  const mockLectureData = {
    _id: "lecture123",
    title: "既存の講義",
    lectureDate: "2025-12-01",
    lectureTime: "10:00",
    description: "既存の説明",
    surveyCloseDate: "2025-12-02",
    surveyCloseTime: "12:00",
    surveyStatus: "active" as const,
    createdBy: "user123",
    organizationName: "テスト組織",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("レンダリングテスト", () => {
    it("ローディング状態が表示されること", () => {
      mockGetLecture.mockReturnValue(undefined);

      render(<EditLecturePage />);

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("講義が見つからない場合のエラー表示", () => {
      mockGetLecture.mockReturnValue(null);

      render(<EditLecturePage />);

      expect(screen.getByText("講義が見つかりません")).toBeInTheDocument();
      expect(
        screen.getByText(
          "指定された講義が存在しないか、アクセス権限がありません。",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("← 講義一覧に戻る")).toBeInTheDocument();
    });

    it("講義データが正常に表示されること", () => {
      mockGetLecture.mockReturnValue(mockLectureData);

      render(<EditLecturePage />);

      // ページタイトルが表示されている
      expect(screen.getByText("講義を編集")).toBeInTheDocument();

      // 戻るリンクが表示されている
      expect(screen.getByText("← 講義一覧に戻る")).toBeInTheDocument();

      // 講義状態が表示されている
      expect(screen.getByText("現在の状態")).toBeInTheDocument();
      expect(screen.getByText("受付中")).toBeInTheDocument();
      expect(screen.getByText("アンケートURL")).toBeInTheDocument();
      expect(
        screen.getByText("https://example.com/survey/abc123"),
      ).toBeInTheDocument();

      // フォームに既存データが設定されている
      expect(screen.getByDisplayValue("既存の講義")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-12-01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-12-02")).toBeInTheDocument();
      expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の説明")).toBeInTheDocument();

      // 更新ボタンが表示されている
      expect(
        screen.getByRole("button", { name: "講義を更新" }),
      ).toBeInTheDocument();
    });

    it("締切済み講義の状態表示テスト", () => {
      const closedLectureData = {
        ...mockLectureData,
        surveyStatus: "closed" as const,
      };
      mockGetLecture.mockReturnValue(closedLectureData);

      render(<EditLecturePage />);

      expect(screen.getByText("締切済み")).toBeInTheDocument();
    });
  });

  describe("フォーム更新処理のテスト", () => {
    it("講義更新成功時のリダイレクトテスト", async () => {
      const user = userEvent.setup();
      mockGetLecture.mockReturnValue(mockLectureData);
      mockUpdateLecture.mockResolvedValueOnce({
        ...mockLectureData,
        title: "更新された講義",
      });

      render(<EditLecturePage />);

      // タイトルを変更
      const titleInput = screen.getByDisplayValue("既存の講義");
      await user.clear(titleInput);
      await user.type(titleInput, "更新された講義");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を更新" });
      await user.click(submitButton);

      await waitFor(() => {
        // APIが呼ばれたことを確認
        expect(mockUpdateLecture).toHaveBeenCalledWith({
          lectureId: "lecture123",
          title: "更新された講義",
          lectureDate: "2025-12-01",
          lectureTime: "10:00",
          description: "既存の説明",
          surveyCloseDate: "2025-12-02",
          surveyCloseTime: "12:00",
        });

        // 講義一覧画面にリダイレクトされることを確認
        expect(mockPush).toHaveBeenCalledWith("/lectures");
      });
    });

    it("講義更新失敗時の処理テスト", async () => {
      const user = userEvent.setup();
      mockGetLecture.mockReturnValue(mockLectureData);
      mockUpdateLecture.mockRejectedValueOnce(new Error("更新失敗"));

      // console.errorをモック
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<EditLecturePage />);

      // タイトルを変更
      const titleInput = screen.getByDisplayValue("既存の講義");
      await user.clear(titleInput);
      await user.type(titleInput, "更新された講義");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を更新" });
      await user.click(submitButton);

      await waitFor(() => {
        // エラーがコンソールに出力されることを確認
        expect(consoleSpy).toHaveBeenCalledWith(
          "講義更新エラー:",
          expect.any(Error),
        );

        // リダイレクトされないことを確認
        expect(mockPush).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it("空のレスポンスでの失敗処理テスト", async () => {
      const user = userEvent.setup();
      mockGetLecture.mockReturnValue(mockLectureData);
      mockUpdateLecture.mockResolvedValueOnce(null);

      // console.errorをモック
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<EditLecturePage />);

      // タイトルを変更
      const titleInput = screen.getByDisplayValue("既存の講義");
      await user.clear(titleInput);
      await user.type(titleInput, "更新された講義");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を更新" });
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
      mockGetLecture.mockReturnValue(mockLectureData);

      render(<EditLecturePage />);

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith("/lectures");
    });
  });

  describe("ローディング状態のテスト", () => {
    it("送信中にローディング状態が表示されること", async () => {
      const user = userEvent.setup();
      mockGetLecture.mockReturnValue(mockLectureData);

      // モックされた講義更新APIが遅延する
      let resolvePromise: (value: typeof mockLectureData) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockUpdateLecture.mockReturnValueOnce(slowPromise);

      render(<EditLecturePage />);

      // タイトルを変更
      const titleInput = screen.getByDisplayValue("既存の講義");
      await user.clear(titleInput);
      await user.type(titleInput, "更新された講義");

      // 送信ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "講義を更新" });
      await user.click(submitButton);

      // ローディング状態が表示されることを確認
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "保存中..." }),
        ).toBeInTheDocument();
      });

      // プロミスを解決
      resolvePromise!({ ...mockLectureData, title: "更新された講義" });

      // ローディング状態が解除されることを確認
      await waitFor(() => {
        expect(screen.queryByText("保存中...")).not.toBeInTheDocument();
      });
    });
  });

  describe("権限チェックのテスト", () => {
    it("講義データ取得テスト", () => {
      mockGetLecture.mockReturnValue(mockLectureData);

      render(<EditLecturePage />);

      // 講義データが正しく表示されていることを確認
      expect(screen.getByDisplayValue("既存の講義")).toBeInTheDocument();
    });
  });

  describe("初期データ設定のテスト", () => {
    it("講義データがフォームの初期値として正しく設定されること", () => {
      const lectureWithOptionalDescription = {
        ...mockLectureData,
        description: undefined,
      };
      mockGetLecture.mockReturnValue(lectureWithOptionalDescription);

      render(<EditLecturePage />);

      // 説明が空文字として設定されることを確認
      const descriptionField = screen.getByLabelText("講義説明");
      expect(descriptionField).toHaveValue("");
    });

    it("完全な講義データがフォームに設定されること", () => {
      mockGetLecture.mockReturnValue(mockLectureData);

      render(<EditLecturePage />);

      // 全てのフィールドが正しく設定されている
      expect(screen.getByDisplayValue("既存の講義")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-12-01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-12-02")).toBeInTheDocument();
      expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の説明")).toBeInTheDocument();
    });
  });
});
