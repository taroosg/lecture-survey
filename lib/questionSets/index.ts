import { QuestionSet, QuestionSetMap, OptionArray, Question } from "./types";
import { validateCompleteQuestionSet } from "./validator";

// JSONファイルの静的インポート
import lectureEvaluationData from "./definitions/lecture_evaluation.json";

// 質問セットの検証とロード
const loadQuestionSet = (data: unknown, setName: string): QuestionSet => {
  const validation = validateCompleteQuestionSet(data);

  if (!validation.isValid) {
    console.error(`質問セット '${setName}' の検証に失敗:`, validation.errors);
    throw new Error(
      `Invalid question set '${setName}': ${validation.errors.join(", ")}`,
    );
  }

  return data as QuestionSet;
};

// 検証済み質問セットの作成
export const LECTURE_EVALUATION_QUESTION_SET = loadQuestionSet(
  lectureEvaluationData,
  "lecture_evaluation",
);

// 全質問セットのマップ
export const QUESTION_SETS: QuestionSetMap = {
  [LECTURE_EVALUATION_QUESTION_SET.setId]: LECTURE_EVALUATION_QUESTION_SET,
} as const;

// アクティブな質問セットのみを取得
export const getActiveQuestionSets = (): QuestionSet[] => {
  return Object.values(QUESTION_SETS).filter((set) => set.isActive);
};

// 特定の質問セットを取得
export const getQuestionSet = (setId: string): QuestionSet | undefined => {
  return QUESTION_SETS[setId];
};

// 質問セットが存在するかチェック
export const hasQuestionSet = (setId: string): boolean => {
  return setId in QUESTION_SETS;
};

// 質問を取得するヘルパー関数
export const getQuestion = (
  setId: string,
  questionId: string,
): Question | undefined => {
  const questionSet = getQuestionSet(setId);
  return questionSet?.questions.find((q) => q.questionId === questionId);
};

// 特定の質問の選択肢を取得
export const getQuestionOptions = (
  setId: string,
  questionId: string,
): OptionArray => {
  const question = getQuestion(setId, questionId);
  return question?.options || [];
};

// 便利な定数エクスポート（講義用）
export const GENDER_OPTIONS = getQuestionOptions(
  LECTURE_EVALUATION_QUESTION_SET.setId,
  "gender",
);
export const AGE_GROUP_OPTIONS = getQuestionOptions(
  LECTURE_EVALUATION_QUESTION_SET.setId,
  "age_group",
);
export const UNDERSTANDING_OPTIONS = getQuestionOptions(
  LECTURE_EVALUATION_QUESTION_SET.setId,
  "understanding",
);
export const SATISFACTION_OPTIONS = getQuestionOptions(
  LECTURE_EVALUATION_QUESTION_SET.setId,
  "satisfaction",
);

// バリデーション用の値配列を生成
export const VALID_GENDERS = GENDER_OPTIONS.map((option) => option.value);
export const VALID_AGE_GROUPS = AGE_GROUP_OPTIONS.map((option) => option.value);
export const VALID_UNDERSTANDING_RATINGS = UNDERSTANDING_OPTIONS.map((option) =>
  Number(option.value),
);
export const VALID_SATISFACTION_RATINGS = SATISFACTION_OPTIONS.map((option) =>
  Number(option.value),
);

// 型定義の再エクスポート
export type {
  QuestionSet,
  Question,
  QuestionOption,
  QuestionSetMap,
  OptionArray,
  LectureQuestionIds,
  SatisfactionRating,
  UnderstandingRating,
  ValidationResult,
} from "./types";

// バリデーション関数の再エクスポート
export {
  validateCompleteQuestionSet,
  validateQuestionSet,
  validateQuestion,
  validateOption,
  isQuestionSet,
  isQuestion,
  isQuestionOption,
} from "./validator";

// デバッグ用の関数
export const debugQuestionSets = () => {
  console.log("Loaded Question Sets:", Object.keys(QUESTION_SETS));
  Object.values(QUESTION_SETS).forEach((set) => {
    console.log(`Set: ${set.name} (${set.setId})`);
    console.log(`Questions: ${set.questions.length}`);
    console.log(`Active: ${set.isActive}`);
  });
};

// 質問セットの統計情報を取得
export const getQuestionSetStats = () => {
  const stats = Object.values(QUESTION_SETS).map((set) => ({
    setId: set.setId,
    name: set.name,
    version: set.version,
    questionCount: set.questions.length,
    requiredQuestions: set.questions.filter((q) => q.isRequired).length,
    optionCount: set.questions.reduce((sum, q) => sum + q.options.length, 0),
    isActive: set.isActive,
  }));

  return {
    totalSets: stats.length,
    activeSets: stats.filter((s) => s.isActive).length,
    sets: stats,
  };
};
