import { defineTable } from "convex/server";
import { v } from "convex/values";

// usersテーブルの拡張定義（authTablesのusersをオーバーライド）
export const extendedUsersTable = defineTable({
  // Default authTables fields
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),

  // Custom fields for 講義アンケートシステム
  role: v.optional(v.union(v.literal("user"), v.literal("admin"))), // Default: "user"
  organizationName: v.optional(v.string()), // 所属組織名
  isActive: v.optional(v.boolean()), // アカウント有効状態
  updatedAt: v.optional(v.number()), // 手動更新タイムスタンプ
})
  .index("email", ["email"])
  .index("phone", ["phone"])
  .index("role", ["role"]) // ロールベースクエリ用
  .index("organization", ["organizationName"]) // 組織ごとのクエリ用
  .index("active", ["isActive"]); // アクティブユーザーの絞り込み用
