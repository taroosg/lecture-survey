/**
 * userService.ts のテスト
 * ビジネスロジックの純粋関数部分のテスト
 */

import { describe, test, expect } from "vitest";
import {
  isUserActive,
  canAccessLecture,
  getUserDisplayName,
  isAdmin,
  canManageUser,
  prepareUserProfileUpdate,
  prepareUserRoleUpdate,
  prepareUserActiveStatusUpdate,
} from "./userService";
import {
  validUserData,
  adminUserData,
  inactiveUserData,
  otherOrgUserData,
  noNameUserData,
  noEmailUserData,
  testLectureData,
  otherUserLectureData,
  cloneUserData,
} from "../__fixtures__/user_test_data";

describe("isUserActive", () => {
  test("アクティブユーザーの判定でtrueが返されること", () => {
    const result = isUserActive(validUserData);

    expect(result).toBe(true);
  });

  test("明示的にisActive: trueが設定されているユーザーでtrueが返されること", () => {
    const activeUser = cloneUserData(validUserData, { isActive: true });
    const result = isUserActive(activeUser);

    expect(result).toBe(true);
  });

  test("非アクティブユーザーの判定でfalseが返されること", () => {
    const result = isUserActive(inactiveUserData);

    expect(result).toBe(false);
  });

  test("isActiveがundefinedの場合でtrueが返されること（デフォルトでアクティブ）", () => {
    const userWithUndefinedActive = cloneUserData(validUserData);
    delete userWithUndefinedActive.isActive;
    const result = isUserActive(userWithUndefinedActive);

    expect(result).toBe(true);
  });

  test("nullが渡された場合でfalseが返されること", () => {
    const result = isUserActive(null);

    expect(result).toBe(false);
  });

  test("undefinedが渡された場合でfalseが返されること", () => {
    const result = isUserActive(undefined);

    expect(result).toBe(false);
  });
});

describe("canAccessLecture", () => {
  test("管理者は全ての講義にアクセス可能であること", () => {
    const result = canAccessLecture(adminUserData, otherUserLectureData);

    expect(result).toBe(true);
  });

  test("講義作成者は自分の講義にアクセス可能であること", () => {
    const creatorUser = cloneUserData(validUserData, {
      _id: "user_valid_123" as any,
    });
    const result = canAccessLecture(creatorUser, testLectureData);

    expect(result).toBe(true);
  });

  test("他のユーザーの講義にはアクセス不可であること", () => {
    const result = canAccessLecture(otherOrgUserData, testLectureData);

    expect(result).toBe(false);
  });

  test("非アクティブユーザーはアクセス不可であること", () => {
    const result = canAccessLecture(inactiveUserData, testLectureData);

    expect(result).toBe(false);
  });

  test("ユーザーがnullの場合でfalseが返されること", () => {
    const result = canAccessLecture(null, testLectureData);

    expect(result).toBe(false);
  });

  test("講義がnullの場合でfalseが返されること", () => {
    const result = canAccessLecture(validUserData, null);

    expect(result).toBe(false);
  });

  test("両方がnullの場合でfalseが返されること", () => {
    const result = canAccessLecture(null, null);

    expect(result).toBe(false);
  });

  test("組織名がない場合でもアクセス権限がチェックされること", () => {
    const userWithoutOrg = cloneUserData(validUserData);
    delete userWithoutOrg.organizationName;
    // 作成者でない講義を使用
    const result = canAccessLecture(userWithoutOrg, otherUserLectureData);

    expect(result).toBe(false);
  });
});

describe("getUserDisplayName", () => {
  test("名前がある場合の表示名が正しく返されること", () => {
    const result = getUserDisplayName(validUserData);

    expect(result).toBe("山田太郎");
  });

  test("名前がない場合のフォールバック処理でメールアドレスから表示名が生成されること", () => {
    const result = getUserDisplayName(noNameUserData);

    expect(result).toBe("noname");
  });

  test("名前もメールアドレスもない場合でデフォルトの表示名が返されること", () => {
    const result = getUserDisplayName(noEmailUserData);

    expect(result).toBe("ユーザー");
  });

  test("名前が空文字や空白の場合でメールアドレスからフォールバックされること", () => {
    const userWithEmptyName = cloneUserData(validUserData, { name: "   " });
    const result = getUserDisplayName(userWithEmptyName);

    expect(result).toBe("yamada");
  });

  test("ユーザーがnullの場合で「不明なユーザー」が返されること", () => {
    const result = getUserDisplayName(null);

    expect(result).toBe("不明なユーザー");
  });

  test("ユーザーがundefinedの場合で「不明なユーザー」が返されること", () => {
    const result = getUserDisplayName(undefined);

    expect(result).toBe("不明なユーザー");
  });

  test("メールアドレスに@が含まれていない場合の処理", () => {
    const userWithInvalidEmail = cloneUserData(noNameUserData, {
      email: "invalidemail",
    });
    const result = getUserDisplayName(userWithInvalidEmail);

    expect(result).toBe("ユーザー");
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

  test("ロールがundefinedの場合でfalseが返されること", () => {
    const userWithoutRole = cloneUserData(validUserData);
    delete userWithoutRole.role;
    const result = isAdmin(userWithoutRole);

    expect(result).toBe(false);
  });

  test("ユーザーがnullの場合でfalseが返されること", () => {
    const result = isAdmin(null);

    expect(result).toBe(false);
  });

  test("ユーザーがundefinedの場合でfalseが返されること", () => {
    const result = isAdmin(undefined);

    expect(result).toBe(false);
  });
});

describe("canManageUser", () => {
  test("管理者は他のユーザーを管理可能であること", () => {
    const result = canManageUser(adminUserData, validUserData);

    expect(result).toBe(true);
  });

  test("自分自身のプロファイルは編集可能であること", () => {
    const result = canManageUser(validUserData, validUserData);

    expect(result).toBe(true);
  });

  test("一般ユーザーは他のユーザーを管理できないこと", () => {
    const result = canManageUser(validUserData, otherOrgUserData);

    expect(result).toBe(false);
  });

  test("非アクティブユーザーは操作できないこと", () => {
    const result = canManageUser(inactiveUserData, validUserData);

    expect(result).toBe(false);
  });

  test("actorがnullの場合でfalseが返されること", () => {
    const result = canManageUser(null, validUserData);

    expect(result).toBe(false);
  });

  test("targetがnullの場合でfalseが返されること", () => {
    const result = canManageUser(validUserData, null);

    expect(result).toBe(false);
  });
});

describe("prepareUserProfileUpdate", () => {
  test("プロファイル更新データが正しく準備されること", () => {
    const updateData = {
      name: "新しい名前",
    };

    const result = prepareUserProfileUpdate(validUserData, updateData);

    expect(result.name).toBe("新しい名前");
    expect(result.updatedAt).toBeTypeOf("number");
    expect(result.updatedAt).toBeGreaterThan(0);
  });

  test("名前に前後の空白がある場合はトリムされること", () => {
    const updateData = {
      name: "  前後空白  ",
    };

    const result = prepareUserProfileUpdate(validUserData, updateData);

    expect(result.name).toBe("前後空白");
  });

  test("名前が空文字の場合はundefinedになること", () => {
    const updateData = {
      name: "",
    };

    const result = prepareUserProfileUpdate(validUserData, updateData);

    expect(result.name).toBeUndefined();
  });

  test("空のupdateDataでもタイムスタンプが設定されること", () => {
    const result = prepareUserProfileUpdate(validUserData, {});

    expect(result.updatedAt).toBeTypeOf("number");
    expect(result.updatedAt).toBeGreaterThan(0);
  });
});

describe("prepareUserRoleUpdate", () => {
  test("ユーザーロール更新データが正しく準備されること", () => {
    const result = prepareUserRoleUpdate("admin");

    expect(result.role).toBe("admin");
    expect(result.updatedAt).toBeTypeOf("number");
    expect(result.updatedAt).toBeGreaterThan(0);
  });

  test("管理者から一般ユーザーへの変更データが正しく準備されること", () => {
    const result = prepareUserRoleUpdate("user");

    expect(result.role).toBe("user");
    expect(result.updatedAt).toBeTypeOf("number");
  });
});

describe("prepareUserActiveStatusUpdate", () => {
  test("アクティブ状態更新データが正しく準備されること", () => {
    const result = prepareUserActiveStatusUpdate(true);

    expect(result.isActive).toBe(true);
    expect(result.updatedAt).toBeTypeOf("number");
    expect(result.updatedAt).toBeGreaterThan(0);
  });

  test("非アクティブ状態更新データが正しく準備されること", () => {
    const result = prepareUserActiveStatusUpdate(false);

    expect(result.isActive).toBe(false);
    expect(result.updatedAt).toBeTypeOf("number");
  });
});
