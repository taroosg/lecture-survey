import { describe, it, expect, vi } from "vitest";
import {
  LECTURE_EVALUATION_QUESTION_SET,
  QUESTION_SETS,
  getActiveQuestionSets,
  getQuestionSet,
  hasQuestionSet,
  getQuestion,
  getQuestionOptions,
  GENDER_OPTIONS,
  AGE_GROUP_OPTIONS,
  UNDERSTANDING_OPTIONS,
  SATISFACTION_OPTIONS,
  VALID_GENDERS,
  VALID_AGE_GROUPS,
  VALID_UNDERSTANDING_RATINGS,
  VALID_SATISFACTION_RATINGS,
  debugQuestionSets,
  getQuestionSetStats,
} from "./index";

describe("index.ts", () => {
  describe("定数のエクスポート", () => {
    it("LECTURE_EVALUATION_QUESTION_SETが正しく定義されること", () => {
      expect(LECTURE_EVALUATION_QUESTION_SET).toBeDefined();
      expect(LECTURE_EVALUATION_QUESTION_SET.setId).toBe("lecture_evaluation");
      expect(LECTURE_EVALUATION_QUESTION_SET.name).toBe("講義評価質問項目");
      expect(LECTURE_EVALUATION_QUESTION_SET.questions).toHaveLength(5);
    });

    it("QUESTION_SETSが正しく初期化されること", () => {
      expect(QUESTION_SETS).toBeDefined();
      expect(QUESTION_SETS["lecture_evaluation"]).toBe(
        LECTURE_EVALUATION_QUESTION_SET,
      );
      expect(Object.keys(QUESTION_SETS)).toHaveLength(1);
    });
  });

  describe("getActiveQuestionSets", () => {
    it("アクティブな質問セットのみを取得すること", () => {
      const activeSets = getActiveQuestionSets();
      expect(activeSets).toHaveLength(1);
      expect(activeSets[0].isActive).toBe(true);
      expect(activeSets[0].setId).toBe("lecture_evaluation");
    });

    it("全てのアクティブセットがisActive=trueであること", () => {
      const activeSets = getActiveQuestionSets();
      activeSets.forEach((set) => {
        expect(set.isActive).toBe(true);
      });
    });
  });

  describe("getQuestionSet", () => {
    it("存在する質問セットを正しく取得すること", () => {
      const questionSet = getQuestionSet("lecture_evaluation");
      expect(questionSet).toBeDefined();
      expect(questionSet?.setId).toBe("lecture_evaluation");
    });

    it("存在しない質問セットでundefinedを返すこと", () => {
      const questionSet = getQuestionSet("non_existent_set");
      expect(questionSet).toBeUndefined();
    });
  });

  describe("hasQuestionSet", () => {
    it("存在する質問セットでtrueを返すこと", () => {
      expect(hasQuestionSet("lecture_evaluation")).toBe(true);
    });

    it("存在しない質問セットでfalseを返すこと", () => {
      expect(hasQuestionSet("non_existent_set")).toBe(false);
    });
  });

  describe("getQuestion", () => {
    it("特定の質問を正しく取得すること", () => {
      const question = getQuestion("lecture_evaluation", "gender");
      expect(question).toBeDefined();
      expect(question?.questionId).toBe("gender");
      expect(question?.questionText).toBe("性別を教えてください");
    });

    it("存在しない質問でundefinedを返すこと", () => {
      const question = getQuestion(
        "lecture_evaluation",
        "non_existent_question",
      );
      expect(question).toBeUndefined();
    });

    it("存在しない質問セットでundefinedを返すこと", () => {
      const question = getQuestion("non_existent_set", "gender");
      expect(question).toBeUndefined();
    });
  });

  describe("getQuestionOptions", () => {
    it("質問の選択肢を正しく取得すること", () => {
      const options = getQuestionOptions("lecture_evaluation", "gender");
      expect(options).toHaveLength(4);
      expect(options[0].value).toBe("male");
      expect(options[0].label).toBe("男性");
    });

    it("存在しない質問で空配列を返すこと", () => {
      const options = getQuestionOptions(
        "lecture_evaluation",
        "non_existent_question",
      );
      expect(options).toEqual([]);
    });

    it("選択肢がsortOrder順に並んでいることを確認すること", () => {
      const options = getQuestionOptions("lecture_evaluation", "understanding");
      for (let i = 0; i < options.length - 1; i++) {
        expect(options[i].sortOrder).toBeLessThanOrEqual(
          options[i + 1].sortOrder,
        );
      }
    });
  });

  describe("便利な定数エクスポート", () => {
    it("GENDER_OPTIONSが正しく設定されること", () => {
      expect(GENDER_OPTIONS).toHaveLength(4);
      expect(GENDER_OPTIONS[0].value).toBe("male");
      expect(GENDER_OPTIONS[1].value).toBe("female");
      expect(GENDER_OPTIONS[2].value).toBe("other");
      expect(GENDER_OPTIONS[3].value).toBe("preferNotToSay");
    });

    it("AGE_GROUP_OPTIONSが正しく設定されること", () => {
      expect(AGE_GROUP_OPTIONS).toHaveLength(7);
      expect(AGE_GROUP_OPTIONS[0].value).toBe("under20");
      expect(AGE_GROUP_OPTIONS[AGE_GROUP_OPTIONS.length - 1].value).toBe(
        "over70",
      );
    });

    it("UNDERSTANDING_OPTIONSが正しく設定されること", () => {
      expect(UNDERSTANDING_OPTIONS).toHaveLength(5);
      expect(UNDERSTANDING_OPTIONS[0].value).toBe("1");
      expect(UNDERSTANDING_OPTIONS[4].value).toBe("5");
      expect(UNDERSTANDING_OPTIONS[0].numericValue).toBe(1);
      expect(UNDERSTANDING_OPTIONS[4].numericValue).toBe(5);
    });

    it("SATISFACTION_OPTIONSが正しく設定されること", () => {
      expect(SATISFACTION_OPTIONS).toHaveLength(5);
      expect(SATISFACTION_OPTIONS[0].value).toBe("1");
      expect(SATISFACTION_OPTIONS[4].value).toBe("5");
      expect(SATISFACTION_OPTIONS[0].numericValue).toBe(1);
      expect(SATISFACTION_OPTIONS[4].numericValue).toBe(5);
    });
  });

  describe("バリデーション用の値配列", () => {
    it("VALID_GENDERSが正しく設定されること", () => {
      expect(VALID_GENDERS).toEqual([
        "male",
        "female",
        "other",
        "preferNotToSay",
      ]);
    });

    it("VALID_AGE_GROUPSが正しく設定されること", () => {
      expect(VALID_AGE_GROUPS).toEqual([
        "under20",
        "20s",
        "30s",
        "40s",
        "50s",
        "60s",
        "over70",
      ]);
    });

    it("VALID_UNDERSTANDING_RATINGSが正しく設定されること", () => {
      expect(VALID_UNDERSTANDING_RATINGS).toEqual([1, 2, 3, 4, 5]);
    });

    it("VALID_SATISFACTION_RATINGSが正しく設定されること", () => {
      expect(VALID_SATISFACTION_RATINGS).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("debugQuestionSets", () => {
    it("コンソール出力が正しく実行されること", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      debugQuestionSets();

      expect(consoleSpy).toHaveBeenCalledWith("Loaded Question Sets:", [
        "lecture_evaluation",
      ]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Set: 講義評価質問項目 (lecture_evaluation)",
      );
      expect(consoleSpy).toHaveBeenCalledWith("Questions: 5");
      expect(consoleSpy).toHaveBeenCalledWith("Active: true");

      consoleSpy.mockRestore();
    });
  });

  describe("getQuestionSetStats", () => {
    it("質問セットの統計情報を正しく取得すること", () => {
      const stats = getQuestionSetStats();

      expect(stats.totalSets).toBe(1);
      expect(stats.activeSets).toBe(1);
      expect(stats.sets).toHaveLength(1);

      const lectureStats = stats.sets[0];
      expect(lectureStats.setId).toBe("lecture_evaluation");
      expect(lectureStats.name).toBe("講義評価質問項目");
      expect(lectureStats.version).toBe("1.0");
      expect(lectureStats.questionCount).toBe(5);
      expect(lectureStats.requiredQuestions).toBe(4); // gender, age_group, understanding, satisfaction
      expect(lectureStats.optionCount).toBe(21); // 4+7+5+5+0の合計
      expect(lectureStats.isActive).toBe(true);
    });

    it("必須質問数が正しくカウントされること", () => {
      const stats = getQuestionSetStats();
      const lectureStats = stats.sets[0];

      // free_comment以外の4つが必須
      expect(lectureStats.requiredQuestions).toBe(4);
    });

    it("選択肢数が正しくカウントされること", () => {
      const stats = getQuestionSetStats();
      const lectureStats = stats.sets[0];

      // gender(4) + age_group(7) + understanding(5) + satisfaction(5) + free_comment(0) = 21
      expect(lectureStats.optionCount).toBe(21);
    });
  });

  describe("講義用質問項目の具体的検証", () => {
    it("全5項目の質問が正しく定義されていること", () => {
      const questionSet = LECTURE_EVALUATION_QUESTION_SET;
      const questionIds = questionSet.questions.map((q) => q.questionId);

      expect(questionIds).toEqual([
        "gender",
        "age_group",
        "understanding",
        "satisfaction",
        "free_comment",
      ]);
    });

    it("性別質問が正しく定義されていること", () => {
      const genderQuestion = getQuestion("lecture_evaluation", "gender");
      expect(genderQuestion?.questionType).toBe("radio");
      expect(genderQuestion?.isRequired).toBe(true);
      expect(genderQuestion?.options).toHaveLength(4);
    });

    it("年代質問が正しく定義されていること", () => {
      const ageQuestion = getQuestion("lecture_evaluation", "age_group");
      expect(ageQuestion?.questionType).toBe("radio");
      expect(ageQuestion?.isRequired).toBe(true);
      expect(ageQuestion?.options).toHaveLength(7);
    });

    it("理解度質問が正しく定義されていること", () => {
      const understandingQuestion = getQuestion(
        "lecture_evaluation",
        "understanding",
      );
      expect(understandingQuestion?.questionType).toBe("radio");
      expect(understandingQuestion?.isRequired).toBe(true);
      expect(understandingQuestion?.analysisType).toBe("likert");
      expect(understandingQuestion?.options).toHaveLength(5);
    });

    it("満足度質問が正しく定義されていること", () => {
      const satisfactionQuestion = getQuestion(
        "lecture_evaluation",
        "satisfaction",
      );
      expect(satisfactionQuestion?.questionType).toBe("radio");
      expect(satisfactionQuestion?.isRequired).toBe(true);
      expect(satisfactionQuestion?.analysisType).toBe("likert");
      expect(satisfactionQuestion?.options).toHaveLength(5);
    });

    it("フリーコメント質問が正しく定義されていること", () => {
      const commentQuestion = getQuestion("lecture_evaluation", "free_comment");
      expect(commentQuestion?.questionType).toBe("text");
      expect(commentQuestion?.isRequired).toBe(false);
      expect(commentQuestion?.analysisType).toBe("text");
      expect(commentQuestion?.options).toHaveLength(0);
    });
  });
});
