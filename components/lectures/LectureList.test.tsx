import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LectureList } from "./LectureList";
import { Doc, Id } from "../../convex/_generated/dataModel";
import * as convexReact from "convex/react";

// Convex のモック
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// LectureCard のモック
interface LectureCardProps {
  lecture: Doc<"lectures">;
  onCloseSurvey: (lectureId: string) => Promise<void>;
  onDeleteLecture: (lectureId: string) => Promise<void>;
  loading: string | null;
}

vi.mock("./LectureCard", () => ({
  LectureCard: ({
    lecture,
    onCloseSurvey,
    onDeleteLecture,
    loading,
  }: LectureCardProps) => (
    <div data-testid={`lecture-card-${lecture._id}`}>
      <h3>{lecture.title}</h3>
      <span>{lecture.surveyStatus}</span>
      <button onClick={() => onCloseSurvey(lecture._id)}>アンケート終了</button>
      <button onClick={() => onDeleteLecture(lecture._id)}>削除</button>
      {loading === `close-${lecture._id}` && <span>closing...</span>}
    </div>
  ),
}));

// テスト用のモックデータ
const mockLectures: Doc<"lectures">[] = [
  {
    _id: "1" as Id<"lectures">,
    title: "React基礎講義",
    lectureDate: "2024-01-15",
    lectureTime: "10:00",
    description: "Reactの基本的な使い方を学ぶ",
    surveyCloseDate: "2024-01-16",
    surveyCloseTime: "18:00",
    surveyStatus: "active",
    createdBy: "user1" as Id<"users">,
    createdAt: 1705200000000,
    updatedAt: 1705200000000,
  },
  {
    _id: "2" as Id<"lectures">,
    title: "Vue.js応用講義",
    lectureDate: "2024-01-20",
    lectureTime: "14:00",
    description: "Vue.jsの応用的な機能を学ぶ",
    surveyCloseDate: "2024-01-21",
    surveyCloseTime: "18:00",
    surveyStatus: "closed",
    createdBy: "user1" as Id<"users">,
    createdAt: 1705600000000,
    updatedAt: 1705600000000,
  },
  {
    _id: "3" as Id<"lectures">,
    title: "JavaScript基礎",
    lectureDate: "2024-01-10",
    lectureTime: "09:00",
    description: "JavaScriptの基本を学ぶ",
    surveyCloseDate: "2024-01-11",
    surveyCloseTime: "18:00",
    surveyStatus: "active",
    createdBy: "user1" as Id<"users">,
    createdAt: 1705000000000,
    updatedAt: 1705000000000,
  },
];

const mockCloseSurvey = vi.fn();
const mockDeleteLecture = vi.fn();
const mockUseQuery = vi.mocked(convexReact.useQuery);
const mockUseMutation = vi.mocked(convexReact.useMutation);

// グローバルオブジェクトのモック
global.confirm = vi.fn().mockReturnValue(true);
global.alert = vi.fn();

describe("LectureList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 最初のuseMutation呼び出し（updateLecture）にはmockCloseSurveyを返し、
    // 2番目の呼び出し（deleteLecture）にはmockDeleteLectureを返す
    mockUseMutation
      .mockReturnValueOnce(mockCloseSurvey)
      .mockReturnValueOnce(mockDeleteLecture);
  });

  afterEach(() => {
    cleanup();
  });

  describe("リスト表示テスト", () => {
    it("講義データが正しく一覧表示されること", () => {
      mockUseQuery.mockReturnValue(mockLectures);

      render(<LectureList />);

      expect(screen.getByText("講義管理")).toBeInTheDocument();
      expect(screen.getByText("React基礎講義")).toBeInTheDocument();
      expect(screen.getByText("Vue.js応用講義")).toBeInTheDocument();
      expect(screen.getByText("JavaScript基礎")).toBeInTheDocument();
    });

    it("空状態の表示テスト", () => {
      mockUseQuery.mockReturnValue([]);

      render(<LectureList />);

      expect(
        screen.getByText("まだ講義が作成されていません"),
      ).toBeInTheDocument();
      expect(screen.getByText("最初の講義を作成する")).toBeInTheDocument();
    });

    it("ローディング状態の表示テスト", () => {
      mockUseQuery.mockReturnValue(undefined);

      render(<LectureList />);

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("新規作成ボタンが表示されること", () => {
      mockUseQuery.mockReturnValue(mockLectures);

      render(<LectureList />);

      const createButton = screen.getByText("新しい講義を作成");
      expect(createButton).toBeInTheDocument();
      expect(createButton.closest("a")).toHaveAttribute(
        "href",
        "/lectures/create",
      );
    });
  });

  describe("フィルタ・ソート機能テスト", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue(mockLectures);
    });

    it("状態フィルタ変更時の表示更新テスト", async () => {
      const user = userEvent.setup();
      render(<LectureList />);

      // 初期状態では全ての講義が表示される
      expect(screen.getByTestId("lecture-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("lecture-card-2")).toBeInTheDocument();
      expect(screen.getByTestId("lecture-card-3")).toBeInTheDocument();

      // active状態のフィルタを適用
      const statusSelect = screen.getByDisplayValue("すべて");
      await user.selectOptions(statusSelect, "active");

      // active状態の講義のみ表示される
      expect(screen.getByTestId("lecture-card-1")).toBeInTheDocument();
      expect(screen.queryByTestId("lecture-card-2")).not.toBeInTheDocument();
      expect(screen.getByTestId("lecture-card-3")).toBeInTheDocument();
    });

    it("検索機能のテスト", async () => {
      const user = userEvent.setup();
      render(<LectureList />);

      const searchInput =
        screen.getByPlaceholderText("講義タイトルや説明で検索...");
      await user.type(searchInput, "React");

      // Reactを含む講義のみ表示される
      expect(screen.getByTestId("lecture-card-1")).toBeInTheDocument();
      expect(screen.queryByTestId("lecture-card-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("lecture-card-3")).not.toBeInTheDocument();
    });

    it("ソート変更時の並び順更新テスト", async () => {
      const user = userEvent.setup();
      render(<LectureList />);

      // タイトル順ソートボタンをクリック
      const titleSortButton = screen.getByText(/タイトル/);
      await user.click(titleSortButton);

      // ソートボタンのアイコンが変更されることを確認
      expect(titleSortButton).toHaveTextContent("↑");
    });

    it("フィルタ変更時にページがリセットされること", async () => {
      const user = userEvent.setup();
      // 大量のデータでページネーションが発生する状況をシミュレート
      const manyLectures = Array.from({ length: 25 }, (_, i) => ({
        ...mockLectures[0],
        _id: `lecture-${i}` as Id<"lectures">,
        title: `講義${i}`,
      }));
      mockUseQuery.mockReturnValue(manyLectures);

      render(<LectureList />);

      // 2ページ目に移動
      const nextButton = screen.getByText("次へ");
      await user.click(nextButton);

      // フィルタを変更
      const statusSelect = screen.getByDisplayValue("すべて");
      await user.selectOptions(statusSelect, "active");

      // ページが1ページ目にリセットされることを確認（1 / x の形式で表示される）
      expect(screen.getByText(/1 \//)).toBeInTheDocument();
    });
  });

  describe("ページネーション機能テスト", () => {
    it("ページ切り替え時の表示更新テスト", async () => {
      const user = userEvent.setup();
      // 大量のデータでページネーションが発生する状況をシミュレート
      const manyLectures = Array.from({ length: 15 }, (_, i) => ({
        ...mockLectures[0],
        _id: `lecture-${i}` as Id<"lectures">,
        title: `講義${i}`,
      }));
      mockUseQuery.mockReturnValue(manyLectures);

      render(<LectureList />);

      // ページネーションボタンが表示されることを確認
      expect(screen.getByText("次へ")).toBeInTheDocument();
      expect(screen.getByText("前へ")).toBeInTheDocument();

      // 次ページボタンをクリック
      const nextButton = screen.getByText("次へ");
      await user.click(nextButton);

      // ページ情報が更新されることを確認（2 / x の形式で表示される）
      expect(screen.getByText(/2 \//)).toBeInTheDocument();
    });

    it("前後ページボタンの有効/無効状態テスト", async () => {
      const user = userEvent.setup();
      const manyLectures = Array.from({ length: 15 }, (_, i) => ({
        ...mockLectures[0],
        _id: `lecture-${i}` as Id<"lectures">,
        title: `講義${i}`,
      }));
      mockUseQuery.mockReturnValue(manyLectures);

      render(<LectureList />);

      // 1ページ目では前へボタンが無効
      const prevButton = screen.getByText("前へ");
      expect(prevButton).toBeDisabled();

      // 次へボタンは有効
      const nextButton = screen.getByText("次へ");
      expect(nextButton).not.toBeDisabled();

      // 最後のページに移動
      await user.click(nextButton); // 2ページ目

      // 2ページ目では両方有効
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).toBeDisabled(); // 最後のページなので無効
    });
  });

  describe("結果情報表示テスト", () => {
    it("結果件数が正しく表示されること", () => {
      mockUseQuery.mockReturnValue(mockLectures);

      render(<LectureList />);

      expect(screen.getByText("3件中 3件を表示")).toBeInTheDocument();
    });

    it("フィルタ適用時の結果件数が正しく表示されること", async () => {
      const user = userEvent.setup();
      mockUseQuery.mockReturnValue(mockLectures);

      render(<LectureList />);

      // active状態のフィルタを適用
      const statusSelect = screen.getByDisplayValue("すべて");
      await user.selectOptions(statusSelect, "active");

      expect(screen.getByText("2件中 2件を表示")).toBeInTheDocument();
    });

    it("検索条件に一致しない場合のメッセージが表示されること", async () => {
      const user = userEvent.setup();
      mockUseQuery.mockReturnValue(mockLectures);

      render(<LectureList />);

      const searchInput =
        screen.getByPlaceholderText("講義タイトルや説明で検索...");
      await user.type(searchInput, "存在しない講義");

      expect(
        screen.getByText("検索条件に一致する講義がありません"),
      ).toBeInTheDocument();
    });
  });

  describe("アクション機能テスト", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue(mockLectures);
    });

    it("アンケート終了アクションが正しく呼ばれること", async () => {
      const user = userEvent.setup();
      render(<LectureList />);

      const closeButtons = screen.getAllByText("アンケート終了");
      await user.click(closeButtons[0]);

      // 最初のアンケート終了ボタンをクリック
      expect(mockCloseSurvey).toHaveBeenCalledWith({
        lectureId: "2",
        surveyStatus: "closed",
      });
    });

    it("削除アクションが正しく呼ばれること", async () => {
      const user = userEvent.setup();
      render(<LectureList />);

      const deleteButtons = screen.getAllByText("削除");
      await user.click(deleteButtons[0]);

      // 最初の削除ボタンをクリック
      expect(mockDeleteLecture).toHaveBeenCalledWith({
        lectureId: "2",
      });
    });

    it("エラー時のアラート表示テスト", async () => {
      const user = userEvent.setup();
      const mockAlert = vi.spyOn(global, "alert").mockImplementation(() => {});
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockCloseSurvey.mockRejectedValue(new Error("API Error"));

      render(<LectureList />);

      const closeButtons = screen.getAllByText("アンケート終了");
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("アンケート終了に失敗しました");
      });

      consoleSpy.mockRestore();
      mockAlert.mockRestore();
    });
  });

  describe("ソート機能詳細テスト", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue(mockLectures);
    });

    it("同じソートボタンを2回クリックすると順序が逆になること", async () => {
      const user = userEvent.setup();
      render(<LectureList />);

      const titleSortButton = screen.getByText(/タイトル/);

      // 1回目のクリック（昇順）
      await user.click(titleSortButton);
      expect(titleSortButton).toHaveTextContent("↑");

      // 2回目のクリック（降順）
      await user.click(titleSortButton);
      expect(titleSortButton).toHaveTextContent("↓");
    });

    it("異なるソートボタンをクリックすると昇順になること", async () => {
      const user = userEvent.setup();
      render(<LectureList />);

      const titleSortButton = screen.getByText(/タイトル/);
      const dateSortButton = screen.getByText(/講義日/);

      // タイトル順で降順にする
      await user.click(titleSortButton);
      await user.click(titleSortButton);
      expect(titleSortButton).toHaveTextContent("↓");

      // 講義日順に変更（昇順になる）
      await user.click(dateSortButton);
      expect(dateSortButton).toHaveTextContent("↑");
      expect(titleSortButton).toHaveTextContent("↕️");
    });
  });
});
