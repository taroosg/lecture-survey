/**
 * Internal Queries - ユーザー一覧取得機能
 * ロール別、アクティブ状態別のユーザー一覧取得とユーザー統計機能
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";

/**
 * ユーザーデータの型定義
 */
export type UserData = Doc<"users">;

/**
 * ユーザーフィルター条件の型定義
 */
export interface UserFilter {
  role?: "user" | "admin";
  isActive?: boolean;
}

/**
 * ユーザー統計情報の型定義
 */
export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  users: number;
}

/**
 * ロール別ユーザー一覧取得
 * @param role - ユーザーロール
 * @param filter - 追加フィルター条件
 * @returns ユーザー一覧
 */
export const getUsersByRole = internalQuery({
  args: {
    role: v.union(v.literal("user"), v.literal("admin")),
    filter: v.optional(
      v.object({
        isActive: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args): Promise<UserData[]> => {
    let query = ctx.db
      .query("users")
      .withIndex("role", (q) => q.eq("role", args.role));

    const users = await query.collect();

    // 追加フィルターの適用
    return users.filter((user) => {
      if (
        args.filter?.isActive !== undefined &&
        user.isActive !== args.filter.isActive
      ) {
        return false;
      }
      return true;
    });
  },
});

/**
 * アクティブユーザー一覧取得
 * @param filter - 追加フィルター条件
 * @returns アクティブユーザー一覧
 */
export const getActiveUsers = internalQuery({
  args: {
    filter: v.optional(
      v.object({
        role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
      }),
    ),
  },
  handler: async (ctx, args): Promise<UserData[]> => {
    let query = ctx.db
      .query("users")
      .withIndex("active", (q) => q.eq("isActive", true));

    const users = await query.collect();

    // 追加フィルターの適用
    return users.filter((user) => {
      if (args.filter?.role && user.role !== args.filter.role) {
        return false;
      }
      return true;
    });
  },
});

/**
 * 全ユーザー取得（管理者用）
 * @param filter - フィルター条件
 * @returns ユーザー一覧
 */
export const getAllUsers = internalQuery({
  args: {
    filter: v.optional(
      v.object({
        role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
        isActive: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args): Promise<UserData[]> => {
    // 最も選択的なフィルターに対応するインデックスを使用
    let users: UserData[];

    if (args.filter?.role) {
      users = await ctx.db
        .query("users")
        .withIndex("role", (q) => q.eq("role", args.filter!.role!))
        .collect();
    } else if (args.filter?.isActive !== undefined) {
      users = await ctx.db
        .query("users")
        .withIndex("active", (q) => q.eq("isActive", args.filter!.isActive!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    // インデックスで絞れなかった条件をメモリフィルタ
    if (args.filter?.role && args.filter?.isActive !== undefined) {
      return users.filter((user) => user.isActive === args.filter!.isActive);
    }

    return users;
  },
});

/**
 * ユーザー統計情報取得
 * @returns ユーザー統計情報
 */
export const getUserStats = internalQuery({
  args: {},
  handler: async (ctx): Promise<UserStatistics> => {
    // 各カテゴリをインデックスで並列取得
    const [activeUsers, inactiveUsers, adminUsers, regularUsers] =
      await Promise.all([
        ctx.db
          .query("users")
          .withIndex("active", (q) => q.eq("isActive", true))
          .collect(),
        ctx.db
          .query("users")
          .withIndex("active", (q) => q.eq("isActive", false))
          .collect(),
        ctx.db
          .query("users")
          .withIndex("role", (q) => q.eq("role", "admin"))
          .collect(),
        ctx.db
          .query("users")
          .withIndex("role", (q) => q.eq("role", "user"))
          .collect(),
      ]);

    return {
      total: activeUsers.length + inactiveUsers.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      admins: adminUsers.length,
      users: regularUsers.length,
    };
  },
});

/**
 * 管理者ユーザー一覧取得
 * @returns 管理者ユーザー一覧
 */
export const getAdminUsers = internalQuery({
  args: {},
  handler: async (ctx): Promise<UserData[]> => {
    return await ctx.db
      .query("users")
      .withIndex("role", (q) => q.eq("role", "admin"))
      .collect();
  },
});

/**
 * 一般ユーザー一覧取得
 * @returns 一般ユーザー一覧
 */
export const getRegularUsers = internalQuery({
  args: {},
  handler: async (ctx): Promise<UserData[]> => {
    return await ctx.db
      .query("users")
      .withIndex("role", (q) => q.eq("role", "user"))
      .collect();
  },
});

/**
 * ユーザー一覧取得（Internal Query）
 * フィルター条件に基づいてユーザーを取得
 * 認証と権限チェックは呼び出し元で実施済み
 */
export const getUsersInternal = internalQuery({
  args: {
    filter: v.optional(
      v.object({
        role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
        isActive: v.optional(v.boolean()),
      }),
    ),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, { filter }) => {
    // インデックスを優先使用してフルテーブルスキャンを回避
    if (filter?.role) {
      const users = await ctx.db
        .query("users")
        .withIndex("role", (q) => q.eq("role", filter.role!))
        .collect();

      if (filter.isActive !== undefined) {
        return users.filter((user) => user.isActive === filter.isActive);
      }
      return users;
    }

    if (filter?.isActive !== undefined) {
      return await ctx.db
        .query("users")
        .withIndex("active", (q) => q.eq("isActive", filter.isActive!))
        .collect();
    }

    return await ctx.db.query("users").collect();
  },
});
