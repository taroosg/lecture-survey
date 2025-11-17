/**
 * app/page.tsx のテスト
 * ダッシュボード画面のテスト
 */

import { render, screen, cleanup } from "@testing-library/react";
import { describe, test, expect, afterEach } from "vitest";
import Home from "./page";

describe("Home (ダッシュボード)", () => {
  afterEach(() => {
    cleanup();
  });

  describe("表示テスト", () => {
    test("「ダッシュボード」タイトルが表示されること", () => {
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: "ダッシュボード" }),
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
      const createLink = screen.getByText("講義作成").closest("a");
      expect(createLink).toHaveAttribute("href", "/lectures/create");
    });

    test("講義一覧カードのリンクが正しいこと", () => {
      render(<Home />);
      const listLink = screen.getByText("講義一覧").closest("a");
      expect(listLink).toHaveAttribute("href", "/lectures");
    });
  });

  describe("アイコン表示テスト", () => {
    test("講義作成カードのアイコン（📝）が表示されること", () => {
      render(<Home />);
      const icon = screen.getByLabelText("講義作成");
      expect(icon).toHaveTextContent("📝");
    });

    test("講義一覧カードのアイコン（📊）が表示されること", () => {
      render(<Home />);
      const icon = screen.getByLabelText("講義一覧");
      expect(icon).toHaveTextContent("📊");
    });
  });
});
