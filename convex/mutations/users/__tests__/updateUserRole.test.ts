/**
 * updateUserRole.ts のテスト
 * Internal Mutations - ユーザーロール更新機能のテスト
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

describe("updateUserRole", () => {
  test("ユーザーロールが正常に更新できること（user -> admin）", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // updateUserRoleを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserRole.updateUserRole,
      {
        userId,
        newRole: "admin",
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.role).toBe("admin");
    expect(result?.updatedAt).toBeGreaterThan(testUserData.updatedAt);
    // 他のフィールドは変更されない
    expect(result?.name).toBe(testUserData.name);
    expect(result?.email).toBe(testUserData.email);
    expect(result?.isActive).toBe(testUserData.isActive);

    // データベースの値を確認
    const updatedUser = await t.run(async (ctx) => {
      return await ctx.db.get(userId);
    });

    expect(updatedUser?.role).toBe("admin");
  });

  test("ユーザーロールが正常に更新できること（admin -> user）", async () => {
    const t = convexTest(schema);

    // 管理者ユーザーを作成
    const adminUserData = {
      ...testUserData,
      role: "admin" as const,
    };
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", adminUserData);
    });

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // updateUserRoleを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserRole.updateUserRole,
      {
        userId,
        newRole: "user",
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.role).toBe("user");
    expect(result?.updatedAt).toBeGreaterThan(adminUserData.updatedAt);
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

    // 削除済みのユーザーIDでupdateUserRoleを実行
    const result = await t.mutation(
      internal.mutations.users.updateUserRole.updateUserRole,
      {
        userId: tempUserId,
        newRole: "admin",
      },
    );

    expect(result).toBeNull();
  });

  test("同じロールで更新してもupdatedAtが更新されること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    const originalUpdatedAt = testUserData.updatedAt;

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // 同じロール（user）で更新
    const result = await t.mutation(
      internal.mutations.users.updateUserRole.updateUserRole,
      {
        userId,
        newRole: "user",
      },
    );

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.role).toBe("user");
    // updatedAtは更新される
    expect(result?.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  test("複数回の更新が正常に動作すること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // 1回目の更新: user -> admin
    const result1 = await t.mutation(
      internal.mutations.users.updateUserRole.updateUserRole,
      {
        userId,
        newRole: "admin",
      },
    );

    expect(result1?.role).toBe("admin");
    const firstUpdateTime = result1?.updatedAt!;

    // タイムスタンプの差を確実にするために少し待つ
    await new Promise((resolve) => setTimeout(resolve, 1));

    // 2回目の更新: admin -> user
    const result2 = await t.mutation(
      internal.mutations.users.updateUserRole.updateUserRole,
      {
        userId,
        newRole: "user",
      },
    );

    expect(result2?.role).toBe("user");
    expect(result2?.updatedAt).toBeGreaterThan(firstUpdateTime);
  });
});
