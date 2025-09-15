/**
 * Internal Queries - メールアドレスによるユーザー検索機能
 * メールアドレスによるユーザー検索のinternal関数群
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";

/**
 * ユーザーデータの型定義
 */
export type UserData = Doc<"users">;

/**
 * メールアドレスによるユーザー取得
 * @param email - メールアドレス
 * @returns ユーザーデータ（存在しない場合はnull）
 */
export const getUserByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<UserData | null> => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

/**
 * 複数のメールアドレスによる一括ユーザー検索
 * @param emails - メールアドレスの配列
 * @returns ユーザーデータの配列（見つからないメールアドレスは除外）
 */
export const getUsersByEmails = internalQuery({
  args: {
    emails: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<UserData[]> => {
    const users = await Promise.all(
      args.emails.map(async (email) => {
        return await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", email))
          .first();
      }),
    );

    // null値を除外して返す
    return users.filter((user): user is UserData => user !== null);
  },
});

/**
 * メールアドレスの存在確認
 * @param email - メールアドレス
 * @returns メールアドレスが存在するかどうか
 */
export const emailExists = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    return user !== null;
  },
});

/**
 * メールアドレスパターンによる部分検索
 * @param emailPattern - メールアドレスの部分文字列
 * @returns マッチするユーザーデータの配列
 */
export const searchUsersByEmailPattern = internalQuery({
  args: {
    emailPattern: v.string(),
  },
  handler: async (ctx, args): Promise<UserData[]> => {
    const allUsers = await ctx.db.query("users").collect();

    // メールアドレスが設定されており、パターンにマッチするユーザーをフィルタリング
    return allUsers.filter((user) => {
      return (
        user.email &&
        user.email.toLowerCase().includes(args.emailPattern.toLowerCase())
      );
    });
  },
});
