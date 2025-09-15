/**
 * userHelpers.ts のテスト
 * ユーザー関連のヘルパー関数のテスト
 */

import { describe, test, expect } from "vitest";
import {
  isUserActive,
  isAdmin,
  getUserDisplayName,
  canManageUser,
  type UserData,
} from "../userHelpers";

// テスト用データ
const validUserData: UserData = {
  _id: "user_valid_123" as any,
  _creationTime: Date.now(),
  name: "山田太郎",
  email: "yamada@example.com",
  role: "user",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const adminUserData: UserData = {
  _id: "admin_123" as any,
  _creationTime: Date.now(),
  name: "管理者ユーザー",
  email: "admin@example.com",
  role: "admin",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const inactiveUserData: UserData = {
  _id: "user_inactive_123" as any,
  _creationTime: Date.now(),
  name: "非アクティブユーザー",
  email: "inactive@example.com",
  role: "user",
  organizationName: "テスト大学",
  isActive: false,
  updatedAt: Date.now(),
};

const noNameUserData: UserData = {
  _id: "user_no_name_123" as any,
  _creationTime: Date.now(),
  email: "noname@example.com",
  role: "user",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const noEmailUserData: UserData = {
  _id: "user_no_email_123" as any,
  _creationTime: Date.now(),
  name: "名前のみユーザー",
  role: "user",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

describe("isUserActive", () => {
  test("アクティブユーザーの判定でtrueが返されること", () => {
    const result = isUserActive(validUserData);

    expect(result).toBe(true);
  });

  test("明示的にisActive: trueが設定されているユーザーでtrueが返されること", () => {
    const activeUser = { ...validUserData, isActive: true };
    const result = isUserActive(activeUser);

    expect(result).toBe(true);
  });

  test("非アクティブユーザーの判定でfalseが返されること", () => {
    const result = isUserActive(inactiveUserData);

    expect(result).toBe(false);
  });

  test("isActiveがundefinedの場合でtrueが返されること（デフォルトでアクティブ）", () => {
    const userWithUndefinedActive = { ...validUserData };
    delete (userWithUndefinedActive as any).isActive;
    const result = isUserActive(userWithUndefinedActive);

    expect(result).toBe(true);
  });

  test("nullが渡された場合、falseが返されること", () => {
    const result = isUserActive(null);

    expect(result).toBe(false);
  });

  test("undefinedが渡された場合、falseが返されること", () => {
    const result = isUserActive(undefined);

    expect(result).toBe(false);
  });
});

describe("isAdmin", () => {
  test("管理者ユーザーでtrueが返されること", () => {
    const result = isAdmin(adminUserData);

    expect(result).toBe(true);
  });

  test("一般ユーザーでfalseが返されること", () => {
    const result = isAdmin(validUserData);

    expect(result).toBe(false);
  });

  test("nullが渡された場合、falseが返されること", () => {
    const result = isAdmin(null);

    expect(result).toBe(false);
  });

  test("undefinedが渡された場合、falseが返されること", () => {
    const result = isAdmin(undefined);

    expect(result).toBe(false);
  });

  test("roleが未定義のユーザーでfalseが返されること", () => {
    const userWithoutRole = { ...validUserData };
    delete (userWithoutRole as any).role;
    const result = isAdmin(userWithoutRole);

    expect(result).toBe(false);
  });
});

describe("getUserDisplayName", () => {
  test("名前が設定されているユーザーで名前が返されること", () => {
    const result = getUserDisplayName(validUserData);

    expect(result).toBe("山田太郎");
  });

  test("名前がないユーザーでメールのローカル部分が返されること", () => {
    const result = getUserDisplayName(noNameUserData);

    expect(result).toBe("noname");
  });

  test("名前もメールもないユーザーで「ユーザー」が返されること", () => {
    const result = getUserDisplayName(noEmailUserData);

    expect(result).toBe("名前のみユーザー");
  });

  test("名前が空文字やスペースのみの場合、メールのローカル部分が返されること", () => {
    const userWithEmptyName = { ...validUserData, name: "   " };
    const result = getUserDisplayName(userWithEmptyName);

    expect(result).toBe("yamada");
  });

  test("nullが渡された場合、「不明なユーザー」が返されること", () => {
    const result = getUserDisplayName(null);

    expect(result).toBe("不明なユーザー");
  });

  test("undefinedが渡された場合、「不明なユーザー」が返されること", () => {
    const result = getUserDisplayName(undefined);

    expect(result).toBe("不明なユーザー");
  });

  test("無効なメールアドレスの場合、「ユーザー」が返されること", () => {
    const userWithInvalidEmail = { ...noNameUserData, email: "invalid-email" };
    const result = getUserDisplayName(userWithInvalidEmail);

    expect(result).toBe("ユーザー");
  });

  test("メールのローカル部分が空の場合、「ユーザー」が返されること", () => {
    const userWithEmptyLocal = { ...noNameUserData, email: "@example.com" };
    const result = getUserDisplayName(userWithEmptyLocal);

    expect(result).toBe("ユーザー");
  });
});

describe("canManageUser", () => {
  test("管理者が他のユーザーを管理できること", () => {
    const result = canManageUser(adminUserData, validUserData);

    expect(result).toBe(true);
  });

  test("ユーザーが自分自身のプロファイルを管理できること", () => {
    const result = canManageUser(validUserData, validUserData);

    expect(result).toBe(true);
  });

  test("一般ユーザーが他のユーザーを管理できないこと", () => {
    const otherUser = { ...validUserData, _id: "other_user" as any };
    const result = canManageUser(validUserData, otherUser);

    expect(result).toBe(false);
  });

  test("非アクティブユーザーが管理操作を行えないこと", () => {
    const result = canManageUser(inactiveUserData, validUserData);

    expect(result).toBe(false);
  });

  test("actorがnullの場合、falseが返されること", () => {
    const result = canManageUser(null, validUserData);

    expect(result).toBe(false);
  });

  test("targetがnullの場合、falseが返されること", () => {
    const result = canManageUser(validUserData, null);

    expect(result).toBe(false);
  });

  test("両方がnullの場合、falseが返されること", () => {
    const result = canManageUser(null, null);

    expect(result).toBe(false);
  });

  test("actorがundefinedの場合、falseが返されること", () => {
    const result = canManageUser(undefined, validUserData);

    expect(result).toBe(false);
  });

  test("targetがundefinedの場合、falseが返されること", () => {
    const result = canManageUser(validUserData, undefined);

    expect(result).toBe(false);
  });

  test("非アクティブ管理者でも管理操作を行えないこと", () => {
    const inactiveAdmin = { ...adminUserData, isActive: false };
    const result = canManageUser(inactiveAdmin, validUserData);

    expect(result).toBe(false);
  });
});
