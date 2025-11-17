import { describe, it, expect } from "vitest";
import {
  generateBreadcrumbItems,
  normalizePathname,
  extractDynamicParams,
  useBreadcrumbForPath,
} from "./breadcrumb";

describe("breadcrumb", () => {
  describe("normalizePathname", () => {
    it("講義一覧パスをそのまま返す", () => {
      expect(normalizePathname("/lectures")).toBe("/lectures");
    });

    it("講義作成パスをそのまま返す", () => {
      expect(normalizePathname("/lectures/create")).toBe("/lectures/create");
    });

    it("講義詳細パスを正規化する", () => {
      expect(normalizePathname("/lectures/123")).toBe("/lectures/[id]");
      expect(normalizePathname("/lectures/abc456")).toBe("/lectures/[id]");
    });

    it("講義編集パスを正規化する", () => {
      expect(normalizePathname("/lectures/123/edit")).toBe(
        "/lectures/[id]/edit",
      );
    });

    it("回答データパスを正規化する", () => {
      expect(normalizePathname("/lectures/123/responses")).toBe(
        "/lectures/[id]/responses",
      );
    });

    it("createは動的IDとして扱わない", () => {
      expect(normalizePathname("/lectures/create")).toBe("/lectures/create");
    });
  });

  describe("extractDynamicParams", () => {
    it("講義IDを抽出する", () => {
      const params = extractDynamicParams("/lectures/123", "/lectures/[id]");
      expect(params.lectureId).toBe("123");
    });

    it("講義編集ページからIDを抽出する", () => {
      const params = extractDynamicParams(
        "/lectures/abc456/edit",
        "/lectures/[id]/edit",
      );
      expect(params.lectureId).toBe("abc456");
    });

    it("動的パラメータがない場合は空オブジェクトを返す", () => {
      const params = extractDynamicParams("/lectures", "/lectures");
      expect(params).toEqual({});
    });
  });

  describe("generateBreadcrumbItems", () => {
    it("講義一覧の静的パンくずを生成する", () => {
      const items = generateBreadcrumbItems("/lectures");
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", current: true },
      ]);
    });

    it("講義作成の静的パンくずを生成する", () => {
      const items = generateBreadcrumbItems("/lectures/create");
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "新規作成", current: true },
      ]);
    });

    it("講義詳細の動的パンくずを生成する", () => {
      const items = generateBreadcrumbItems("/lectures/[id]", {
        lectureTitle: "React基礎講義",
        lectureId: "123",
      });
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "React基礎講義", current: true },
      ]);
    });

    it("講義詳細でタイトルがない場合はデフォルト表示", () => {
      const items = generateBreadcrumbItems("/lectures/[id]", {
        lectureId: "123",
      });
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "講義詳細", current: true },
      ]);
    });

    it("講義編集の動的パンくずを生成する", () => {
      const items = generateBreadcrumbItems("/lectures/[id]/edit", {
        lectureTitle: "React基礎講義",
        lectureId: "123",
      });
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "React基礎講義", href: "/lectures/123" },
        { label: "編集", current: true },
      ]);
    });

    it("設定が見つからない場合は空配列を返す", () => {
      const items = generateBreadcrumbItems("/unknown/path");
      expect(items).toEqual([]);
    });
  });

  describe("useBreadcrumbForPath", () => {
    it("パス名とデータを組み合わせてパンくずを生成する", () => {
      const items = useBreadcrumbForPath("/lectures/123", {
        lectureTitle: "Vue.js応用講義",
      });
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "Vue.js応用講義", current: true },
      ]);
    });

    it("動的データがなくても正常に動作する", () => {
      const items = useBreadcrumbForPath("/lectures");
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", current: true },
      ]);
    });

    it("IDをパスから抽出し動的データと統合する", () => {
      const items = useBreadcrumbForPath("/lectures/456/edit", {
        lectureTitle: "JavaScript基礎",
      });
      expect(items).toEqual([
        { label: "ホーム", href: "/" },
        { label: "講義一覧", href: "/lectures" },
        { label: "JavaScript基礎", href: "/lectures/456" },
        { label: "編集", current: true },
      ]);
    });
  });
});
