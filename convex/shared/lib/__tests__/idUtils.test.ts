/**
 * IDユーティリティ関数のテスト
 * Vitestを使用した単体テスト
 */

import { describe, it, expect } from "vitest";
import { generateRandomSlug } from "../idUtils";

describe("idUtils", () => {
  describe("generateRandomSlug", () => {
    it("16文字の文字列を生成すること", () => {
      const slug = generateRandomSlug();
      expect(slug).toHaveLength(16);
    });

    it("英数字のみを含むこと", () => {
      const slug = generateRandomSlug();
      expect(slug).toMatch(/^[a-z0-9]+$/);
    });

    it("複数回呼び出しても異なる文字列を生成すること", () => {
      const slug1 = generateRandomSlug();
      const slug2 = generateRandomSlug();
      const slug3 = generateRandomSlug();

      expect(slug1).not.toBe(slug2);
      expect(slug2).not.toBe(slug3);
      expect(slug1).not.toBe(slug3);
    });

    it("空文字列を返さないこと", () => {
      const slug = generateRandomSlug();
      expect(slug).toBeTruthy();
      expect(slug.length).toBeGreaterThan(0);
    });

    it("数字のみまたは文字のみではなく、両方を含む可能性があること", () => {
      // 10回生成して、少なくとも1つは数字と文字の両方を含むことを確認
      const slugs = Array.from({ length: 10 }, () => generateRandomSlug());
      const hasNumberAndLetter = slugs.some(
        (slug) => /[0-9]/.test(slug) && /[a-z]/.test(slug),
      );

      // 統計的に10回中1回は数字と文字の両方を含むはず
      expect(hasNumberAndLetter).toBe(true);
    });

    it("使用可能な文字が予期される文字セットのみであること", () => {
      const slug = generateRandomSlug();
      const validChars = "abcdefghijklmnopqrstuvwxyz0123456789";

      for (const char of slug) {
        expect(validChars.includes(char)).toBe(true);
      }
    });

    it("十分にランダムであること（重複率の確認）", () => {
      // 100回生成して、重複が発生する確率が低いことを確認
      const slugs = Array.from({ length: 100 }, () => generateRandomSlug());
      const uniqueSlugs = new Set(slugs);

      // 100回中95回以上はユニークであることを期待
      expect(uniqueSlugs.size).toBeGreaterThan(95);
    });
  });
});
