import { QuestionSet, Question, QuestionOption } from "../types";

// 有効な選択肢の例
export const validGenderOption: QuestionOption = {
  value: "male",
  label: "男性",
  sortOrder: 1,
};

export const validSatisfactionOption: QuestionOption = {
  value: "5",
  label: "5（非常に満足）",
  numericValue: 5,
  sortOrder: 5,
};

// 有効な質問の例
export const validRadioQuestion: Question = {
  questionId: "test_gender",
  questionText: "テスト用性別質問",
  questionType: "radio",
  isRequired: true,
  sortOrder: 1,
  analysisType: "categorical",
  options: [
    {
      value: "male",
      label: "男性",
      sortOrder: 1,
    },
    {
      value: "female",
      label: "女性",
      sortOrder: 2,
    },
  ],
};

export const validTextQuestion: Question = {
  questionId: "test_comment",
  questionText: "テスト用コメント質問",
  questionType: "text",
  isRequired: false,
  sortOrder: 2,
  analysisType: "text",
  options: [],
};

// 有効な質問セットの例
export const validQuestionSet: QuestionSet = {
  setId: "test_set",
  name: "テスト質問セット",
  description: "テスト用の質問セット",
  version: "1.0",
  requiresEventName: false,
  isActive: true,
  sortOrder: 0,
  questions: [validRadioQuestion, validTextQuestion],
};

// 無効なデータの例
export const invalidQuestionSet = {
  // setIdが不足
  name: "無効な質問セット",
  description: "無効なテスト用質問セット",
  version: "1.0",
  questions: [],
};

export const invalidQuestion = {
  // questionIdが不足
  questionText: "無効な質問",
  questionType: "radio",
  isRequired: true,
  sortOrder: 1,
  options: [],
};

export const invalidOption = {
  // valueが不足
  label: "無効な選択肢",
  sortOrder: 1,
};

// 重複IDを持つ質問セット
export const duplicateIdQuestionSet: QuestionSet = {
  setId: "duplicate_test",
  name: "重複ID質問セット",
  description: "重複したquestionIdを持つテスト用質問セット",
  version: "1.0",
  requiresEventName: false,
  isActive: true,
  sortOrder: 0,
  questions: [
    {
      questionId: "duplicate_id",
      questionText: "重複ID質問1",
      questionType: "radio",
      isRequired: true,
      sortOrder: 1,
      analysisType: "categorical",
      options: [
        {
          value: "option1",
          label: "選択肢1",
          sortOrder: 1,
        },
      ],
    },
    {
      questionId: "duplicate_id", // 重複したID
      questionText: "重複ID質問2",
      questionType: "radio",
      isRequired: true,
      sortOrder: 2,
      analysisType: "categorical",
      options: [
        {
          value: "option2",
          label: "選択肢2",
          sortOrder: 1,
        },
      ],
    },
  ],
};

// 重複値を持つ選択肢の質問
export const duplicateValueQuestion: Question = {
  questionId: "duplicate_value_question",
  questionText: "重複値を持つ質問",
  questionType: "radio",
  isRequired: true,
  sortOrder: 1,
  analysisType: "categorical",
  options: [
    {
      value: "duplicate_value",
      label: "選択肢1",
      sortOrder: 1,
    },
    {
      value: "duplicate_value", // 重複したvalue
      label: "選択肢2",
      sortOrder: 2,
    },
  ],
};
