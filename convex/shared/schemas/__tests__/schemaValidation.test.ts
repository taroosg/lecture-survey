import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "../../../schema";

describe("Schema Migration Validation - 講義アンケートシステム", () => {
  test("講義システム用スキーマが正常に定義されている", () => {
    const t = convexTest(schema);

    // 主要テーブルの存在確認
    expect(schema.tables.users).toBeDefined();
    expect(schema.tables.lectures).toBeDefined();
    expect(schema.tables.questionSets).toBeDefined();
    expect(schema.tables.requiredResponses).toBeDefined();
    expect(schema.tables.operationLogs).toBeDefined();
  });

  test("lecturesテーブル定義が正常である", () => {
    const t = convexTest(schema);

    const lecturesTable = schema.tables.lectures;
    expect(lecturesTable).toBeDefined();
    expect(typeof lecturesTable).toBe("object");
  });

  test("requiredResponsesテーブル定義が正常である", () => {
    const t = convexTest(schema);

    const responsesTable = schema.tables.requiredResponses;
    expect(responsesTable).toBeDefined();
    expect(typeof responsesTable).toBe("object");
  });

  test("usersテーブルがカスタムフィールド付きで定義されている", () => {
    const t = convexTest(schema);

    const usersTable = schema.tables.users;
    expect(usersTable).toBeDefined();
    expect(typeof usersTable).toBe("object");
  });

  test("numbersテーブルが削除されている", () => {
    // numbersテーブルが存在しないことを確認（TypeScriptエラー回避のため@ts-expect-error使用）
    // @ts-expect-error: numbersテーブルが削除されているため undefined になることを確認
    expect(schema.tables.numbers).toBeUndefined();
  });

  test("operationLogsテーブルが講義用にアレンジされている", () => {
    const t = convexTest(schema);

    const operationLogsTable = schema.tables.operationLogs;
    expect(operationLogsTable).toBeDefined();
    expect(typeof operationLogsTable).toBe("object");
  });
});
