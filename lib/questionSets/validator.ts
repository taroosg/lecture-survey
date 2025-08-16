import {
  QuestionSet,
  Question,
  QuestionOption,
  ValidationResult,
} from "./types";

// 質問セットの構造検証
export const validateQuestionSet = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  // 型ガード: dataがObjectかどうかをチェック
  if (!data || typeof data !== "object") {
    errors.push("データがオブジェクトではありません");
    return { isValid: false, errors };
  }

  const dataObj = data as Record<string, unknown>;

  // 必須フィールドの検証
  const requiredFields = [
    "setId",
    "name",
    "description",
    "version",
    "questions",
  ];
  for (const field of requiredFields) {
    if (!dataObj[field]) {
      errors.push(`必須フィールド '${field}' が不足しています`);
    }
  }

  // setIdの形式検証
  if (dataObj.setId && typeof dataObj.setId !== "string") {
    errors.push("setIdは文字列である必要があります");
  }

  // questionsの配列検証
  if (dataObj.questions && !Array.isArray(dataObj.questions)) {
    errors.push("questionsは配列である必要があります");
  }

  // 各質問の検証
  if (Array.isArray(dataObj.questions)) {
    dataObj.questions.forEach((question: unknown, index: number) => {
      const questionErrors = validateQuestion(question);
      if (!questionErrors.isValid) {
        questionErrors.errors.forEach((error) => {
          errors.push(`質問${index + 1}: ${error}`);
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 個別質問の検証
export const validateQuestion = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  // 型ガード: dataがObjectかどうかをチェック
  if (!data || typeof data !== "object") {
    errors.push("質問データがオブジェクトではありません");
    return { isValid: false, errors };
  }

  const dataObj = data as Record<string, unknown>;

  // 必須フィールドの検証
  const requiredFields = [
    "questionId",
    "questionText",
    "questionType",
    "isRequired",
    "sortOrder",
  ];
  for (const field of requiredFields) {
    if (dataObj[field] === undefined || dataObj[field] === null) {
      errors.push(`必須フィールド '${field}' が不足しています`);
    }
  }

  // questionTypeの検証
  const validTypes = ["radio", "checkbox", "text"];
  if (
    dataObj.questionType &&
    !validTypes.includes(dataObj.questionType as string)
  ) {
    errors.push(
      `questionTypeは ${validTypes.join(", ")} のいずれかである必要があります`,
    );
  }

  // analysisTypeの検証
  const validAnalysisTypes = ["categorical", "likert", "text"];
  if (
    dataObj.analysisType &&
    !validAnalysisTypes.includes(dataObj.analysisType as string)
  ) {
    errors.push(
      `analysisTypeは ${validAnalysisTypes.join(", ")} のいずれかである必要があります`,
    );
  }

  // 選択肢の検証（text以外の場合）
  if (dataObj.questionType !== "text") {
    if (!Array.isArray(dataObj.options) || dataObj.options.length === 0) {
      errors.push("radio/checkboxタイプの質問には選択肢が必要です");
    } else {
      dataObj.options.forEach((option: unknown, index: number) => {
        const optionErrors = validateOption(option);
        if (!optionErrors.isValid) {
          optionErrors.errors.forEach((error) => {
            errors.push(`選択肢${index + 1}: ${error}`);
          });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 選択肢の検証
export const validateOption = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  // 型ガード: dataがObjectかどうかをチェック
  if (!data || typeof data !== "object") {
    errors.push("選択肢データがオブジェクトではありません");
    return { isValid: false, errors };
  }

  const dataObj = data as Record<string, unknown>;

  // 必須フィールドの検証
  const requiredFields = ["value", "label", "sortOrder"];
  for (const field of requiredFields) {
    if (!dataObj[field] && dataObj[field] !== 0) {
      errors.push(`必須フィールド '${field}' が不足しています`);
    }
  }

  // sortOrderの数値検証
  if (dataObj.sortOrder && typeof dataObj.sortOrder !== "number") {
    errors.push("sortOrderは数値である必要があります");
  }

  // numericValueの数値検証（存在する場合）
  if (dataObj.numericValue && typeof dataObj.numericValue !== "number") {
    errors.push("numericValueは数値である必要があります");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 質問IDの重複チェック
export const validateQuestionIds = (
  questionSet: QuestionSet,
): ValidationResult => {
  const errors: string[] = [];
  const questionIds = new Set<string>();

  for (const question of questionSet.questions) {
    if (questionIds.has(question.questionId)) {
      errors.push(`重複した質問ID: ${question.questionId}`);
    }
    questionIds.add(question.questionId);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 選択肢値の重複チェック
export const validateOptionValues = (question: Question): ValidationResult => {
  const errors: string[] = [];
  const optionValues = new Set<string>();

  for (const option of question.options) {
    if (optionValues.has(option.value)) {
      errors.push(
        `質問 '${question.questionId}' で重複した選択肢値: ${option.value}`,
      );
    }
    optionValues.add(option.value);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 包括的な質問セット検証
export const validateCompleteQuestionSet = (
  data: unknown,
): ValidationResult => {
  const errors: string[] = [];

  // 基本構造の検証
  const structureValidation = validateQuestionSet(data);
  if (!structureValidation.isValid) {
    errors.push(...structureValidation.errors);
    return { isValid: false, errors }; // 構造が無効な場合は早期リターン
  }

  const questionSet = data as QuestionSet;

  // 質問IDの重複チェック
  const idValidation = validateQuestionIds(questionSet);
  if (!idValidation.isValid) {
    errors.push(...idValidation.errors);
  }

  // 各質問の選択肢値重複チェック
  for (const question of questionSet.questions) {
    const optionValidation = validateOptionValues(question);
    if (!optionValidation.isValid) {
      errors.push(...optionValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 型ガード関数
export const isQuestionSet = (data: unknown): data is QuestionSet => {
  const validation = validateCompleteQuestionSet(data);
  return validation.isValid;
};

export const isQuestion = (data: unknown): data is Question => {
  const validation = validateQuestion(data);
  return validation.isValid;
};

export const isQuestionOption = (data: unknown): data is QuestionOption => {
  const validation = validateOption(data);
  return validation.isValid;
};
