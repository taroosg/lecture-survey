/**
 * getUsers.ts のテスト
 * Internal Queries - ユーザー一覧取得機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../schema";
import { internal } from "../../../_generated/api";

// テスト用のユーザーデータ
const testUserData = {
  name: "一般ユーザー",
  email: "user@example.com",
  role: "user" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const testAdminData = {
  name: "管理者ユーザー",
  email: "admin@example.com",
  role: "admin" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const testInactiveUserData = {
  name: "非アクティブユーザー",
  email: "inactive@example.com",
  role: "user" as const,
  organizationName: "テスト大学",
  isActive: false,
  updatedAt: Date.now(),
};

describe("getUsersByRole", () => {
  test("一般ユーザーロールでフィルタリングできること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData);
      await ctx.db.insert("users", testAdminData);
    });

    // getUsersByRoleを実行
    const result = await t.query(
      internal.queries.users.getUsers.getUsersByRole,
      {
        role: "user",
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    expect(result[0].name).toBe(testUserData.name);
  });

  test("管理者ロールでフィルタリングできること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData);
      await ctx.db.insert("users", testAdminData);
    });

    // getUsersByRoleを実行
    const result = await t.query(
      internal.queries.users.getUsers.getUsersByRole,
      {
        role: "admin",
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("admin");
    expect(result[0].name).toBe(testAdminData.name);
  });

  test("ロールとアクティブ状態で複合フィルタリングできること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData); // アクティブな一般ユーザー
      await ctx.db.insert("users", testInactiveUserData); // 非アクティブな一般ユーザー
    });

    // アクティブな一般ユーザーのみ取得
    const result = await t.query(
      internal.queries.users.getUsers.getUsersByRole,
      {
        role: "user",
        filter: { isActive: true },
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    expect(result[0].isActive).toBe(true);
  });
});

describe("getActiveUsers", () => {
  test("アクティブユーザーのみ取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData); // アクティブ
      await ctx.db.insert("users", testAdminData); // アクティブ
      await ctx.db.insert("users", testInactiveUserData); // 非アクティブ
    });

    // getActiveUsersを実行
    const result = await t.query(
      internal.queries.users.getUsers.getActiveUsers,
      {},
    );

    expect(result).toHaveLength(2);
    result.forEach((user) => {
      expect(user.isActive).toBe(true);
    });
  });

  test("ロールフィルターと組み合わせて使用できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData); // アクティブな一般ユーザー
      await ctx.db.insert("users", testAdminData); // アクティブな管理者
    });

    // アクティブな管理者のみ取得
    const result = await t.query(
      internal.queries.users.getUsers.getActiveUsers,
      {
        filter: { role: "admin" },
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("admin");
    expect(result[0].isActive).toBe(true);
  });
});

describe("getAllUsers", () => {
  test("全ユーザーを取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData);
      await ctx.db.insert("users", testAdminData);
      await ctx.db.insert("users", testInactiveUserData);
    });

    // getAllUsersを実行
    const result = await t.query(
      internal.queries.users.getUsers.getAllUsers,
      {},
    );

    expect(result).toHaveLength(3);
  });

  test("フィルター条件を適用できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData);
      await ctx.db.insert("users", testAdminData);
      await ctx.db.insert("users", testInactiveUserData);
    });

    // アクティブユーザーのみフィルタリング
    const result = await t.query(internal.queries.users.getUsers.getAllUsers, {
      filter: { isActive: true },
    });

    expect(result).toHaveLength(2);
    result.forEach((user) => {
      expect(user.isActive).toBe(true);
    });
  });
});

describe("getUserStats", () => {
  test("ユーザー統計情報を正しく計算できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData); // アクティブな一般ユーザー
      await ctx.db.insert("users", testAdminData); // アクティブな管理者
      await ctx.db.insert("users", testInactiveUserData); // 非アクティブな一般ユーザー
    });

    // getUserStatsを実行
    const result = await t.query(
      internal.queries.users.getUsers.getUserStats,
      {},
    );

    expect(result.total).toBe(3);
    expect(result.active).toBe(2);
    expect(result.inactive).toBe(1);
    expect(result.admins).toBe(1);
    expect(result.users).toBe(2);
  });

  test("ユーザーが存在しない場合は全て0になること", async () => {
    const t = convexTest(schema);

    // getUserStatsを実行（ユーザーなし）
    const result = await t.query(
      internal.queries.users.getUsers.getUserStats,
      {},
    );

    expect(result.total).toBe(0);
    expect(result.active).toBe(0);
    expect(result.inactive).toBe(0);
    expect(result.admins).toBe(0);
    expect(result.users).toBe(0);
  });
});

describe("getAdminUsers", () => {
  test("管理者ユーザーのみ取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData);
      await ctx.db.insert("users", testAdminData);
    });

    // getAdminUsersを実行
    const result = await t.query(
      internal.queries.users.getUsers.getAdminUsers,
      {},
    );

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("admin");
  });
});

describe("getRegularUsers", () => {
  test("一般ユーザーのみ取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData);
      await ctx.db.insert("users", testAdminData);
      await ctx.db.insert("users", testInactiveUserData);
    });

    // getRegularUsersを実行
    const result = await t.query(
      internal.queries.users.getUsers.getRegularUsers,
      {},
    );

    expect(result).toHaveLength(2);
    result.forEach((user) => {
      expect(user.role).toBe("user");
    });
  });
});
