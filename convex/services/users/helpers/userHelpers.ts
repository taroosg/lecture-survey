/**
 * ユーザー関連のヘルパー関数
 * 純粋関数として実装し、ユーザーデータの操作やチェックを行う
 */

import type { Doc } from "../../../_generated/dataModel";

/**
 * ユーザーデータの型定義
 */
export type UserData = Doc<"users">;

/**
 * ユーザーがアクティブかどうかを判定する（純粋関数）
 * @param user - 判定対象のユーザーデータ
 * @returns ユーザーがアクティブかどうか
 */
export const isUserActive = (user: UserData | null | undefined): boolean => {
  if (!user) return false;

  // isActiveフィールドが明示的にfalseの場合のみ非アクティブとみなす
  return user.isActive !== false;
};

/**
 * ユーザーが管理者かどうかを判定する（純粋関数）
 * @param user - 判定対象のユーザーデータ
 * @returns ユーザーが管理者かどうか
 */
export const isAdmin = (user: UserData | null | undefined): boolean => {
  return user?.role === "admin";
};

/**
 * ユーザーの表示名を取得する（純粋関数）
 * @param user - 表示名を取得するユーザーデータ
 * @returns ユーザーの表示名
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
 * ユーザーが他のユーザーを管理できるかどうかを判定する（純粋関数）
 * @param actor - 操作を行うユーザーデータ
 * @param target - 操作対象のユーザーデータ
 * @returns 管理権限があるかどうか
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
