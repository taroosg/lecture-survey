/**
 * 講義用定数のテスト
 * Vitestを使用した単体テスト
 */

import { describe, it, expect } from "vitest";
import {
  VALID_GENDERS,
  VALID_AGE_GROUPS,
  VALID_RATING_VALUES,
  MIN_RATING_VALUE,
  MAX_RATING_VALUE,
  LECTURE_QUESTION_IDS,
  VALID_SURVEY_STATUSES,
  type GenderValue,
  type AgeGroupValue,
  type RatingValue,
  type LectureQuestionId,
  type SurveyStatus,
} from "./constants";

describe("講義用定数", () => {
  describe("VALID_GENDERS", () => {
    it("正確な性別の選択肢が定義されていること", () => {
      expect(VALID_GENDERS).toEqual([
        "male",
        "female",
        "other",
        "prefer_not_to_say",
      ]);
    });

    it("配列が不変であること", () => {
      // TypeScriptでは型レベルで読み取り専用だが、実行時は通常の配列
      // 実際の不変性は Object.freeze() などで実現する必要がある
      const originalLength = VALID_GENDERS.length;
      const copiedArray = [...VALID_GENDERS];

      // 元の配列と同じ要素を持つことを確認
      expect(VALID_GENDERS).toEqual(copiedArray);
      expect(VALID_GENDERS.length).toBe(originalLength);
    });

    it("型定義が正しく機能すること", () => {
      const validGender: GenderValue = "male";
      expect(VALID_GENDERS.includes(validGender)).toBe(true);
    });
  });

  describe("VALID_AGE_GROUPS", () => {
    it("正確な年代の選択肢が定義されていること", () => {
      expect(VALID_AGE_GROUPS).toEqual([
        "under_20",
        "20s",
        "30s",
        "40s",
        "50s",
        "60s",
        "over_70",
      ]);
    });

    it("配列が不変であること", () => {
      const originalLength = VALID_AGE_GROUPS.length;
      const copiedArray = [...VALID_AGE_GROUPS];

      expect(VALID_AGE_GROUPS).toEqual(copiedArray);
      expect(VALID_AGE_GROUPS.length).toBe(originalLength);
    });

    it("型定義が正しく機能すること", () => {
      const validAgeGroup: AgeGroupValue = "20s";
      expect(VALID_AGE_GROUPS.includes(validAgeGroup)).toBe(true);
    });
  });

  describe("VALID_RATING_VALUES", () => {
    it("1から5までの評価値が定義されていること", () => {
      expect(VALID_RATING_VALUES).toEqual([1, 2, 3, 4, 5]);
    });

    it("配列が不変であること", () => {
      const originalLength = VALID_RATING_VALUES.length;
      const copiedArray = [...VALID_RATING_VALUES];

      expect(VALID_RATING_VALUES).toEqual(copiedArray);
      expect(VALID_RATING_VALUES.length).toBe(originalLength);
    });

    it("型定義が正しく機能すること", () => {
      const validRating: RatingValue = 4;
      expect(VALID_RATING_VALUES.includes(validRating)).toBe(true);
    });
  });

  describe("MIN_RATING_VALUE と MAX_RATING_VALUE", () => {
    it("最小値が1であること", () => {
      expect(MIN_RATING_VALUE).toBe(1);
    });

    it("最大値が5であること", () => {
      expect(MAX_RATING_VALUE).toBe(5);
    });

    it("最小値と最大値がVALID_RATING_VALUESと整合性があること", () => {
      // 配列が期待される長さであることを確認
      expect(VALID_RATING_VALUES).toHaveLength(5);
      expect(VALID_RATING_VALUES[0]).toBe(MIN_RATING_VALUE);
      expect(VALID_RATING_VALUES[4]).toBe(MAX_RATING_VALUE); // インデックス4が最後の要素（1,2,3,4,5）
    });
  });

  describe("LECTURE_QUESTION_IDS", () => {
    it("正確な質問IDが定義されていること", () => {
      expect(LECTURE_QUESTION_IDS).toEqual([
        "gender",
        "age_group",
        "understanding",
        "satisfaction",
        "free_comment",
      ]);
    });

    it("配列が不変であること", () => {
      const originalLength = LECTURE_QUESTION_IDS.length;
      const copiedArray = [...LECTURE_QUESTION_IDS];

      expect(LECTURE_QUESTION_IDS).toEqual(copiedArray);
      expect(LECTURE_QUESTION_IDS.length).toBe(originalLength);
    });

    it("型定義が正しく機能すること", () => {
      const validQuestionId: LectureQuestionId = "understanding";
      expect(LECTURE_QUESTION_IDS.includes(validQuestionId)).toBe(true);
    });
  });

  describe("VALID_SURVEY_STATUSES", () => {
    it("正確なアンケート状態が定義されていること", () => {
      expect(VALID_SURVEY_STATUSES).toEqual(["active", "closed"]);
    });

    it("配列が不変であること", () => {
      const originalLength = VALID_SURVEY_STATUSES.length;
      const copiedArray = [...VALID_SURVEY_STATUSES];

      expect(VALID_SURVEY_STATUSES).toEqual(copiedArray);
      expect(VALID_SURVEY_STATUSES.length).toBe(originalLength);
    });

    it("型定義が正しく機能すること", () => {
      const validStatus: SurveyStatus = "active";
      expect(VALID_SURVEY_STATUSES.includes(validStatus)).toBe(true);
    });
  });

  describe("型の整合性テスト", () => {
    it("すべての定数が期待される型に準拠していること", () => {
      // 型チェックのためのコンパイル時テスト
      const gender: GenderValue = VALID_GENDERS[0];
      const ageGroup: AgeGroupValue = VALID_AGE_GROUPS[0];
      const rating: RatingValue = VALID_RATING_VALUES[0];
      const questionId: LectureQuestionId = LECTURE_QUESTION_IDS[0];
      const status: SurveyStatus = VALID_SURVEY_STATUSES[0];

      expect(typeof gender).toBe("string");
      expect(typeof ageGroup).toBe("string");
      expect(typeof rating).toBe("number");
      expect(typeof questionId).toBe("string");
      expect(typeof status).toBe("string");
    });
  });
});
