/**
 * 講義フォームのバリデーションと変換を行う純粋関数群
 */

export interface LectureFormData {
  title: string;
  lectureDate: string; // YYYY-MM-DD
  lectureTime: string; // HH:MM
  description?: string;
  surveyCloseDate: string; // YYYY-MM-DD
  surveyCloseTime: string; // HH:MM
}

export interface FormErrors {
  title?: string;
  lectureDate?: string;
  lectureTime?: string;
  description?: string;
  surveyCloseDate?: string;
  surveyCloseTime?: string;
  general?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

/**
 * 講義フォームデータのバリデーションを行う純粋関数
 */
export function validateLectureForm(
  formData: LectureFormData,
): ValidationResult {
  const errors: FormErrors = {};

  // 必須フィールドの検証
  if (!formData.title.trim()) {
    errors.title = "講義タイトルは必須です";
  } else if (formData.title.length > 100) {
    errors.title = "講義タイトルは100文字以内で入力してください";
  }

  if (!formData.lectureDate) {
    errors.lectureDate = "講義日は必須です";
  } else if (!isValidDateFormat(formData.lectureDate)) {
    errors.lectureDate = "有効な日付を入力してください";
  }

  if (!formData.lectureTime) {
    errors.lectureTime = "講義時間は必須です";
  } else if (!isValidTimeFormat(formData.lectureTime)) {
    errors.lectureTime = "有効な時間を入力してください";
  }

  if (!formData.surveyCloseDate) {
    errors.surveyCloseDate = "アンケート締切日は必須です";
  } else if (!isValidDateFormat(formData.surveyCloseDate)) {
    errors.surveyCloseDate = "有効な日付を入力してください";
  }

  if (!formData.surveyCloseTime) {
    errors.surveyCloseTime = "アンケート締切時間は必須です";
  } else if (!isValidTimeFormat(formData.surveyCloseTime)) {
    errors.surveyCloseTime = "有効な時間を入力してください";
  }

  // 説明文の文字数制限
  if (formData.description && formData.description.length > 500) {
    errors.description = "講義説明は500文字以内で入力してください";
  }

  // 日時の妥当性チェック
  if (
    formData.lectureDate &&
    formData.lectureTime &&
    formData.surveyCloseDate &&
    formData.surveyCloseTime &&
    isValidDateFormat(formData.lectureDate) &&
    isValidTimeFormat(formData.lectureTime) &&
    isValidDateFormat(formData.surveyCloseDate) &&
    isValidTimeFormat(formData.surveyCloseTime)
  ) {
    const lectureDateTime = new Date(
      `${formData.lectureDate}T${formData.lectureTime}`,
    );
    const closeDateTime = new Date(
      `${formData.surveyCloseDate}T${formData.surveyCloseTime}`,
    );

    if (closeDateTime <= lectureDateTime) {
      errors.general = "アンケート締切日時は講義日時より後に設定してください";
    }

    // 過去の日時チェック
    const now = new Date();
    if (lectureDateTime < now) {
      errors.lectureDate = "講義日時は現在時刻より後に設定してください";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * フォーム入力値を正規化する純粋関数
 */
export function formatFormData(formData: LectureFormData): LectureFormData {
  return {
    title: formData.title.trim(),
    lectureDate: formData.lectureDate,
    lectureTime: formData.lectureTime,
    description: formData.description?.trim() || undefined,
    surveyCloseDate: formData.surveyCloseDate,
    surveyCloseTime: formData.surveyCloseTime,
  };
}

/**
 * フォーム全体の有効性を判定する純粋関数
 */
export function isFormValid(formData: LectureFormData): boolean {
  const validation = validateLectureForm(formData);
  return validation.isValid;
}

/**
 * 送信用データの変換を行う純粋関数
 */
export function getFormSubmitData(formData: LectureFormData): LectureFormData {
  const formatted = formatFormData(formData);
  return {
    title: formatted.title,
    lectureDate: formatted.lectureDate,
    lectureTime: formatted.lectureTime,
    description: formatted.description,
    surveyCloseDate: formatted.surveyCloseDate,
    surveyCloseTime: formatted.surveyCloseTime,
  };
}

/**
 * 各フィールドのエラー状態を計算する純粋関数
 */
export function calculateFormErrors(formData: LectureFormData): FormErrors {
  const validation = validateLectureForm(formData);
  return validation.errors;
}

/**
 * 日付形式（YYYY-MM-DD）の妥当性をチェックする純粋関数
 */
function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return (
    parsedDate instanceof Date &&
    !isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
}

/**
 * 時間形式（HH:MM）の妥当性をチェックする純粋関数
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}
