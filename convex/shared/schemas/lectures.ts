import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lecturesTable = defineTable({
  title: v.string(), // 講義タイトル
  lectureDate: v.string(), // YYYY-MM-DD
  lectureTime: v.string(), // HH:MM
  description: v.optional(v.string()), // 講義説明

  // アンケート設定
  surveyCloseDate: v.string(), // YYYY-MM-DD
  surveyCloseTime: v.string(), // HH:MM

  // アンケートURL
  surveyUrl: v.string(),
  surveySlug: v.string(),

  // 状態管理
  surveyStatus: v.union(v.literal("active"), v.literal("closed")),
  closedAt: v.optional(v.number()),

  // 作成者情報
  createdBy: v.id("users"),
  organizationName: v.string(),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_creator", ["createdBy"])
  .index("by_organization", ["organizationName"])
  .index("by_survey_status", ["surveyStatus"])
  .index("by_lecture_date", ["lectureDate"])
  .index("by_survey_slug", ["surveySlug"]);
