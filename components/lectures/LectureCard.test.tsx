import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LectureCard } from "./LectureCard";
import { Id } from "../../convex/_generated/dataModel";
import type { LectureWithAnalysis } from "../../convex/shared/types/analysis";

// テスト用のモックデータ
const mockActiveLecture: LectureWithAnalysis = {
  _id: "lecture1" as Id<"lectures">,
  _creationTime: 1705200000000,
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
};

const mockClosedLecture: LectureWithAnalysis = {
  ...mockActiveLecture,
  _id: "lecture2" as Id<"lectures">,
  title: "Vue.js応用講義",
  surveyStatus: "closed",
};

const mockAnalyzedLecture: LectureWithAnalysis = {
  ...mockActiveLecture,
  _id: "lecture3" as Id<"lectures">,
  title: "TypeScript応用講義",
  surveyStatus: "analyzed",
  closedAt: 1705284800000,
  analyzedAt: 1705288400000,
  analysisData: {
    understanding: 4.2,
    satisfaction: 4.5,
    responseCount: 25,
  },
};

// グローバルオブジェクトのモック
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

Object.defineProperty(window, "location", {
  value: {
    origin: "http://localhost:3000",
  },
  writable: true,
});

global.confirm = vi.fn();
global.alert = vi.fn();

describe("LectureCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("レンダリングテスト", () => {
    it("講義情報が正しく表示されること", () => {
      render(<LectureCard lecture={mockActiveLecture} />);

      expect(screen.getByText("React基礎講義")).toBeInTheDocument();
      expect(
        screen.getByText("Reactの基本的な使い方を学ぶ"),
      ).toBeInTheDocument();
      expect(screen.getByText(/講義日時:/)).toBeInTheDocument();
      expect(screen.getByText(/2024-01-15 10:00/)).toBeInTheDocument();
      expect(screen.getByText(/アンケート締切:/)).toBeInTheDocument();
      expect(screen.getByText(/2024-01-16 18:00/)).toBeInTheDocument();
    });

    it("アクティブ状態のステータスバッジが適切に表示されること", () => {
      render(<LectureCard lecture={mockActiveLecture} />);

      const statusBadge = screen.getByText("受付中");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("締切済み状態のステータスバッジが適切に表示されること", () => {
      render(<LectureCard lecture={mockClosedLecture} />);

      const statusBadge = screen.getByText("締切済み");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("bg-yellow-100", "text-yellow-800");
    });

    it("URLコピーボタンが表示されること", () => {
      render(<LectureCard lecture={mockActiveLecture} />);

      expect(screen.getByText("URLコピー")).toBeInTheDocument();
    });

    it("講義タイトルが詳細画面へのリンクになっていること", () => {
      render(<LectureCard lecture={mockActiveLecture} />);

      const titleElement = screen.getByText("React基礎講義");
      expect(titleElement).toBeInTheDocument();

      // タイトルの親要素がLinkであることを確認
      const linkElement = titleElement.closest("a");
      expect(linkElement).toHaveAttribute("href", "/lectures/lecture1");
    });

    it("アンケートURLが正しく表示されること", () => {
      render(<LectureCard lecture={mockActiveLecture} />);

      const urlLink = screen.getByText("http://localhost:3000/survey/lecture1");
      expect(urlLink).toBeInTheDocument();
      expect(urlLink).toHaveAttribute(
        "href",
        "http://localhost:3000/survey/lecture1",
      );
      expect(urlLink).toHaveAttribute("target", "_blank");
    });
  });

  describe("インタラクションテスト", () => {
    it("URLコピーボタンクリック時にクリップボードにコピーされること", async () => {
      const user = userEvent.setup();
      const mockWriteText = vi.spyOn(navigator.clipboard, "writeText");

      render(<LectureCard lecture={mockActiveLecture} />);

      const copyButton = screen.getByText("URLコピー");
      await user.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith(
        "http://localhost:3000/survey/lecture1",
      );
      expect(screen.getByText("コピー済み")).toBeInTheDocument();
    });

    it("URLコピー失敗時にアラートが表示されること", async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
        new Error("Copy failed"),
      );
      const mockAlert = vi.spyOn(global, "alert");

      render(<LectureCard lecture={mockActiveLecture} />);

      const copyButton = screen.getByText("URLコピー");
      await user.click(copyButton);

      expect(mockAlert).toHaveBeenCalledWith("URLのコピーに失敗しました");
    });
  });

  describe("説明がない場合の表示テスト", () => {
    it("説明がない講義では説明部分が表示されないこと", () => {
      const lectureWithoutDescription = {
        ...mockActiveLecture,
        description: undefined,
      };

      render(<LectureCard lecture={lectureWithoutDescription} />);

      expect(screen.getByText("React基礎講義")).toBeInTheDocument();
      expect(
        screen.queryByText("Reactの基本的な使い方を学ぶ"),
      ).not.toBeInTheDocument();
    });
  });

  describe("締切警告表示のテスト", () => {
    it("締切時刻を過ぎたactive状態の講義では警告が表示されること", () => {
      // 現在時刻を2024-01-17に設定（締切を過ぎた状態）
      const pastDate = new Date("2024-01-17T10:00:00");
      vi.setSystemTime(pastDate);

      render(<LectureCard lecture={mockActiveLecture} />);

      expect(
        screen.getByText(
          /締切時刻を過ぎていますが、まだ自動締切されていません/,
        ),
      ).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe("分析データ表示のテスト", () => {
    it("分析済み講義では分析データが表示されること", () => {
      render(<LectureCard lecture={mockAnalyzedLecture} />);

      expect(screen.getByText("理解度")).toBeInTheDocument();
      expect(screen.getByText("満足度")).toBeInTheDocument();
      expect(screen.getByText("4.2")).toBeInTheDocument();
      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("(25件)")).toBeInTheDocument();
    });

    it("分析済み講義のステータスバッジが適切に表示されること", () => {
      render(<LectureCard lecture={mockAnalyzedLecture} />);

      const statusBadge = screen.getByText("分析完了");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("分析済み講義ではアンケートURLが表示されないこと", () => {
      render(<LectureCard lecture={mockAnalyzedLecture} />);

      expect(screen.queryByText("アンケートURL:")).not.toBeInTheDocument();
      expect(screen.queryByText("URLコピー")).not.toBeInTheDocument();
    });

    it("アクティブ講義では分析データが表示されないこと", () => {
      render(<LectureCard lecture={mockActiveLecture} />);

      expect(screen.queryByText("理解度")).not.toBeInTheDocument();
      expect(screen.queryByText("満足度")).not.toBeInTheDocument();
    });

    it("締切済み講義では分析データが表示されないこと", () => {
      render(<LectureCard lecture={mockClosedLecture} />);

      expect(screen.queryByText("理解度")).not.toBeInTheDocument();
      expect(screen.queryByText("満足度")).not.toBeInTheDocument();
    });

    it("分析済み講義では簡略化されたレイアウトが表示されること", () => {
      render(<LectureCard lecture={mockAnalyzedLecture} />);

      // タイトルと日付のみ表示
      expect(screen.getByText("TypeScript応用講義")).toBeInTheDocument();
      expect(screen.getByText("2024-01-15")).toBeInTheDocument();

      // 説明文、講義時刻、締切時刻は表示されない
      expect(screen.queryByText(/講義日時:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/アンケート締切:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/10:00/)).not.toBeInTheDocument();
    });
  });
});
