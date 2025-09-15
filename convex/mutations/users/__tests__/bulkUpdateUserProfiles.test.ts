/**
 * bulkUpdateUserProfiles.ts のテスト
 * Internal Mutations - ユーザープロファイル一括更新機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../../../_generated/api";
import schema from "../../../schema";
import type { Id } from "../../../_generated/dataModel";

// テスト用のユーザーデータ
const testUserData1 = {
  name: "テストユーザー1",
  email: "test1@example.com",
  role: "user" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const testUserData2 = {
  name: "テストユーザー2",
  email: "test2@example.com",
  role: "user" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

describe("bulkUpdateUserProfiles", () => {
  test("複数ユーザーのロールを一括更新できること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId1 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData1);
    });
    const userId2 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData2);
    });

    // bulkUpdateUserProfilesを実行
    const result = await t.mutation(
      internal.mutations.users.bulkUpdateUserProfiles.bulkUpdateUserProfiles,
      {
        userIds: [userId1, userId2],
        updateData: {
          role: "admin",
        },
      },
    );

    expect(result.totalRequested).toBe(2);
    expect(result.totalUpdated).toBe(2);
    expect(result.updatedUsers).toHaveLength(2);

    // 全ユーザーのロールが更新されている
    result.updatedUsers.forEach((user) => {
      expect(user).not.toBeNull();
      expect(user?.role).toBe("admin");
    });
  });

  test("複数ユーザーのアクティブ状態を一括更新できること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId1 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData1);
    });
    const userId2 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData2);
    });

    // bulkUpdateUserProfilesを実行
    const result = await t.mutation(
      internal.mutations.users.bulkUpdateUserProfiles.bulkUpdateUserProfiles,
      {
        userIds: [userId1, userId2],
        updateData: {
          isActive: false,
        },
      },
    );

    expect(result.totalRequested).toBe(2);
    expect(result.totalUpdated).toBe(2);

    // 全ユーザーのアクティブ状態が更新されている
    result.updatedUsers.forEach((user) => {
      expect(user).not.toBeNull();
      expect(user?.isActive).toBe(false);
    });
  });

  test("存在しないユーザーIDが含まれていても他の更新は成功すること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId1 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData1);
    });

    // 存在しないユーザーIDを作成（作成後削除）
    const nonExistentUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData2);
    });

    // 作成したユーザーを削除
    await t.run(async (ctx) => {
      await ctx.db.delete(nonExistentUserId);
    });

    // bulkUpdateUserProfilesを実行
    const result = await t.mutation(
      internal.mutations.users.bulkUpdateUserProfiles.bulkUpdateUserProfiles,
      {
        userIds: [userId1, nonExistentUserId],
        updateData: {
          role: "admin",
        },
      },
    );

    expect(result.totalRequested).toBe(2);
    expect(result.totalUpdated).toBe(1); // 存在するユーザーのみ更新
    expect(result.updatedUsers).toHaveLength(2);

    // 1番目のユーザーは更新成功
    expect(result.updatedUsers[0]).not.toBeNull();
    expect(result.updatedUsers[0]?._id).toBe(userId1);
    expect(result.updatedUsers[0]?.role).toBe("admin");

    // 2番目のユーザーは失敗でnull
    expect(result.updatedUsers[1]).toBeNull();
  });

  test("空の配列を渡した場合は空の結果が返されること", async () => {
    const t = convexTest(schema);

    // bulkUpdateUserProfilesを実行（空の配列）
    const result = await t.mutation(
      internal.mutations.users.bulkUpdateUserProfiles.bulkUpdateUserProfiles,
      {
        userIds: [],
        updateData: {
          role: "admin",
        },
      },
    );

    expect(result.totalRequested).toBe(0);
    expect(result.totalUpdated).toBe(0);
    expect(result.updatedUsers).toHaveLength(0);
  });
});
