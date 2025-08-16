import { describe, it, expect, beforeAll } from "vitest";
import { validateCompleteQuestionSet } from "../validator";
import { QuestionSet } from "../types";
import lectureEvaluationData from "./lecture_evaluation.json";

describe("lecture_evaluation.json", () => {
  let lectureEvaluationSet: QuestionSet;

  beforeAll(() => {
    // JSONデータが有効であることを確認してから型キャスト
    const validation = validateCompleteQuestionSet(lectureEvaluationData);
    if (!validation.isValid) {
      throw new Error(
        `Invalid lecture evaluation JSON: ${validation.errors.join(", ")}`,
      );
    }
    lectureEvaluationSet = lectureEvaluationData as QuestionSet;
  });

  describe("JSONファイル自体のバリデーション", () => {
    it("JSONファイルが正常にバリデーションを通過すること", () => {
      const validation = validateCompleteQuestionSet(lectureEvaluationData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("質問セットの基本情報が正しく設定されていること", () => {
      expect(lectureEvaluationSet.setId).toBe("lecture_evaluation");
      expect(lectureEvaluationSet.name).toBe("講義評価質問項目");
      expect(lectureEvaluationSet.description).toBe(
        "講義の理解度・満足度に関する質問項目",
      );
      expect(lectureEvaluationSet.version).toBe("1.0");
      expect(lectureEvaluationSet.isActive).toBe(true);
    });
  });

  describe("全5項目の定義確認", () => {
    it("正確に5つの質問が定義されていること", () => {
      expect(lectureEvaluationSet.questions).toHaveLength(5);
    });

    it("性別質問が正しく定義されていること", () => {
      const genderQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "gender",
      );
      expect(genderQuestion).toBeDefined();
      expect(genderQuestion?.questionText).toBe("性別を教えてください");
      expect(genderQuestion?.questionType).toBe("radio");
      expect(genderQuestion?.isRequired).toBe(true);
      expect(genderQuestion?.analysisType).toBe("categorical");
      expect(genderQuestion?.options).toHaveLength(4);
    });

    it("年代質問が正しく定義されていること", () => {
      const ageQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "age_group",
      );
      expect(ageQuestion).toBeDefined();
      expect(ageQuestion?.questionText).toBe("年代を教えてください");
      expect(ageQuestion?.questionType).toBe("radio");
      expect(ageQuestion?.isRequired).toBe(true);
      expect(ageQuestion?.analysisType).toBe("categorical");
      expect(ageQuestion?.options).toHaveLength(7);
    });

    it("理解度質問が正しく定義されていること", () => {
      const understandingQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "understanding",
      );
      expect(understandingQuestion).toBeDefined();
      expect(understandingQuestion?.questionText).toBe(
        "講義の理解度を5段階で評価してください",
      );
      expect(understandingQuestion?.questionType).toBe("radio");
      expect(understandingQuestion?.isRequired).toBe(true);
      expect(understandingQuestion?.analysisType).toBe("likert");
      expect(understandingQuestion?.options).toHaveLength(5);
    });

    it("満足度質問が正しく定義されていること", () => {
      const satisfactionQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "satisfaction",
      );
      expect(satisfactionQuestion).toBeDefined();
      expect(satisfactionQuestion?.questionText).toBe(
        "講義の満足度を5段階で評価してください",
      );
      expect(satisfactionQuestion?.questionType).toBe("radio");
      expect(satisfactionQuestion?.isRequired).toBe(true);
      expect(satisfactionQuestion?.analysisType).toBe("likert");
      expect(satisfactionQuestion?.options).toHaveLength(5);
    });

    it("フリーコメント質問が正しく定義されていること", () => {
      const commentQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "free_comment",
      );
      expect(commentQuestion).toBeDefined();
      expect(commentQuestion?.questionText).toContain(
        "講義について、ご意見・ご感想がございましたら自由にお書きください",
      );
      expect(commentQuestion?.questionType).toBe("text");
      expect(commentQuestion?.isRequired).toBe(false);
      expect(commentQuestion?.analysisType).toBe("text");
      expect(commentQuestion?.options).toHaveLength(0);
    });
  });

  describe("選択肢の整合性テスト", () => {
    it("性別の選択肢が期待される値を持つこと", () => {
      const genderQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "gender",
      );
      const expectedValues = ["male", "female", "other", "prefer_not_to_say"];
      const actualValues =
        genderQuestion?.options.map((opt) => opt.value) || [];
      expect(actualValues).toEqual(expectedValues);
    });

    it("年代の選択肢が期待される値を持つこと", () => {
      const ageQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "age_group",
      );
      const expectedValues = [
        "under_20",
        "20s",
        "30s",
        "40s",
        "50s",
        "60s",
        "over_70",
      ];
      const actualValues = ageQuestion?.options.map((opt) => opt.value) || [];
      expect(actualValues).toEqual(expectedValues);
    });

    it("理解度の選択肢が1-5の数値と対応すること", () => {
      const understandingQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "understanding",
      );
      const options = understandingQuestion?.options || [];

      expect(options).toHaveLength(5);
      options.forEach((option, index) => {
        const expectedValue = (index + 1).toString();
        const expectedNumericValue = index + 1;

        expect(option.value).toBe(expectedValue);
        expect(option.numericValue).toBe(expectedNumericValue);
      });
    });

    it("満足度の選択肢が1-5の数値と対応すること", () => {
      const satisfactionQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "satisfaction",
      );
      const options = satisfactionQuestion?.options || [];

      expect(options).toHaveLength(5);
      options.forEach((option, index) => {
        const expectedValue = (index + 1).toString();
        const expectedNumericValue = index + 1;

        expect(option.value).toBe(expectedValue);
        expect(option.numericValue).toBe(expectedNumericValue);
      });
    });
  });

  describe("sortOrderの連番性テスト", () => {
    it("質問のsortOrderが連番になっていること", () => {
      const sortOrders = lectureEvaluationSet.questions.map((q) => q.sortOrder);
      const expectedSortOrders = [1, 2, 3, 4, 5];
      expect(sortOrders).toEqual(expectedSortOrders);
    });

    it("各質問の選択肢のsortOrderが連番になっていること", () => {
      lectureEvaluationSet.questions.forEach((question) => {
        if (question.options.length > 0) {
          const sortOrders = question.options.map((opt) => opt.sortOrder);
          const expectedSortOrders = Array.from(
            { length: question.options.length },
            (_, i) => i + 1,
          );
          expect(sortOrders).toEqual(expectedSortOrders);
        }
      });
    });

    it("各質問の選択肢が重複するsortOrderを持たないこと", () => {
      lectureEvaluationSet.questions.forEach((question) => {
        const sortOrders = question.options.map((opt) => opt.sortOrder);
        const uniqueSortOrders = [...new Set(sortOrders)];
        expect(sortOrders.length).toBe(uniqueSortOrders.length);
      });
    });
  });

  describe("必須フィールドの検証", () => {
    it("すべての質問が必須フィールドを持つこと", () => {
      lectureEvaluationSet.questions.forEach((question) => {
        expect(question.questionId).toBeDefined();
        expect(question.questionText).toBeDefined();
        expect(question.questionType).toBeDefined();
        expect(typeof question.isRequired).toBe("boolean");
        expect(typeof question.sortOrder).toBe("number");
        expect(question.analysisType).toBeDefined();
        expect(Array.isArray(question.options)).toBe(true);
      });
    });

    it("すべての選択肢が必須フィールドを持つこと", () => {
      lectureEvaluationSet.questions.forEach((question) => {
        question.options.forEach((option) => {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
          expect(typeof option.sortOrder).toBe("number");
        });
      });
    });
  });

  describe("講義用特有の検証", () => {
    it("理解度と満足度の評価文言が適切であること", () => {
      const understandingQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "understanding",
      );
      const satisfactionQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "satisfaction",
      );

      // 理解度の評価文言
      const understandingLabels =
        understandingQuestion?.options.map((opt) => opt.label) || [];
      expect(understandingLabels).toContain("1（理解できなかった）");
      expect(understandingLabels).toContain("5（非常によく理解できた）");

      // 満足度の評価文言
      const satisfactionLabels =
        satisfactionQuestion?.options.map((opt) => opt.label) || [];
      expect(satisfactionLabels).toContain("1（不満）");
      expect(satisfactionLabels).toContain("5（非常に満足）");
    });

    it("フリーコメントが任意項目として設定されていること", () => {
      const commentQuestion = lectureEvaluationSet.questions.find(
        (q) => q.questionId === "free_comment",
      );
      expect(commentQuestion?.isRequired).toBe(false);
      expect(commentQuestion?.questionText).toContain("任意");
    });

    it("必須項目が4つ、任意項目が1つであること", () => {
      const requiredQuestions = lectureEvaluationSet.questions.filter(
        (q) => q.isRequired,
      );
      const optionalQuestions = lectureEvaluationSet.questions.filter(
        (q) => !q.isRequired,
      );

      expect(requiredQuestions).toHaveLength(4);
      expect(optionalQuestions).toHaveLength(1);
      expect(optionalQuestions[0].questionId).toBe("free_comment");
    });
  });

  describe("データの一貫性テスト", () => {
    it("questionsが重複するquestionIdを持たないこと", () => {
      const questionIds = lectureEvaluationSet.questions.map(
        (q) => q.questionId,
      );
      const uniqueQuestionIds = [...new Set(questionIds)];
      expect(questionIds.length).toBe(uniqueQuestionIds.length);
    });

    it("各質問の選択肢が重複するvalueを持たないこと", () => {
      lectureEvaluationSet.questions.forEach((question) => {
        const values = question.options.map((opt) => opt.value);
        const uniqueValues = [...new Set(values)];
        expect(values.length).toBe(uniqueValues.length);
      });
    });

    it("バージョン情報が適切に設定されていること", () => {
      expect(lectureEvaluationSet.version).toMatch(/^\d+\.\d+$/);
      expect(lectureEvaluationSet.version).toBe("1.0");
    });
  });
});
