/**
 * updateUserProfile.ts のテスト
 * Internal Mutations - ユーザープロファイル更新機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../../../_generated/api";
import schema from "../../../schema";
import type { Id } from "../../../_generated/dataModel";

// テスト用のユーザーデータ
const testUserData = {
  name: "テストユーザー",
  email: "test@example.com",
  role: "user" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

describe("updateUserProfile", () => {
  test("ユーザープロファイルが正常に更新できること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // updateUserProfileを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserProfile.updateUserProfile,
      {
        userId,
        name: "更新されたユーザー",
        email: "updated@example.com",
        organizationName: "更新された大学",
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.name).toBe("更新されたユーザー");
    expect(result?.email).toBe("updated@example.com");
    expect(result?.organizationName).toBe("更新された大学");
    expect(result?.updatedAt).toBeGreaterThan(testUserData.updatedAt);

    // データベースの値を確認
    const updatedUser = await t.run(async (ctx) => {
      return await ctx.db.get(userId);
    });

    expect(updatedUser?.name).toBe("更新されたユーザー");
    expect(updatedUser?.email).toBe("updated@example.com");
    expect(updatedUser?.organizationName).toBe("更新された大学");
  });

  test("部分的な更新が正常に動作すること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // 名前のみ更新
    const result = await t.mutation(
      internal.mutations.users.updateUserProfile.updateUserProfile,
      {
        userId,
        name: "部分更新テスト",
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.name).toBe("部分更新テスト");
    // 他のフィールドは変更されない
    expect(result?.email).toBe(testUserData.email);
    expect(result?.organizationName).toBe(testUserData.organizationName);
    expect(result?.role).toBe(testUserData.role);
  });

  test("存在しないユーザーIDでnullが返されること", async () => {
    const t = convexTest(schema);

    // 別のユーザーを作成してIDを取得し、その後削除して存在しないIDとする
    const tempUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // 作成したユーザーを削除
    await t.run(async (ctx) => {
      await ctx.db.delete(tempUserId);
    });

    // 削除済みのユーザーIDでupdateUserProfileを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserProfile.updateUserProfile,
      {
        userId: tempUserId,
        name: "存在しないユーザー",
      },
    );

    expect(result).toBeNull();
  });

  test("空のオプション値でも正常に動作すること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    const originalUpdatedAt = testUserData.updatedAt;

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // オプションフィールドなしで更新
    const result = await t.mutation(
      internal.mutations.users.updateUserProfile.updateUserProfile,
      {
        userId,
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    // 元のデータは変更されない
    expect(result?.name).toBe(testUserData.name);
    expect(result?.email).toBe(testUserData.email);
    expect(result?.organizationName).toBe(testUserData.organizationName);
    // updatedAtのみ更新される
    expect(result?.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  test("undefinedを明示的に渡した場合も正常に動作すること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // updateUserProfileを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserProfile.updateUserProfile,
      {
        userId,
        name: undefined,
        email: "updated-email@example.com",
        organizationName: undefined,
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    // undefinedのフィールドは更新されない
    expect(result?.name).toBe(testUserData.name);
    expect(result?.organizationName).toBe(testUserData.organizationName);
    // 明示的に指定されたフィールドは更新される
    expect(result?.email).toBe("updated-email@example.com");
  });
});
