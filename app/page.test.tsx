/**
 * app/page.tsx のテスト
 * ダッシュボード画面のテスト
 */

import { render, screen, cleanup } from "@testing-library/react";
import { describe, test, expect, vi, afterEach } from "vitest";
import Home from "./page";

// Convex認証のモック
vi.mock("convex/react", () => ({
  useConvexAuth: vi.fn(() => ({ isAuthenticated: true })),
}));

// Convex Auth Next.jsのモック
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: vi.fn(() => ({
    signOut: vi.fn(() => Promise.resolve()),
  })),
}));

// Next.js routerのモック
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe("Home (ダッシュボード)", () => {
  afterEach(() => {
    cleanup();
  });

  describe("表示テスト", () => {
    test("ヘッダーに「講義アンケートシステム」が表示されること", () => {
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: "講義アンケートシステム" }),
      ).toBeInTheDocument();
    });

    test("「ダッシュボード」タイトルが表示されること", () => {
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: "ダッシュボード" }),
      ).toBeInTheDocument();
    });

    test("サインアウトボタンが表示されること", () => {
      render(<Home />);
      expect(
        screen.getByRole("button", { name: "サインアウト" }),
      ).toBeInTheDocument();
    });
  });

  describe("カードリンクテスト", () => {
    test("「講義作成」カードが表示されること", () => {
      render(<Home />);
      expect(screen.getByText("講義作成")).toBeInTheDocument();
      expect(
        screen.getByText("新しい講義とアンケートを作成します"),
      ).toBeInTheDocument();
    });

    test("「講義一覧」カードが表示されること", () => {
      render(<Home />);
      expect(screen.getByText("講義一覧")).toBeInTheDocument();
      expect(
        screen.getByText("登録済み講義の確認・管理を行います"),
      ).toBeInTheDocument();
    });

    test("講義作成カードのリンクが正しいこと", () => {
      render(<Home />);
      const createLinks = screen.getAllByText("講義作成");
      const createLink = createLinks[0].closest("a");
      expect(createLink).toHaveAttribute("href", "/lectures/create");
    });

    test("講義一覧カードのリンクが正しいこと", () => {
      render(<Home />);
      const listLinks = screen.getAllByText("講義一覧");
      const listLink = listLinks[0].closest("a");
      expect(listLink).toHaveAttribute("href", "/lectures");
    });
  });

  describe("アイコン表示テスト", () => {
    test("講義作成カードのアイコン（📝）が表示されること", () => {
      render(<Home />);
      const icons = screen.getAllByLabelText("講義作成");
      expect(icons[0]).toHaveTextContent("📝");
    });

    test("講義一覧カードのアイコン（📊）が表示されること", () => {
      render(<Home />);
      const icons = screen.getAllByLabelText("講義一覧");
      expect(icons[0]).toHaveTextContent("📊");
    });
  });
});
