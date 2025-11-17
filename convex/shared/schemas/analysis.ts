import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * 分析結果セット（メタデータ）
 * 1回の分析実行ごとに1レコード作成
 */
export const resultSetsTable = defineTable({
  lectureId: v.id("lectures"), // 講義ID
  closedAt: v.number(), // 締切タイムスタンプ（決定論的）
  totalResponses: v.number(), // 総回答数
  createdAt: v.number(), // 作成日時（決定論的、closedAtと同値）
}).index("by_lecture_closedAt", ["lectureId", "closedAt"]);

/**
 * 分析結果ファクト（統計データ）
 * 単純集計、クロス集計、サマリーを統一スキーマで管理
 */
export const resultFactsTable = defineTable({
  resultSetId: v.id("resultSets"), // 結果セットID
  lectureId: v.id("lectures"), // 講義ID
  statType: v.string(), // "simple" | "cross2" | "summary"

  // ディメンション（軸）
  dim1QuestionCode: v.string(), // 第1軸質問コード
  dim1OptionCode: v.string(), // 第1軸選択肢コード
  dim2QuestionCode: v.optional(v.string()), // 第2軸質問コード（cross2のみ）
  dim2OptionCode: v.optional(v.string()), // 第2軸選択肢コード（cross2のみ）
  targetQuestionCode: v.optional(v.string()), // 対象質問コード（summaryのみ）

  // メジャー（測定値）
  n: v.optional(v.number()), // 件数
  pct: v.optional(v.number()), // パーセント（単純集計）
  baseN: v.optional(v.number()), // 分母

  rowPct: v.optional(v.number()), // 行パーセント（クロス集計）
  rowBaseN: v.optional(v.number()), // 行分母
  colPct: v.optional(v.number()), // 列パーセント（クロス集計）
  colBaseN: v.optional(v.number()), // 列分母
  totalPct: v.optional(v.number()), // 全体パーセント（クロス集計）
  totalBaseN: v.optional(v.number()), // 全体分母

  avgScore: v.optional(v.number()), // 平均スコア（サマリー）

  createdAt: v.number(), // 作成日時
})
  .index("by_set_type_dim1", ["resultSetId", "statType", "dim1QuestionCode"])
  .index("by_lecture", ["lectureId"]);
