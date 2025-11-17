/**
 * Header.tsx のテスト
 * 共通ヘッダーコンポーネントのテスト
 */

import { render, screen, cleanup } from "@testing-library/react";
import { describe, test, expect, vi, afterEach } from "vitest";
import Header from "./Header";

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

describe("Header", () => {
  afterEach(() => {
    cleanup();
  });

  describe("表示テスト", () => {
    test("ヘッダーに「講義アンケートシステム」が表示されること", () => {
      render(<Header />);
      const titles = screen.getAllByText("講義アンケートシステム");
      expect(titles.length).toBeGreaterThan(0);
      expect(titles[0]).toBeInTheDocument();
    });

    test("タイトルがルート（/）へのリンクになっていること", () => {
      render(<Header />);
      const titles = screen.getAllByText("講義アンケートシステム");
      const titleLink = titles[0].closest("a");
      expect(titleLink).toHaveAttribute("href", "/");
    });

    test("サインアウトボタンが表示されること", () => {
      render(<Header />);
      const buttons = screen.getAllByText("サインアウト");
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toBeInTheDocument();
    });
  });
});
