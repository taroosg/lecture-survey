// 質問セット関連の型定義

export interface QuestionOption {
  value: string;
  label: string;
  numericValue?: number;
  sortOrder: number;
}

export interface Question {
  questionId: string;
  questionText: string;
  questionType: "radio" | "checkbox" | "text";
  isRequired: boolean;
  sortOrder: number;
  analysisType: "categorical" | "likert" | "text";
  options: QuestionOption[];
}

export interface QuestionSet {
  setId: string;
  name: string;
  description: string;
  version: string;
  requiresEventName: boolean;
  isActive: boolean;
  sortOrder: number;
  questions: Question[];
}

// 回答データの型定義
export interface QuestionResponse {
  questionId: string;
  value: string | string[];
}

export interface SurveyResponse {
  setId: string;
  responses: QuestionResponse[];
}

// 統計分析用の型定義
export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: string;
  analysisType: string;
  distribution: Record<string, number>;
  mode?: string;
  average?: number;
  ranking?: Array<{ item: string; count: number }>;
}

export interface SetStatistics {
  setId: string;
  setName: string;
  totalResponses: number;
  completionRate: number;
  questions: QuestionStatistics[];
}

// 選択肢配列の型（フロントエンド用）
export type OptionArray = readonly QuestionOption[];

// バリデーション用の型
export type QuestionValue = string | number;
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// 質問セットマップの型
export type QuestionSetMap = Record<string, QuestionSet>;

// エクスポート用の便利な型（講義用に調整）
export type LectureQuestionIds =
  | "gender"
  | "age_group"
  | "understanding"
  | "satisfaction"
  | "free_comment";

// 数値型満足度・理解度の型
export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;
export type UnderstandingRating = 1 | 2 | 3 | 4 | 5;
