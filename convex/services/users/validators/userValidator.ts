/**
 * ユーザードメインのバリデーション機能
 * 純粋関数として実装し、ユーザーデータの検証を行う
 */

/**
 * ユーザープロファイルデータの型定義
 */
export interface UserProfile {
  name?: string;
  email?: string;
  role?: "user" | "admin";
}

/**
 * ユーザープロファイル更新データの型定義
 */
export interface UserProfileUpdate {
  name?: string;
}

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * ユーザープロファイルのバリデーション
 * @param profile - バリデーション対象のプロファイルデータ
 * @returns バリデーション結果
 */
export const validateUserProfile = (profile: UserProfile): ValidationResult => {
  const errors: string[] = [];

  // メールアドレスのバリデーション
  if (profile.email !== undefined) {
    if (!isValidEmail(profile.email)) {
      errors.push("メールアドレスの形式が正しくありません");
    }
  }

  // ロールのバリデーション
  if (profile.role !== undefined) {
    const roleValidation = validateUserRole(profile.role);
    if (!roleValidation.isValid) {
      errors.push(...roleValidation.errors);
    }
  }

  // 名前のバリデーション（長さ制限）
  if (profile.name !== undefined && profile.name.length > 100) {
    errors.push("名前は100文字以内で入力してください");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * ユーザーロールのバリデーション
 * @param role - バリデーション対象のロール
 * @returns バリデーション結果
 */
export const validateUserRole = (role: string): ValidationResult => {
  const validRoles = ["user", "admin"];

  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      errors: [`無効なロールです。有効なロール: ${validRoles.join(", ")}`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

/**
 * プロファイル更新データのバリデーション
 * @param updateData - 更新データ
 * @returns バリデーション結果
 */
export const validateUserProfileUpdate = (
  updateData: UserProfileUpdate,
): ValidationResult => {
  const errors: string[] = [];

  // 名前のバリデーション
  if (updateData.name !== undefined) {
    if (updateData.name.length > 100) {
      errors.push("名前は100文字以内で入力してください");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * メールアドレス形式の検証（純粋関数）
 * @param email - 検証対象のメールアドレス
 * @returns メールアドレスが有効かどうか
 */
export const isValidEmail = (email: string): boolean => {
  if (email.length > 255) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // 連続ドットをチェック
  if (email.includes("..")) return false;

  return true;
};

/**
 * ユーザー入力データのサニタイゼーション（純粋関数）
 * @param input - サニタイゼーション対象の文字列
 * @returns サニタイゼーション済みの文字列
 */
export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, " ") // 連続する空白を単一スペースに
    .slice(0, 1000); // 最大長制限
};
