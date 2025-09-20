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

// モック関数
const mockOnCloseSurvey = vi.fn();
const mockOnDeleteLecture = vi.fn();

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
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

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
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      const statusBadge = screen.getByText("実施中");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("締切済み状態のステータスバッジが適切に表示されること", () => {
      render(
        <LectureCard
          lecture={mockClosedLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      const statusBadge = screen.getByText("締切済み");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("bg-yellow-100", "text-yellow-800");
    });

    it("アクションボタンが正しく配置されること", () => {
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      expect(screen.getByText("詳細・編集")).toBeInTheDocument();
      expect(screen.getByText("URLコピー")).toBeInTheDocument();
      expect(screen.getByText("アンケート終了")).toBeInTheDocument();
      expect(screen.getByText("削除")).toBeInTheDocument();
    });

    it("アンケートURLが正しく表示されること", () => {
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

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

      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

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

      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      const copyButton = screen.getByText("URLコピー");
      await user.click(copyButton);

      expect(mockAlert).toHaveBeenCalledWith("URLのコピーに失敗しました");
    });

    it("アンケート終了ボタンクリック時に確認ダイアログが表示されること", async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.spyOn(global, "confirm").mockReturnValue(true);

      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      const closeButton = screen.getByText("アンケート終了");
      await user.click(closeButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        "アンケートを締切ってもよろしいですか？",
      );
      expect(mockOnCloseSurvey).toHaveBeenCalledWith("lecture1");
    });

    it("アンケート終了確認でキャンセルした場合、onCloseSurveyが呼ばれないこと", async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.spyOn(global, "confirm").mockReturnValue(false);

      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      const closeButton = screen.getByText("アンケート終了");
      await user.click(closeButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        "アンケートを締切ってもよろしいですか？",
      );
      expect(mockOnCloseSurvey).not.toHaveBeenCalled();
    });

    it("削除ボタンクリック時にonDeleteLectureが呼ばれること", async () => {
      const user = userEvent.setup();

      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      const deleteButton = screen.getByText("削除");
      await user.click(deleteButton);

      expect(mockOnDeleteLecture).toHaveBeenCalledWith("lecture1");
    });
  });

  describe("状態別表示テスト", () => {
    it("アクティブ状態では締切ボタンが表示されること", () => {
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      expect(screen.getByText("アンケート終了")).toBeInTheDocument();
    });

    it("締切済み状態では締切ボタンが表示されないこと", () => {
      render(
        <LectureCard
          lecture={mockClosedLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      expect(screen.queryByText("アンケート終了")).not.toBeInTheDocument();
    });

    it("ローディング中はボタンが無効化され、処理中テキストが表示されること", () => {
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading="close-lecture1"
        />,
      );

      const closeButton = screen.getByText("処理中...");
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toBeDisabled();
    });

    it("削除処理中は削除ボタンが無効化され、処理中テキストが表示されること", () => {
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading="delete-lecture1"
        />,
      );

      const deleteButton = screen.getByText("処理中...");
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeDisabled();
    });

    it("他の講義のローディング中でも、この講義のボタンは有効であること", () => {
      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading="close-lecture2"
        />,
      );

      const closeButton = screen.getByText("アンケート終了");
      const deleteButton = screen.getByText("削除");

      expect(closeButton).not.toBeDisabled();
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe("説明がない場合の表示テスト", () => {
    it("説明がない講義では説明部分が表示されないこと", () => {
      const lectureWithoutDescription = {
        ...mockActiveLecture,
        description: undefined,
      };

      render(
        <LectureCard
          lecture={lectureWithoutDescription}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

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

      render(
        <LectureCard
          lecture={mockActiveLecture}
          onCloseSurvey={mockOnCloseSurvey}
          onDeleteLecture={mockOnDeleteLecture}
          loading={null}
        />,
      );

      expect(
        screen.getByText(
          /締切時刻を過ぎていますが、まだ自動締切されていません/,
        ),
      ).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
