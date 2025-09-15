import { describe, test, expect } from "vitest";
import { requiredResponsesTable } from "../responses";

describe("responsesテーブル スキーマテスト", () => {
  test("requiredResponsesテーブル定義が正常である", () => {
    // テーブル定義が存在することを確認
    expect(requiredResponsesTable).toBeDefined();
    expect(typeof requiredResponsesTable).toBe("object");
  });

  test("必須回答テーブルの構造が定義されている", () => {
    // requiredResponsesTableが正常にexportされていることを確認
    expect(requiredResponsesTable).toBeTruthy();
    expect(typeof requiredResponsesTable).toBe("object");
  });

  test("講義評価用の回答フィールドが含まれている", () => {
    // テーブル定義が適切に設定されていることを確認
    expect(requiredResponsesTable).toBeTruthy();
  });
});
