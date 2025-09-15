/**
 * getUser.ts のテスト
 * Internal Queries - ユーザー取得機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../../_generated/api";
import schema from "../../schema";
import type { Id } from "../../_generated/dataModel";

// テスト用のユーザーデータ
const testUserData = {
  name: "テストユーザー",
  email: "test@example.com",
  role: "user" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const testUserData2 = {
  name: "テストユーザー2",
  email: "test2@example.com",
  role: "admin" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

describe("getUserById", () => {
  test("存在するユーザーIDでユーザーが取得できること", async () => {
    const t = convexTest(schema);

    // テストユーザーを作成
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });

    // getUserByIdを実行
    const result = await t.query(internal.queries.users.getUser.getUserById, {
      userId,
    });

    expect(result).not.toBeNull();
    expect(result?._id).toBe(userId);
    expect(result?.name).toBe(testUserData.name);
    expect(result?.email).toBe(testUserData.email);
    expect(result?.role).toBe(testUserData.role);
  });

  test("存在しないユーザーIDでnullが返されること", async () => {
    const t = convexTest(schema);

    // 存在しないユーザーIDを生成（create-and-delete pattern）
    const nonExistentUserId = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData);
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getUserByIdを実行
    const result = await t.query(internal.queries.users.getUser.getUserById, {
      userId: nonExistentUserId,
    });

    expect(result).toBeNull();
  });
});

describe("getCurrentUser", () => {
  test("認証されていない場合はnullが返されること", async () => {
    const t = convexTest(schema);

    // getCurrentUserを実行（認証なし）
    const result = await t.query(
      internal.queries.users.getUser.getCurrentUser,
      {},
    );

    expect(result).toBeNull();
  });

  // 注意: 認証ありのテストはConvex Authの設定が必要なため、
  // ここでは認証なしのケースのみテストしています
});

describe("getUsersByIds", () => {
  test("複数のユーザーIDで一括取得ができること", async () => {
    const t = convexTest(schema);

    // テストユーザーを2人作成
    const userId1 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });
    const userId2 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData2);
    });

    // getUsersByIdsを実行
    const result = await t.query(internal.queries.users.getUser.getUsersByIds, {
      userIds: [userId1, userId2],
    });

    expect(result).toHaveLength(2);
    expect(result[0]._id).toBe(userId1);
    expect(result[1]._id).toBe(userId2);
  });

  test("存在しないIDが含まれていても正常に動作すること", async () => {
    const t = convexTest(schema);

    // テストユーザーを1人作成
    const userId1 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", testUserData);
    });
    // 存在しないユーザーIDを生成（create-and-delete pattern）
    const nonExistentUserId = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData2);
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getUsersByIdsを実行（存在するIDと存在しないIDを混在）
    const result = await t.query(internal.queries.users.getUser.getUsersByIds, {
      userIds: [userId1, nonExistentUserId],
    });

    // 存在するユーザーのみが返されること
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe(userId1);
  });

  test("空の配列を渡した場合は空の配列が返されること", async () => {
    const t = convexTest(schema);

    // getUsersByIdsを実行（空の配列）
    const result = await t.query(internal.queries.users.getUser.getUsersByIds, {
      userIds: [],
    });

    expect(result).toHaveLength(0);
  });

  test("すべて存在しないIDの場合は空の配列が返されること", async () => {
    const t = convexTest(schema);

    // 存在しないユーザーIDを生成（create-and-delete pattern）
    const nonExistentUserId1 = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData);
      await ctx.db.delete(tempId);
      return tempId;
    });
    const nonExistentUserId2 = await t.run(async (ctx) => {
      const tempId = await ctx.db.insert("users", testUserData2);
      await ctx.db.delete(tempId);
      return tempId;
    });

    // getUsersByIdsを実行
    const result = await t.query(internal.queries.users.getUser.getUsersByIds, {
      userIds: [nonExistentUserId1, nonExistentUserId2],
    });

    expect(result).toHaveLength(0);
  });
});
