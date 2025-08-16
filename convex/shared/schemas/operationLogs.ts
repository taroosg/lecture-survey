import { defineTable } from "convex/server";
import { v } from "convex/values";

// 操作ログ（講義アンケートシステム用）
export const operationLogsTable = defineTable({
  userId: v.optional(v.id("users")), // 匿名アクセスの場合はnull
  lectureId: v.optional(v.id("lectures")), // matchId → lectureId

  action: v.string(), // "create_lecture", "submit_response", "close_survey", "analyze", etc.
  details: v.any(), // アクション固有の詳細情報

  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),

  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_lecture", ["lectureId"])
  .index("by_action", ["action"])
  .index("by_created_at", ["createdAt"]);
