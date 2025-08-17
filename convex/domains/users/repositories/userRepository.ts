/**
 * ユーザードメインのリポジトリ層
 * データベースアクセスとユーザー操作を担当
 */

import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../../../_generated/server";
import type { Doc, Id } from "../../../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * ユーザーデータの型定義
 */
export type UserData = Doc<"users">;

/**
 * ユーザー作成データの型定義
 */
export interface CreateUserData {
  name?: string;
  email?: string;
  role?: "user" | "admin";
  isActive?: boolean;
}

/**
 * ユーザー更新データの型定義
 */
export interface UpdateUserData {
  name?: string;
  role?: "user" | "admin";
  isActive?: boolean;
  updatedAt?: number;
}

/**
 * ユーザーフィルター条件の型定義
 */
export interface UserFilter {
  role?: "user" | "admin";
  isActive?: boolean;
}

/**
 * IDによるユーザー取得
 * @param ctx - Convexクエリコンテキスト
 * @param userId - ユーザーID
 * @returns ユーザーデータ（存在しない場合はnull）
 */
export const getUserById = async (
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<UserData | null> => {
  return await ctx.db.get(userId);
};

/**
 * 現在認証されているユーザーの取得
 * @param ctx - Convexクエリコンテキスト
 * @returns 認証ユーザーのデータ（認証されていない場合はnull）
 */
export const getCurrentUser = async (
  ctx: QueryCtx,
): Promise<UserData | null> => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  return await getUserById(ctx, userId);
};

/**
 * メールアドレスによるユーザー取得
 * @param ctx - Convexクエリコンテキスト
 * @param email - メールアドレス
 * @returns ユーザーデータ（存在しない場合はnull）
 */
export const getUserByEmail = async (
  ctx: QueryCtx,
  email: string,
): Promise<UserData | null> => {
  return await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .first();
};


/**
 * ロール別ユーザー一覧取得
 * @param ctx - Convexクエリコンテキスト
 * @param role - ユーザーロール
 * @param filter - 追加フィルター条件
 * @returns ユーザー一覧
 */
export const getUsersByRole = async (
  ctx: QueryCtx,
  role: "user" | "admin",
  filter?: Omit<UserFilter, "role">,
): Promise<UserData[]> => {
  let query = ctx.db
    .query("users")
    .withIndex("role", (q) => q.eq("role", role));

  const users = await query.collect();

  // 追加フィルターの適用
  return users.filter((user) => {
    if (filter?.isActive !== undefined && user.isActive !== filter.isActive)
      return false;
    return true;
  });
};

/**
 * アクティブユーザー一覧取得
 * @param ctx - Convexクエリコンテキスト
 * @param filter - 追加フィルター条件
 * @returns アクティブユーザー一覧
 */
export const getActiveUsers = async (
  ctx: QueryCtx,
  filter?: Pick<UserFilter, "role">,
): Promise<UserData[]> => {
  let query = ctx.db
    .query("users")
    .withIndex("active", (q) => q.eq("isActive", true));

  const users = await query.collect();

  // 追加フィルターの適用
  return users.filter((user) => {
    if (filter?.role && user.role !== filter.role) return false;
    return true;
  });
};

/**
 * ユーザープロファイル更新
 * @param ctx - Convexミューテーションコンテキスト
 * @param userId - 更新対象ユーザーID
 * @param updateData - 更新データ
 * @returns 更新されたユーザーデータ
 */
export const updateUserProfile = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  updateData: UpdateUserData,
): Promise<UserData> => {
  // ユーザーの存在確認
  const existingUser = await ctx.db.get(userId);
  if (!existingUser) {
    throw new ConvexError("ユーザーが見つかりません");
  }

  // プロファイル更新
  await ctx.db.patch(userId, {
    ...updateData,
    updatedAt: updateData.updatedAt || Date.now(),
  });

  // 更新後のデータを取得して返す
  const updatedUser = await ctx.db.get(userId);
  if (!updatedUser) {
    throw new ConvexError("更新後のユーザーデータの取得に失敗しました");
  }

  return updatedUser;
};

/**
 * ユーザーロール更新
 * @param ctx - Convexミューテーションコンテキスト
 * @param userId - 更新対象ユーザーID
 * @param newRole - 新しいロール
 * @returns 更新されたユーザーデータ
 */
export const updateUserRole = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  newRole: "user" | "admin",
): Promise<UserData> => {
  // ユーザーの存在確認
  const existingUser = await ctx.db.get(userId);
  if (!existingUser) {
    throw new ConvexError("ユーザーが見つかりません");
  }

  // ロール更新
  await ctx.db.patch(userId, {
    role: newRole,
    updatedAt: Date.now(),
  });

  // 更新後のデータを取得して返す
  const updatedUser = await ctx.db.get(userId);
  if (!updatedUser) {
    throw new ConvexError("更新後のユーザーデータの取得に失敗しました");
  }

  return updatedUser;
};

/**
 * ユーザーアクティブ状態更新
 * @param ctx - Convexミューテーションコンテキスト
 * @param userId - 更新対象ユーザーID
 * @param isActive - 新しいアクティブ状態
 * @returns 更新されたユーザーデータ
 */
export const updateUserActiveStatus = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  isActive: boolean,
): Promise<UserData> => {
  // ユーザーの存在確認
  const existingUser = await ctx.db.get(userId);
  if (!existingUser) {
    throw new ConvexError("ユーザーが見つかりません");
  }

  // アクティブ状態更新
  await ctx.db.patch(userId, {
    isActive,
    updatedAt: Date.now(),
  });

  // 更新後のデータを取得して返す
  const updatedUser = await ctx.db.get(userId);
  if (!updatedUser) {
    throw new ConvexError("更新後のユーザーデータの取得に失敗しました");
  }

  return updatedUser;
};

/**
 * ユーザー統計情報取得
 * @param ctx - Convexクエリコンテキスト
 * @returns ユーザー統計情報
 */
export const getUserStats = async (
  ctx: QueryCtx,
): Promise<{
  total: number;
  active: number;
  inactive: number;
  admins: number;
  users: number;
}> => {
  const users = await ctx.db.query("users").collect();

  // 統計計算
  const total = users.length;
  const active = users.filter((user) => user.isActive !== false).length;
  const inactive = total - active;
  const admins = users.filter((user) => user.role === "admin").length;
  const usersCount = users.filter((user) => user.role !== "admin").length;

  return {
    total,
    active,
    inactive,
    admins,
    users: usersCount,
  };
};
