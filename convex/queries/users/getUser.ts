/**
 * Internal Queries - ユーザー取得機能
 * IDや認証情報によるユーザー取得のinternal関数群
 */

import { internalQuery } from "../../_generated/server";
import type { QueryCtx } from "../../_generated/server";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../../_generated/dataModel";

/**
 * ユーザーデータの型定義
 */
export type UserData = Doc<"users">;

/**
 * IDによるユーザー取得（ヘルパー関数）
 */
export const getUserByIdHelper = async (
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<UserData | null> => {
  return await ctx.db.get(userId);
};

/**
 * IDによるユーザー取得
 * @param ctx - Convexクエリコンテキスト
 * @param userId - ユーザーID
 * @returns ユーザーデータ（存在しない場合はnull）
 */
export const getUserById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<UserData | null> => {
    return await getUserByIdHelper(ctx, args.userId);
  },
});

/**
 * 現在認証されているユーザーの取得（ヘルパー関数）
 */
const getCurrentUserHelper = async (
  ctx: QueryCtx,
): Promise<UserData | null> => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  return await getUserByIdHelper(ctx, userId);
};

/**
 * 現在認証されているユーザーの取得
 * @param ctx - Convexクエリコンテキスト
 * @returns 認証ユーザーのデータ（認証されていない場合はnull）
 */
export const getCurrentUser = internalQuery({
  args: {},
  handler: async (ctx): Promise<UserData | null> => {
    return await getCurrentUserHelper(ctx);
  },
});

/**
 * 複数のユーザーIDによる一括取得（ヘルパー関数）
 */
const getUsersByIdsHelper = async (
  ctx: QueryCtx,
  userIds: Id<"users">[],
): Promise<UserData[]> => {
  const users = await Promise.all(
    userIds.map(async (userId) => {
      return await getUserByIdHelper(ctx, userId);
    }),
  );

  // null値を除外して返す
  return users.filter((user): user is UserData => user !== null);
};

/**
 * 複数のユーザーIDによる一括取得
 * @param ctx - Convexクエリコンテキスト
 * @param userIds - ユーザーIDの配列
 * @returns ユーザーデータの配列（存在しないIDは除外）
 */
export const getUsersByIds = internalQuery({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args): Promise<UserData[]> => {
    return await getUsersByIdsHelper(ctx, args.userIds);
  },
});
