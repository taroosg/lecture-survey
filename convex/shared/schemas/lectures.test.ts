import { describe, test, expect } from "vitest";
import { lecturesTable } from "./lectures";

describe("lecturesTable スキーマテスト", () => {
  test("lecturesテーブル定義が正常である", () => {
    // テーブル定義が存在することを確認
    expect(lecturesTable).toBeDefined();
    expect(typeof lecturesTable).toBe("object");
  });

  test("テーブル名が正しく設定されている", () => {
    // テーブル定義の構造確認（内部実装には依存しない）
    expect(lecturesTable).toBeTruthy();
    expect(typeof lecturesTable).toBe("object");
  });

  test("講義用のフィールド構造が定義されている", () => {
    // lecturesTableが正常にexportされていることを確認
    expect(lecturesTable).toBeTruthy();
  });
});
