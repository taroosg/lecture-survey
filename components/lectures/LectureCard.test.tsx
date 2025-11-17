import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LectureCard } from "./LectureCard";
import { Doc, Id } from "../../convex/_generated/dataModel";

// テスト用のモックデータ
const mockActiveLecture: Doc<"lectures"> = {
  _id: "lecture1" as Id<"lectures">,
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

const mockClosedLecture: Doc<"lectures"> = {
  ...mockActiveLecture,
  _id: "lecture2" as Id<"lectures">,
  title: "Vue.js応用講義",
  surveyStatus: "closed",
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

      const statusBadge = screen.getByText("実施中");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("締切済み状態のステータスバッジが適切に表示されること", () => {
      render(<LectureCard lecture={mockClosedLecture} />);

      const statusBadge = screen.getByText("締切済み");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("bg-yellow-100", "text-yellow-800");
    });

    it("アクションボタンが正しく配置されること", () => {
      render(<LectureCard lecture={mockActiveLecture} />);

      expect(screen.getByText("詳細・編集")).toBeInTheDocument();
      expect(screen.getByText("URLコピー")).toBeInTheDocument();
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
});
