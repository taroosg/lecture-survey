import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem } from "./Breadcrumb";

describe("Breadcrumb", () => {
  afterEach(() => {
    cleanup();
  });

  describe("表示テスト", () => {
    it("空のアイテム配列の場合は何も表示しない", () => {
      const items: BreadcrumbItem[] = [];
      const { container } = render(<Breadcrumb items={items} />);
      expect(container.firstChild).toBeNull();
    });

    it("単一のアイテムを正しく表示する", () => {
      const items: BreadcrumbItem[] = [
        { label: "ホーム", href: "/", current: true },
      ];
      render(<Breadcrumb items={items} />);
      expect(screen.getByText("ホーム")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("複数のアイテムを正しい順序で表示する", () => {
      const items: BreadcrumbItem[] = [
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "講義詳細", current: true },
      ];
      render(<Breadcrumb items={items} />);
      expect(screen.getByText("ホーム")).toBeInTheDocument();
      expect(screen.getByText("講義一覧")).toBeInTheDocument();
      expect(screen.getByText("講義詳細")).toBeInTheDocument();
    });
  });

  describe("リンク機能テスト", () => {
    it("hrefが設定されたアイテムはリンクとして表示される", () => {
      const items: BreadcrumbItem[] = [
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "現在のページ", current: true },
      ];
      render(<Breadcrumb items={items} />);

      const homeLink = screen.getByRole("link", { name: "ホーム" });
      expect(homeLink).toHaveAttribute("href", "/");

      const lecturesLink = screen.getByRole("link", { name: "講義一覧" });
      expect(lecturesLink).toHaveAttribute("href", "/lectures");
    });

    it("currentがtrueまたはhrefがないアイテムはテキストとして表示される", () => {
      const items: BreadcrumbItem[] = [
        { label: "ホーム", href: "/" },
        { label: "現在のページ", current: true },
      ];
      render(<Breadcrumb items={items} />);

      expect(screen.getByRole("link", { name: "ホーム" })).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "現在のページ" }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("現在のページ")).toBeInTheDocument();
    });
  });

  describe("区切り文字テスト", () => {
    it("アイテム間に区切り文字（/）が表示される", () => {
      const items: BreadcrumbItem[] = [
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "講義詳細", current: true },
      ];
      render(<Breadcrumb items={items} />);

      const separators = screen.getAllByText("/");
      expect(separators).toHaveLength(2);
    });

    it("単一アイテムの場合は区切り文字が表示されない", () => {
      const items: BreadcrumbItem[] = [{ label: "ホーム", current: true }];
      render(<Breadcrumb items={items} />);
      expect(screen.queryByText("/")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティテスト", () => {
    it("適切なWAI-ARIA属性が設定されている", () => {
      const items: BreadcrumbItem[] = [
        { label: "ホーム", href: "/" },
        { label: "現在のページ", current: true },
      ];
      render(<Breadcrumb items={items} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Breadcrumb");

      const currentPage = screen.getByText("現在のページ");
      expect(currentPage).toHaveAttribute("aria-current", "page");
    });
  });
});
