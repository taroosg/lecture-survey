/**
 * getUserByEmail.ts のテスト
 * Internal Queries - メールアドレスによるユーザー検索機能のテスト
 */

import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { internal } from "../../_generated/api";

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
  role: "admin" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

const testUserData3 = {
  name: "山田太郎",
  email: "yamada@university.ac.jp",
  role: "user" as const,
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

describe("getUserByEmail", () => {
  test("存在するメールアドレスでユーザーが取得できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData1);
    });

    // getUserByEmailを実行
    const result = await t.query(
      internal.queries.users.getUserByEmail.getUserByEmail,
      {
        email: "test1@example.com",
      },
    );

    expect(result).not.toBeNull();
    expect(result?.email).toBe("test1@example.com");
    expect(result?.name).toBe("テストユーザー1");
  });

  test("存在しないメールアドレスでnullが返されること", async () => {
    const t = convexTest(schema);

    // getUserByEmailを実行（存在しないメールアドレス）
    const result = await t.query(
      internal.queries.users.getUserByEmail.getUserByEmail,
      {
        email: "nonexistent@example.com",
      },
    );

    expect(result).toBeNull();
  });

  test("大文字小文字を区別して検索すること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData1);
    });

    // 大文字で検索
    const result = await t.query(
      internal.queries.users.getUserByEmail.getUserByEmail,
      {
        email: "TEST1@EXAMPLE.COM",
      },
    );

    // 大文字小文字が異なるのでnullが返される
    expect(result).toBeNull();
  });
});

describe("getUsersByEmails", () => {
  test("複数のメールアドレスで一括検索ができること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData1);
      await ctx.db.insert("users", testUserData2);
    });

    // getUsersByEmailsを実行
    const result = await t.query(
      internal.queries.users.getUserByEmail.getUsersByEmails,
      {
        emails: ["test1@example.com", "test2@example.com"],
      },
    );

    expect(result).toHaveLength(2);
    const emails = result.map((user) => user.email);
    expect(emails).toContain("test1@example.com");
    expect(emails).toContain("test2@example.com");
  });

  test("存在しないメールアドレスが含まれていても正常に動作すること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを1人だけ作成
      await ctx.db.insert("users", testUserData1);
    });

    // getUsersByEmailsを実行（存在するメールと存在しないメールを混在）
    const result = await t.query(
      internal.queries.users.getUserByEmail.getUsersByEmails,
      {
        emails: ["test1@example.com", "nonexistent@example.com"],
      },
    );

    // 存在するユーザーのみが返されること
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("test1@example.com");
  });

  test("空の配列を渡した場合は空の配列が返されること", async () => {
    const t = convexTest(schema);

    // getUsersByEmailsを実行（空の配列）
    const result = await t.query(
      internal.queries.users.getUserByEmail.getUsersByEmails,
      {
        emails: [],
      },
    );

    expect(result).toHaveLength(0);
  });
});

describe("emailExists", () => {
  test("存在するメールアドレスでtrueが返されること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData1);
    });

    // emailExistsを実行
    const result = await t.query(
      internal.queries.users.getUserByEmail.emailExists,
      {
        email: "test1@example.com",
      },
    );

    expect(result).toBe(true);
  });

  test("存在しないメールアドレスでfalseが返されること", async () => {
    const t = convexTest(schema);

    // emailExistsを実行（存在しないメールアドレス）
    const result = await t.query(
      internal.queries.users.getUserByEmail.emailExists,
      {
        email: "nonexistent@example.com",
      },
    );

    expect(result).toBe(false);
  });
});

describe("searchUsersByEmailPattern", () => {
  test("メールアドレスの部分文字列で検索できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData1); // test1@example.com
      await ctx.db.insert("users", testUserData2); // test2@example.com
      await ctx.db.insert("users", testUserData3); // yamada@university.ac.jp
    });

    // "example.com"で検索
    const result = await t.query(
      internal.queries.users.getUserByEmail.searchUsersByEmailPattern,
      {
        emailPattern: "example.com",
      },
    );

    expect(result).toHaveLength(2);
    result.forEach((user) => {
      expect(user.email).toContain("example.com");
    });
  });

  test("大文字小文字を区別せずに検索できること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData3); // yamada@university.ac.jp
    });

    // 大文字で検索
    const result = await t.query(
      internal.queries.users.getUserByEmail.searchUsersByEmailPattern,
      {
        emailPattern: "UNIVERSITY",
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("yamada@university.ac.jp");
  });

  test("マッチしないパターンで空の配列が返されること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // テストユーザーを作成
      await ctx.db.insert("users", testUserData1);
    });

    // マッチしないパターンで検索
    const result = await t.query(
      internal.queries.users.getUserByEmail.searchUsersByEmailPattern,
      {
        emailPattern: "nonexistent",
      },
    );

    expect(result).toHaveLength(0);
  });

  test("メールアドレスが設定されていないユーザーは除外されること", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      // メールアドレスなしのユーザーを作成
      const userWithoutEmail = {
        name: "メールなしユーザー",
        role: "user" as const,
        organizationName: "テスト大学",
        isActive: true,
        updatedAt: Date.now(),
      };
      await ctx.db.insert("users", userWithoutEmail);
    });

    // 検索実行
    const result = await t.query(
      internal.queries.users.getUserByEmail.searchUsersByEmailPattern,
      {
        emailPattern: "user",
      },
    );

    expect(result).toHaveLength(0);
  });
});
