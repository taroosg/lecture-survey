/**
 * バリデーション関数のテスト
 * Vitestを使用した単体テスト
 */

import { describe, it, expect } from "vitest";
import {
  validateGender,
  validateAgeGroup,
  validateRating,
  validateFreeComment,
  validateLectureResponse,
  type LectureResponseData,
} from "./validation";
import {
  VALID_GENDERS,
  VALID_AGE_GROUPS,
  VALID_RATING_VALUES,
} from "./constants";

describe("バリデーション関数", () => {
  describe("validateGender", () => {
    it("有効な性別でtrueを返すこと", () => {
      VALID_GENDERS.forEach((gender) => {
        expect(validateGender(gender)).toBe(true);
      });
    });

    it("無効な性別でfalseを返すこと", () => {
      const invalidGenders = ["invalid", "", "MALE", "Male", "1", "unknown"];
      invalidGenders.forEach((gender) => {
        expect(validateGender(gender)).toBe(false);
      });
    });

    it("nullやundefinedでfalseを返すこと", () => {
      expect(validateGender(null as any)).toBe(false);
      expect(validateGender(undefined as any)).toBe(false);
    });
  });

  describe("validateAgeGroup", () => {
    it("有効な年代でtrueを返すこと", () => {
      VALID_AGE_GROUPS.forEach((ageGroup) => {
        expect(validateAgeGroup(ageGroup)).toBe(true);
      });
    });

    it("無効な年代でfalseを返すこと", () => {
      const invalidAgeGroups = ["invalid", "", "10s", "80s", "teenager", "1"];
      invalidAgeGroups.forEach((ageGroup) => {
        expect(validateAgeGroup(ageGroup)).toBe(false);
      });
    });

    it("nullやundefinedでfalseを返すこと", () => {
      expect(validateAgeGroup(null as any)).toBe(false);
      expect(validateAgeGroup(undefined as any)).toBe(false);
    });
  });

  describe("validateRating", () => {
    it("有効な評価値でtrueを返すこと", () => {
      VALID_RATING_VALUES.forEach((rating) => {
        expect(validateRating(rating)).toBe(true);
      });
    });

    it("無効な評価値でfalseを返すこと", () => {
      const invalidRatings = [0, 6, -1, 1.5, 2.7, 10, 100];
      invalidRatings.forEach((rating) => {
        expect(validateRating(rating)).toBe(false);
      });
    });

    it("文字列の数値でfalseを返すこと", () => {
      expect(validateRating("3" as any)).toBe(false);
      expect(validateRating("5" as any)).toBe(false);
    });

    it("NaNやInfinityでfalseを返すこと", () => {
      expect(validateRating(NaN)).toBe(false);
      expect(validateRating(Infinity)).toBe(false);
      expect(validateRating(-Infinity)).toBe(false);
    });

    it("nullやundefinedでfalseを返すこと", () => {
      expect(validateRating(null as any)).toBe(false);
      expect(validateRating(undefined as any)).toBe(false);
    });
  });

  describe("validateFreeComment", () => {
    it("有効な文字列でtrueを返すこと", () => {
      const validComments = [
        "とても良い講義でした",
        "改善点があります",
        "",
        "   ",
        "日本語のコメント",
        "English comment",
        "123456789",
        "特殊文字!@#$%^&*()",
      ];
      validComments.forEach((comment) => {
        expect(validateFreeComment(comment)).toBe(true);
      });
    });

    it("undefinedでtrueを返すこと（任意項目のため）", () => {
      expect(validateFreeComment(undefined)).toBe(true);
    });

    it("文字列以外でfalseを返すこと", () => {
      expect(validateFreeComment(123 as any)).toBe(false);
      expect(validateFreeComment(true as any)).toBe(false);
      expect(validateFreeComment([] as any)).toBe(false);
      expect(validateFreeComment({} as any)).toBe(false);
      expect(validateFreeComment(null as any)).toBe(false);
    });
  });

  describe("validateLectureResponse", () => {
    const validResponseData: LectureResponseData = {
      gender: "male",
      ageGroup: "20s",
      understanding: 4,
      satisfaction: 5,
      freeComment: "良い講義でした",
    };

    it("正常なデータでエラーが発生しないこと", () => {
      const errors = validateLectureResponse(validResponseData);
      expect(errors).toEqual([]);
    });

    it("フリーコメントが未定義でもエラーが発生しないこと", () => {
      const dataWithoutComment = {
        ...validResponseData,
        freeComment: undefined,
      };
      const errors = validateLectureResponse(dataWithoutComment);
      expect(errors).toEqual([]);
    });

    it("無効な性別でエラーメッセージを含むこと", () => {
      const invalidData = {
        ...validResponseData,
        gender: "invalid",
      };
      const errors = validateLectureResponse(invalidData);
      expect(errors).toContain("性別の値が不正です");
    });

    it("無効な年代でエラーメッセージを含むこと", () => {
      const invalidData = {
        ...validResponseData,
        ageGroup: "invalid",
      };
      const errors = validateLectureResponse(invalidData);
      expect(errors).toContain("年代の値が不正です");
    });

    it("無効な理解度でエラーメッセージを含むこと", () => {
      const invalidData = {
        ...validResponseData,
        understanding: 0,
      };
      const errors = validateLectureResponse(invalidData);
      expect(errors).toContain("理解度は1-5の範囲で入力してください");
    });

    it("無効な満足度でエラーメッセージを含むこと", () => {
      const invalidData = {
        ...validResponseData,
        satisfaction: 6,
      };
      const errors = validateLectureResponse(invalidData);
      expect(errors).toContain("満足度は1-5の範囲で入力してください");
    });

    it("無効なフリーコメントでエラーメッセージを含むこと", () => {
      const invalidData = {
        ...validResponseData,
        freeComment: 123 as any,
      };
      const errors = validateLectureResponse(invalidData);
      expect(errors).toContain("フリーコメントの形式が不正です");
    });

    it("複数のバリデーションエラーが発生した場合、すべてのエラーを返すこと", () => {
      const invalidData: LectureResponseData = {
        gender: "invalid",
        ageGroup: "invalid",
        understanding: 0,
        satisfaction: 6,
        freeComment: 123 as any,
      };
      const errors = validateLectureResponse(invalidData);

      expect(errors).toHaveLength(5);
      expect(errors).toContain("性別の値が不正です");
      expect(errors).toContain("年代の値が不正です");
      expect(errors).toContain("理解度は1-5の範囲で入力してください");
      expect(errors).toContain("満足度は1-5の範囲で入力してください");
      expect(errors).toContain("フリーコメントの形式が不正です");
    });

    describe("境界値テスト", () => {
      it("理解度と満足度の境界値が正しく処理されること", () => {
        // 最小値のテスト
        const minData = {
          ...validResponseData,
          understanding: 1,
          satisfaction: 1,
        };
        expect(validateLectureResponse(minData)).toEqual([]);

        // 最大値のテスト
        const maxData = {
          ...validResponseData,
          understanding: 5,
          satisfaction: 5,
        };
        expect(validateLectureResponse(maxData)).toEqual([]);

        // 境界外のテスト
        const belowMinData = {
          ...validResponseData,
          understanding: 0,
          satisfaction: 0,
        };
        const belowErrors = validateLectureResponse(belowMinData);
        expect(belowErrors).toHaveLength(2);

        const aboveMaxData = {
          ...validResponseData,
          understanding: 6,
          satisfaction: 6,
        };
        const aboveErrors = validateLectureResponse(aboveMaxData);
        expect(aboveErrors).toHaveLength(2);
      });

      it("空文字列のフリーコメントが有効として扱われること", () => {
        const dataWithEmptyComment = {
          ...validResponseData,
          freeComment: "",
        };
        const errors = validateLectureResponse(dataWithEmptyComment);
        expect(errors).toEqual([]);
      });
    });
  });
});
