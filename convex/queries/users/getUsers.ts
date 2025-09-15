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
    const users = await ctx.db.query("users").collect();

    // フィルターの適用
    return users.filter((user) => {
      if (args.filter?.role && user.role !== args.filter.role) {
        return false;
      }
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
 * ユーザー統計情報取得
 * @returns ユーザー統計情報
 */
export const getUserStats = internalQuery({
  args: {},
  handler: async (ctx): Promise<UserStatistics> => {
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
