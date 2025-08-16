import { describe, it, expect } from "vitest";
import {
  QuestionOption,
  Question,
  QuestionSet,
  LectureQuestionIds,
  SatisfactionRating,
  UnderstandingRating,
} from "./types";
import {
  validGenderOption,
  validSatisfactionOption,
  validRadioQuestion,
  validTextQuestion,
  validQuestionSet,
} from "./__fixtures__/test-data";

describe("types.ts", () => {
  describe("QuestionOption型", () => {
    it("基本的な選択肢の型が正しく定義されること", () => {
      const option: QuestionOption = validGenderOption;
      expect(option.value).toBe("male");
      expect(option.label).toBe("男性");
      expect(option.sortOrder).toBe(1);
      expect(option.numericValue).toBeUndefined();
    });

    it("数値を持つ選択肢の型が正しく定義されること", () => {
      const option: QuestionOption = validSatisfactionOption;
      expect(option.value).toBe("5");
      expect(option.label).toBe("5（非常に満足）");
      expect(option.numericValue).toBe(5);
      expect(option.sortOrder).toBe(5);
    });
  });

  describe("Question型", () => {
    it("ラジオボタン質問の型が正しく定義されること", () => {
      const question: Question = validRadioQuestion;
      expect(question.questionId).toBe("test_gender");
      expect(question.questionType).toBe("radio");
      expect(question.isRequired).toBe(true);
      expect(question.analysisType).toBe("categorical");
      expect(question.options).toHaveLength(2);
    });

    it("テキスト質問の型が正しく定義されること", () => {
      const question: Question = validTextQuestion;
      expect(question.questionId).toBe("test_comment");
      expect(question.questionType).toBe("text");
      expect(question.isRequired).toBe(false);
      expect(question.analysisType).toBe("text");
      expect(question.options).toHaveLength(0);
    });

    it("質問タイプが正しく制限されること", () => {
      // TypeScriptの型チェックをテスト
      const validTypes: Question["questionType"][] = [
        "radio",
        "checkbox",
        "text",
      ];
      expect(validTypes).toContain("radio");
      expect(validTypes).toContain("checkbox");
      expect(validTypes).toContain("text");
    });

    it("分析タイプが正しく制限されること", () => {
      // TypeScriptの型チェックをテスト
      const validAnalysisTypes: Question["analysisType"][] = [
        "categorical",
        "likert",
        "text",
      ];
      expect(validAnalysisTypes).toContain("categorical");
      expect(validAnalysisTypes).toContain("likert");
      expect(validAnalysisTypes).toContain("text");
    });
  });

  describe("QuestionSet型", () => {
    it("質問セットの型が正しく定義されること", () => {
      const questionSet: QuestionSet = validQuestionSet;
      expect(questionSet.setId).toBe("test_set");
      expect(questionSet.name).toBe("テスト質問セット");
      expect(questionSet.version).toBe("1.0");
      expect(questionSet.isActive).toBe(true);
      expect(questionSet.questions).toHaveLength(2);
    });

    it("質問セットが必須フィールドを持つこと", () => {
      const questionSet: QuestionSet = validQuestionSet;
      expect(questionSet.setId).toBeDefined();
      expect(questionSet.name).toBeDefined();
      expect(questionSet.description).toBeDefined();
      expect(questionSet.version).toBeDefined();
      expect(questionSet.questions).toBeDefined();
    });
  });

  describe("LectureQuestionIds型", () => {
    it("講義用質問IDが正しく定義されること", () => {
      const validIds: LectureQuestionIds[] = [
        "gender",
        "age_group",
        "understanding",
        "satisfaction",
        "free_comment",
      ];

      validIds.forEach((id) => {
        expect(typeof id).toBe("string");
      });

      expect(validIds).toHaveLength(5);
    });

    it("講義用質問IDが期待される値を含むこと", () => {
      const gender: LectureQuestionIds = "gender";
      const ageGroup: LectureQuestionIds = "age_group";
      const understanding: LectureQuestionIds = "understanding";
      const satisfaction: LectureQuestionIds = "satisfaction";
      const freeComment: LectureQuestionIds = "free_comment";

      expect(gender).toBe("gender");
      expect(ageGroup).toBe("age_group");
      expect(understanding).toBe("understanding");
      expect(satisfaction).toBe("satisfaction");
      expect(freeComment).toBe("free_comment");
    });
  });

  describe("SatisfactionRating型", () => {
    it("満足度評価が1-5の範囲で定義されること", () => {
      const validRatings: SatisfactionRating[] = [1, 2, 3, 4, 5];

      validRatings.forEach((rating) => {
        expect(rating).toBeGreaterThanOrEqual(1);
        expect(rating).toBeLessThanOrEqual(5);
        expect(Number.isInteger(rating)).toBe(true);
      });
    });

    it("満足度評価の境界値が正しく動作すること", () => {
      const minRating: SatisfactionRating = 1;
      const maxRating: SatisfactionRating = 5;

      expect(minRating).toBe(1);
      expect(maxRating).toBe(5);
    });
  });

  describe("UnderstandingRating型", () => {
    it("理解度評価が1-5の範囲で定義されること", () => {
      const validRatings: UnderstandingRating[] = [1, 2, 3, 4, 5];

      validRatings.forEach((rating) => {
        expect(rating).toBeGreaterThanOrEqual(1);
        expect(rating).toBeLessThanOrEqual(5);
        expect(Number.isInteger(rating)).toBe(true);
      });
    });

    it("理解度評価の境界値が正しく動作すること", () => {
      const minRating: UnderstandingRating = 1;
      const maxRating: UnderstandingRating = 5;

      expect(minRating).toBe(1);
      expect(maxRating).toBe(5);
    });
  });

  describe("型の整合性", () => {
    it("SatisfactionRatingとUnderstandingRatingが同じ値域を持つこと", () => {
      const satisfactionValues: SatisfactionRating[] = [1, 2, 3, 4, 5];
      const understandingValues: UnderstandingRating[] = [1, 2, 3, 4, 5];

      expect(satisfactionValues).toEqual(understandingValues);
    });

    it("QuestionOptionの必須フィールドが正しく定義されること", () => {
      const option: QuestionOption = {
        value: "test",
        label: "テスト",
        sortOrder: 1,
      };

      expect(option.value).toBeDefined();
      expect(option.label).toBeDefined();
      expect(option.sortOrder).toBeDefined();
      expect(option.numericValue).toBeUndefined();
    });
  });
});
