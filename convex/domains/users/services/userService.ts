/**
 * ユーザードメインのビジネスロジック
 * 純粋関数とConvex依存関数を分離して実装
 */

import type { Doc } from "../../../_generated/dataModel";

/**
 * ユーザーデータの型定義
 */
export type UserData = Doc<"users">;

/**
 * 講義の型定義（他ドメインとの結合用）
 */
export interface LectureBasicInfo {
  _id: string;
  createdBy: string;
}

/**
 * ユーザーがアクティブかどうかを判定（純粋関数）
 * @param user - 判定対象のユーザーデータ
 * @returns ユーザーがアクティブかどうか
 */
export const isUserActive = (user: UserData | null | undefined): boolean => {
  if (!user) return false;

  // isActiveフィールドが明示的にfalseの場合のみ非アクティブとみなす
  return user.isActive !== false;
};

/**
 * ユーザーが講義にアクセスできるかどうかを判定（純粋関数）
 * @param user - アクセス権限を確認するユーザー
 * @param lecture - アクセス対象の講義
 * @returns アクセス可能かどうか
 */
export const canAccessLecture = (
  user: UserData | null | undefined,
  lecture: LectureBasicInfo | null | undefined,
): boolean => {
  if (!user || !lecture) return false;

  // 非アクティブユーザーはアクセス不可
  if (!isUserActive(user)) return false;

  // 管理者は全ての講義にアクセス可能
  if (user.role === "admin") return true;

  // 講義作成者は自分の講義にアクセス可能
  if (lecture.createdBy === user._id) return true;

  return false;
};

/**
 * ユーザーの表示名を取得（純粋関数）
 * @param user - 表示名を取得するユーザー
 * @returns 表示名
 */
export const getUserDisplayName = (
  user: UserData | null | undefined,
): string => {
  if (!user) return "不明なユーザー";

  // 名前が設定されている場合は名前を使用
  if (user.name && user.name.trim()) {
    return user.name.trim();
  }

  // 名前がない場合はメールアドレスのローカル部分を使用
  if (user.email) {
    const emailParts = user.email.split("@");
    if (emailParts.length > 1) {
      const localPart = emailParts[0];
      return localPart || "ユーザー";
    }
  }

  return "ユーザー";
};

/**
 * ユーザーが管理者権限を持つかどうかを判定（純粋関数）
 * @param user - 権限を確認するユーザー
 * @returns 管理者権限を持つかどうか
 */
export const isAdmin = (user: UserData | null | undefined): boolean => {
  return user?.role === "admin";
};

/**
 * ユーザーがユーザー管理操作を実行できるかどうかを判定（純粋関数）
 * @param actor - 操作を実行するユーザー
 * @param target - 操作対象のユーザー
 * @returns 操作可能かどうか
 */
export const canManageUser = (
  actor: UserData | null | undefined,
  target: UserData | null | undefined,
): boolean => {
  if (!actor || !target) return false;

  // 非アクティブユーザーは操作不可
  if (!isUserActive(actor)) return false;

  // 管理者は他のユーザーを管理可能
  if (isAdmin(actor)) return true;

  // 自分自身のプロファイルは編集可能
  if (actor._id === target._id) return true;

  return false;
};

/**
 * ユーザープロファイルの更新データを準備（純粋関数）
 * @param user - 現在のユーザーデータ
 * @param updateData - 更新データ
 * @returns 準備された更新データ
 */
export const prepareUserProfileUpdate = (
  user: UserData,
  updateData: { name?: string },
): { name?: string; updatedAt: number } => {
  const prepared: {
    name?: string;
    updatedAt: number;
  } = {
    updatedAt: Date.now(),
  };

  // 名前の更新
  if (updateData.name !== undefined) {
    prepared.name = updateData.name.trim() || undefined;
  }

  return prepared;
};

/**
 * ユーザーのロール変更データを準備（純粋関数）
 * @param newRole - 新しいロール
 * @returns 準備された更新データ
 */
export const prepareUserRoleUpdate = (
  newRole: "user" | "admin",
): { role: "user" | "admin"; updatedAt: number } => {
  return {
    role: newRole,
    updatedAt: Date.now(),
  };
};

/**
 * ユーザーアカウントの有効/無効状態の変更データを準備（純粋関数）
 * @param isActive - 新しいアクティブ状態
 * @returns 準備された更新データ
 */
export const prepareUserActiveStatusUpdate = (
  isActive: boolean,
): { isActive: boolean; updatedAt: number } => {
  return {
    isActive,
    updatedAt: Date.now(),
  };
};
