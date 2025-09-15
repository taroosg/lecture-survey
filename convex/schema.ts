import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// スキーマファイルのインポート
import { extendedUsersTable } from "./shared/schemas/users";
import { lecturesTable } from "./shared/schemas/lectures";
import { questionSetsTable } from "./shared/schemas/questionSets";
import { requiredResponsesTable } from "./shared/schemas/responses";
import { operationLogsTable } from "./shared/schemas/operationLogs";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  // usersテーブルをカスタムフィールド付きでオーバーライド
  users: extendedUsersTable,

  // 講義アンケートシステム用テーブル
  lectures: lecturesTable,
  questionSets: questionSetsTable,
  requiredResponses: requiredResponsesTable,
  operationLogs: operationLogsTable,
});
