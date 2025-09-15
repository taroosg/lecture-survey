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
  type UserProfile,
  type UserProfileUpdate,
} from "../userValidator";

// テスト用データ
const validUserProfile: UserProfile = {
  name: "田中花子",
  email: "tanaka@example.com",
  role: "user",
};

const invalidEmailUserProfile: UserProfile = {
  name: "田中花子",
  email: "invalid-email",
  role: "user",
};

const validProfileUpdate: UserProfileUpdate = {
  name: "更新された名前",
};

const invalidNameUpdateData: UserProfileUpdate = {
  name: "あ".repeat(101), // 101文字
};

const testEmails = {
  valid: [
    "test@example.com",
    "user.name@domain.co.jp",
    "test+tag@example.org",
    "123@test.com",
  ],
  invalid: [
    "invalid-email",
    "@example.com",
    "test@",
    "test..test@example.com",
    "test@example",
    "",
  ],
};

const testRoles = {
  valid: ["user", "admin"] as const,
  invalid: ["invalid", "guest", "", "USER", "ADMIN"],
};

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
    expect(result.errors).toContain(
      "無効なロールです。有効なロール: user, admin",
    );
  });

  test("名前が100文字を超える場合、エラーになること", () => {
    const profile = {
      ...validUserProfile,
      name: "あ".repeat(101),
    };
    const result = validateUserProfile(profile);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("名前は100文字以内で入力してください");
  });

  test("複数のエラーが同時に発生した場合、すべてのエラーが返されること", () => {
    const profile = {
      name: "あ".repeat(101),
      email: "invalid-email",
      role: "invalid" as any,
    };
    const result = validateUserProfile(profile);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});

describe("validateUserProfileUpdate", () => {
  test("正常な更新データが渡された場合、バリデーションが成功すること", () => {
    const result = validateUserProfileUpdate(validProfileUpdate);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("名前が100文字を超える場合、エラーになること", () => {
    const result = validateUserProfileUpdate(invalidNameUpdateData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("名前は100文字以内で入力してください");
  });

  test("空のオブジェクトが渡された場合、エラーにならないこと", () => {
    const result = validateUserProfileUpdate({});

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("nameが未定義の場合、エラーにならないこと", () => {
    const updateData = {
      name: undefined,
    };
    const result = validateUserProfileUpdate(updateData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("validateUserRole", () => {
  test("有効なロールが渡された場合、バリデーションが成功すること", () => {
    testRoles.valid.forEach((role) => {
      const result = validateUserRole(role);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  test("無効なロールが渡された場合、バリデーションが失敗すること", () => {
    testRoles.invalid.forEach((role) => {
      const result = validateUserRole(role);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "無効なロールです。有効なロール: user, admin",
      );
    });
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
  test("文字列の前後のスペースが削除されること", () => {
    const result = sanitizeUserInput("  前後にスペース  ");

    expect(result).toBe("前後にスペース");
  });

  test("連続する空白が単一スペースに変換されること", () => {
    const result = sanitizeUserInput("複数  の    スペース");

    expect(result).toBe("複数 の スペース");
  });

  test("1000文字を超える文字列が切り詰められること", () => {
    const longString = "あ".repeat(1001);
    const result = sanitizeUserInput(longString);

    expect(result).toHaveLength(1000);
    expect(result).toBe("あ".repeat(1000));
  });

  test("空文字列が渡された場合、空文字列が返されること", () => {
    const result = sanitizeUserInput("");

    expect(result).toBe("");
  });

  test("スペースのみの文字列が渡された場合、空文字列が返されること", () => {
    const result = sanitizeUserInput("   ");

    expect(result).toBe("");
  });

  test("正常な文字列はそのまま返されること", () => {
    const result = sanitizeUserInput("正常な文字列");

    expect(result).toBe("正常な文字列");
  });
});
