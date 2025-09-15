/**
 * updateUserActiveStatus.ts のテスト
 * Internal Mutations - ユーザーアクティブ状態更新機能のテスト
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

describe("updateUserActiveStatus", () => {
  test("ユーザーを無効化できること（true -> false）", async () => {
    const t = convexTest(schema);

    // アクティブなテストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // updateUserActiveStatusを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserActiveStatus.updateUserActiveStatus,
      {
        userId,
        isActive: false,
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.isActive).toBe(false);
    expect(result?.updatedAt).toBeGreaterThan(testUserData.updatedAt);
    // 他のフィールドは変更されない
    expect(result?.name).toBe(testUserData.name);
    expect(result?.email).toBe(testUserData.email);
    expect(result?.role).toBe(testUserData.role);
  });

  test("ユーザーを有効化できること（false -> true）", async () => {
    const t = convexTest(schema);

    // 無効なユーザーを作成
    const inactiveUserData = {
      ...testUserData,
      isActive: false,
    };
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", inactiveUserData);
    });

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // updateUserActiveStatusを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserActiveStatus.updateUserActiveStatus,
      {
        userId,
        isActive: true,
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.isActive).toBe(true);
    expect(result?.updatedAt).toBeGreaterThan(inactiveUserData.updatedAt);
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

    // 削除済みのユーザーIDでupdateUserActiveStatusを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserActiveStatus.updateUserActiveStatus,
      {
        userId: tempUserId,
        isActive: false,
      },
    );

    expect(result).toBeNull();
  });
});
