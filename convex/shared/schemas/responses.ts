import { defineTable } from "convex/server";
import { v } from "convex/values";

// 必須項目回答（講義評価用）
export const requiredResponsesTable = defineTable({
  lectureId: v.id("lectures"), // matchId → lectureId

  // 講義評価用の回答データ
  gender: v.string(), // 性別
  ageGroup: v.string(), // 年代
  understanding: v.number(), // 理解度（1-5）
  satisfaction: v.number(), // 満足度（1-5）
  freeComment: v.optional(v.string()), // フリーコメント（任意）

  // メタデータ
  userAgent: v.optional(v.string()),
  ipAddress: v.optional(v.string()),
  responseTime: v.optional(v.number()), // 回答にかかった時間（秒）

  createdAt: v.number(),
})
  .index("by_lecture", ["lectureId"])
  .index("by_ip", ["ipAddress"]) // 重複チェック用
  .index("by_created_at", ["createdAt"]);

// 追加項目回答（第2フェーズで実装予定）
export const additionalResponsesTable = defineTable({
  requiredResponseId: v.id("requiredResponses"),
  lectureId: v.id("lectures"),
  questionSetId: v.string(),

  // 追加項目の回答データ（動的構造）
  responses: v.record(v.string(), v.union(v.string(), v.array(v.string()))),

  createdAt: v.number(),
})
  .index("by_required_response", ["requiredResponseId"])
  .index("by_lecture", ["lectureId"])
  .index("by_question_set", ["questionSetId"]);
