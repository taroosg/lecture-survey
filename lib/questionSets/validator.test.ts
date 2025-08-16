import { describe, it, expect } from "vitest";
import {
  validateQuestionSet,
  validateQuestion,
  validateOption,
  validateQuestionIds,
  validateOptionValues,
  validateCompleteQuestionSet,
  isQuestionSet,
  isQuestion,
  isQuestionOption,
} from "./validator";
import {
  validQuestionSet,
  validRadioQuestion,
  validTextQuestion,
  validGenderOption,
  invalidQuestionSet,
  invalidQuestion,
  invalidOption,
  duplicateIdQuestionSet,
  duplicateValueQuestion,
} from "./__fixtures__/test-data";

describe("validator.ts", () => {
  describe("validateQuestionSet", () => {
    it("正常な質問セットでバリデーションが成功すること", () => {
      const result = validateQuestionSet(validQuestionSet);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("必須フィールドが不足している場合にエラーになること", () => {
      const result = validateQuestionSet(invalidQuestionSet);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "必須フィールド 'setId' が不足しています",
      );
    });

    it("データがオブジェクトでない場合にエラーになること", () => {
      const result = validateQuestionSet("invalid data");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("データがオブジェクトではありません");
    });

    it("nullデータでエラーになること", () => {
      const result = validateQuestionSet(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("データがオブジェクトではありません");
    });

    it("setIdが文字列でない場合にエラーになること", () => {
      const invalidData = { ...validQuestionSet, setId: 123 };
      const result = validateQuestionSet(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("setIdは文字列である必要があります");
    });

    it("questionsが配列でない場合にエラーになること", () => {
      const invalidData = { ...validQuestionSet, questions: "not array" };
      const result = validateQuestionSet(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("questionsは配列である必要があります");
    });
  });

  describe("validateQuestion", () => {
    it("正常なラジオボタン質問でバリデーションが成功すること", () => {
      const result = validateQuestion(validRadioQuestion);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("正常なテキスト質問でバリデーションが成功すること", () => {
      const result = validateQuestion(validTextQuestion);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("必須フィールドが不足している場合にエラーになること", () => {
      const result = validateQuestion(invalidQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "必須フィールド 'questionId' が不足しています",
      );
    });

    it("不正な質問タイプでエラーになること", () => {
      const invalidData = { ...validRadioQuestion, questionType: "invalid" };
      const result = validateQuestion(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "questionTypeは radio, checkbox, text のいずれかである必要があります",
      );
    });

    it("不正な分析タイプでエラーになること", () => {
      const invalidData = { ...validRadioQuestion, analysisType: "invalid" };
      const result = validateQuestion(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "analysisTypeは categorical, likert, text のいずれかである必要があります",
      );
    });

    it("radio/checkboxタイプで選択肢が空の場合にエラーになること", () => {
      const invalidData = { ...validRadioQuestion, options: [] };
      const result = validateQuestion(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "radio/checkboxタイプの質問には選択肢が必要です",
      );
    });

    it("textタイプでは選択肢が空でもエラーにならないこと", () => {
      const result = validateQuestion(validTextQuestion);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateOption", () => {
    it("正常な選択肢でバリデーションが成功すること", () => {
      const result = validateOption(validGenderOption);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("必須フィールドが不足している場合にエラーになること", () => {
      const result = validateOption(invalidOption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "必須フィールド 'value' が不足しています",
      );
    });

    it("sortOrderが数値でない場合にエラーになること", () => {
      const invalidData = { ...validGenderOption, sortOrder: "not number" };
      const result = validateOption(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("sortOrderは数値である必要があります");
    });

    it("numericValueが数値でない場合にエラーになること", () => {
      const invalidData = { ...validGenderOption, numericValue: "not number" };
      const result = validateOption(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("numericValueは数値である必要があります");
    });

    it("sortOrderが0でもエラーにならないこと", () => {
      const optionWithZero = { ...validGenderOption, sortOrder: 0 };
      const result = validateOption(optionWithZero);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateQuestionIds", () => {
    it("重複がない質問セットでバリデーションが成功すること", () => {
      const result = validateQuestionIds(validQuestionSet);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("重複した質問IDでエラーになること", () => {
      const result = validateQuestionIds(duplicateIdQuestionSet);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("重複した質問ID: duplicate_id");
    });
  });

  describe("validateOptionValues", () => {
    it("重複がない選択肢でバリデーションが成功すること", () => {
      const result = validateOptionValues(validRadioQuestion);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("重複した選択肢値でエラーになること", () => {
      const result = validateOptionValues(duplicateValueQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "質問 'duplicate_value_question' で重複した選択肢値: duplicate_value",
      );
    });
  });

  describe("validateCompleteQuestionSet", () => {
    it("正常な質問セットで包括的バリデーションが成功すること", () => {
      const result = validateCompleteQuestionSet(validQuestionSet);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("構造が無効な場合に早期リターンすること", () => {
      const result = validateCompleteQuestionSet(invalidQuestionSet);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("質問IDの重複をチェックすること", () => {
      const result = validateCompleteQuestionSet(duplicateIdQuestionSet);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("重複した質問ID: duplicate_id");
    });

    it("異常系のエラーメッセージが適切に設定されること", () => {
      const result = validateCompleteQuestionSet({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "必須フィールド 'setId' が不足しています",
      );
      expect(result.errors).toContain("必須フィールド 'name' が不足しています");
      expect(result.errors).toContain(
        "必須フィールド 'description' が不足しています",
      );
    });
  });

  describe("型ガード関数", () => {
    describe("isQuestionSet", () => {
      it("正常な質問セットでtrueを返すこと", () => {
        expect(isQuestionSet(validQuestionSet)).toBe(true);
      });

      it("無効な質問セットでfalseを返すこと", () => {
        expect(isQuestionSet(invalidQuestionSet)).toBe(false);
      });

      it("非オブジェクトでfalseを返すこと", () => {
        expect(isQuestionSet("string")).toBe(false);
        expect(isQuestionSet(123)).toBe(false);
        expect(isQuestionSet(null)).toBe(false);
      });
    });

    describe("isQuestion", () => {
      it("正常な質問でtrueを返すこと", () => {
        expect(isQuestion(validRadioQuestion)).toBe(true);
        expect(isQuestion(validTextQuestion)).toBe(true);
      });

      it("無効な質問でfalseを返すこと", () => {
        expect(isQuestion(invalidQuestion)).toBe(false);
      });
    });

    describe("isQuestionOption", () => {
      it("正常な選択肢でtrueを返すこと", () => {
        expect(isQuestionOption(validGenderOption)).toBe(true);
      });

      it("無効な選択肢でfalseを返すこと", () => {
        expect(isQuestionOption(invalidOption)).toBe(false);
      });
    });
  });

  describe("エッジケースのテスト", () => {
    it("空の質問配列でもバリデーションが成功すること", () => {
      const emptyQuestionsSet = { ...validQuestionSet, questions: [] };
      const result = validateCompleteQuestionSet(emptyQuestionsSet);
      expect(result.isValid).toBe(true);
    });

    it("選択肢のsortOrderが連続していなくてもエラーにならないこと", () => {
      const questionWithGapSortOrder = {
        ...validRadioQuestion,
        options: [
          { value: "a", label: "A", sortOrder: 1 },
          { value: "b", label: "B", sortOrder: 5 },
          { value: "c", label: "C", sortOrder: 10 },
        ],
      };
      const result = validateQuestion(questionWithGapSortOrder);
      expect(result.isValid).toBe(true);
    });

    it("numericValueが存在しない選択肢でもエラーにならないこと", () => {
      const optionWithoutNumeric = {
        value: "test",
        label: "テスト",
        sortOrder: 1,
      };
      const result = validateOption(optionWithoutNumeric);
      expect(result.isValid).toBe(true);
    });
  });
});
