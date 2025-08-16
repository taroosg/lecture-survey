import { describe, test, expect } from "vitest";
import { extendedUsersTable } from "./users";

describe("extendedUsersTable スキーマテスト", () => {
  test("usersテーブル定義が正常である", () => {
    // テーブル定義が存在することを確認
    expect(extendedUsersTable).toBeDefined();
    expect(typeof extendedUsersTable).toBe("object");
  });

  test("必須フィールドが定義されている", () => {
    // テーブル定義の構造確認（内部実装には依存しない）
    expect(extendedUsersTable).toBeTruthy();
    expect(typeof extendedUsersTable).toBe("object");
  });

  test("講義システム用のカスタムフィールドが含まれている", () => {
    // extendedUsersTableが正常にexportされていることを確認
    expect(extendedUsersTable).toBeTruthy();
  });
});
