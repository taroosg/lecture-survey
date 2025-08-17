/**
 * userValidator.ts のテスト
 * 純粋関数として実装されたバリデーション機能のテスト
 */

import { describe, test, expect } from "vitest";
import {
  validateUserProfile,
  validateUserRole,
  validateUserProfileUpdate,
  isValidEmail,
  sanitizeUserInput,
} from "./userValidator";
import {
  validUserProfile,
  invalidEmailUserProfile,
  validProfileUpdate,
  invalidNameUpdateData,
  edgeCaseStrings,
  testEmails,
  testRoles,
} from "../__fixtures__/user-test-data";

describe("validateUserProfile", () => {
  test("正常なユーザープロファイルが渡された場合、バリデーションが成功すること", () => {
    const result = validateUserProfile(validUserProfile);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("必須フィールドが不足している場合でもエラーにならないこと（オプショナルフィールドのため）", () => {
    const profile = {}; // 空のプロファイル
    const result = validateUserProfile(profile);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("メールアドレス形式が正しくない場合、エラーになること", () => {
    const result = validateUserProfile(invalidEmailUserProfile);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("メールアドレスの形式が正しくありません");
  });

  test("無効なロールが指定された場合、エラーになること", () => {
    const profile = {
      ...validUserProfile,
      role: "invalid" as any,
    };
    const result = validateUserProfile(profile);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((error) => error.includes("無効なロール"))).toBe(
      true,
    );
  });

  test("名前が100文字を超える場合、エラーになること", () => {
    const profile = {
      ...validUserProfile,
      name: edgeCaseStrings.tooLongName,
    };
    const result = validateUserProfile(profile);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("名前は100文字以内で入力してください");
  });

  test("名前が100文字ちょうどの場合、エラーにならないこと", () => {
    const profile = {
      ...validUserProfile,
      name: edgeCaseStrings.longName,
    };
    const result = validateUserProfile(profile);

    expect(result.isValid).toBe(true);
  });
});

describe("validateUserRole", () => {
  test("有効なロール（user）でバリデーション成功すること", () => {
    const result = validateUserRole("user");

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("有効なロール（admin）でバリデーション成功すること", () => {
    const result = validateUserRole("admin");

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("無効なロールでエラーになること", () => {
    testRoles.invalid.forEach((invalidRole) => {
      const result = validateUserRole(invalidRole);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("無効なロール")),
      ).toBe(true);
    });
  });
});

describe("validateUserProfileUpdate", () => {
  test("有効な更新データでバリデーション成功すること", () => {
    const result = validateUserProfileUpdate(validProfileUpdate);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("名前が長すぎる場合、エラーになること", () => {
    const result = validateUserProfileUpdate(invalidNameUpdateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("名前は100文字以内で入力してください");
  });

  test("空のオブジェクトでもバリデーション成功すること", () => {
    const result = validateUserProfileUpdate({});

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("undefinedフィールドが含まれていてもエラーにならないこと", () => {
    const updateData = {
      name: undefined,
    };
    const result = validateUserProfileUpdate(updateData);

    expect(result.isValid).toBe(true);
  });
});

describe("isValidEmail", () => {
  test("有効なメールアドレス形式で成功すること", () => {
    testEmails.valid.forEach((email) => {
      const result = isValidEmail(email);
      expect(result).toBe(true);
    });
  });

  test("無効なメールアドレス形式で失敗すること", () => {
    testEmails.invalid.forEach((email) => {
      const result = isValidEmail(email);
      expect(result).toBe(false);
    });
  });

  test("255文字ちょうどのメールアドレスは有効であること", () => {
    const longEmail = "a".repeat(243) + "@example.com"; // 255文字
    const result = isValidEmail(longEmail);

    expect(result).toBe(true);
  });

  test("256文字のメールアドレスは無効であること", () => {
    const tooLongEmail = "a".repeat(244) + "@example.com"; // 256文字
    const result = isValidEmail(tooLongEmail);

    expect(result).toBe(false);
  });
});

describe("sanitizeUserInput", () => {
  test("前後の空白が削除されること", () => {
    const result = sanitizeUserInput(edgeCaseStrings.withSpaces);

    expect(result).toBe("前後にスペース");
  });

  test("連続する空白が単一スペースに変換されること", () => {
    const result = sanitizeUserInput(edgeCaseStrings.multipleSpaces);

    expect(result).toBe("複数 の スペース");
  });

  test("1000文字を超える入力が切り詰められること", () => {
    const longInput = "あ".repeat(1500);
    const result = sanitizeUserInput(longInput);

    expect(result).toHaveLength(1000);
    expect(result).toBe("あ".repeat(1000));
  });

  test("1000文字ちょうどの入力はそのまま返されること", () => {
    const exactInput = "あ".repeat(1000);
    const result = sanitizeUserInput(exactInput);

    expect(result).toBe(exactInput);
    expect(result).toHaveLength(1000);
  });

  test("空文字の入力は空文字を返すこと", () => {
    const result = sanitizeUserInput("");

    expect(result).toBe("");
  });

  test("空白のみの入力は空文字を返すこと", () => {
    const result = sanitizeUserInput("   \t\n   ");

    expect(result).toBe("");
  });

  test("通常の文字列はそのまま返されること", () => {
    const normal = "普通の文字列です";
    const result = sanitizeUserInput(normal);

    expect(result).toBe(normal);
  });
});
