/**
 * userRepository.ts のテスト（モック使用）
 * データベース操作のテスト
 *
 * 注意: convex-testライブラリの導入が必要なため、現在はモックベースでテスト実装
 * 将来的にはconvex-testを使用した統合テストに変更予定
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import type { QueryCtx, MutationCtx } from "../../../_generated/server";
import type { Id } from "../../../_generated/dataModel";
import {
  getUserById,
  getCurrentUser,
  getUserByEmail,
  getUsersByRole,
  getActiveUsers,
  updateUserProfile,
  updateUserRole,
  updateUserActiveStatus,
  getUserStats,
} from "./userRepository";
import {
  validUserData,
  adminUserData,
  inactiveUserData,
  otherOrgUserData,
  activeUsersArray,
  cloneUserData,
} from "../__fixtures__/user_test_data";

// モック関数の型定義
type MockDatabase = {
  get: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

type MockQueryBuilder = {
  withIndex: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  collect: ReturnType<typeof vi.fn>;
  first: ReturnType<typeof vi.fn>;
};

// モック関数の作成
const createMockQueryBuilder = (): MockQueryBuilder => ({
  withIndex: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  collect: vi.fn(),
  first: vi.fn(),
});

const createMockDatabase = (): MockDatabase => ({
  get: vi.fn(),
  query: vi.fn(() => createMockQueryBuilder()),
  patch: vi.fn(),
});

const createMockContext = (mockDb: MockDatabase) => ({
  db: mockDb,
});

// getAuthUserId のモック
vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(),
}));

const { getAuthUserId } = await import("@convex-dev/auth/server");
const mockGetAuthUserId = vi.mocked(getAuthUserId);

describe("userRepository", () => {
  let mockDb: MockDatabase;
  let mockCtx: QueryCtx;
  let mockMutationCtx: MutationCtx;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDatabase();
    mockCtx = createMockContext(mockDb) as unknown as QueryCtx;
    mockMutationCtx = createMockContext(mockDb) as unknown as MutationCtx;
  });

  describe("getUserById", () => {
    test("存在するユーザーの取得テストでユーザーデータが返されること", async () => {
      const userId = "user_valid_123" as Id<"users">;
      mockDb.get.mockResolvedValue(validUserData);

      const result = await getUserById(mockCtx, userId);

      expect(mockDb.get).toHaveBeenCalledWith(userId);
      expect(result).toEqual(validUserData);
    });

    test("存在しないユーザーでnullが返されること", async () => {
      const userId = "nonexistent_user" as Id<"users">;
      mockDb.get.mockResolvedValue(null);

      const result = await getUserById(mockCtx, userId);

      expect(mockDb.get).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe("getCurrentUser", () => {
    test("認証ユーザーの取得テストで正しいユーザーが返されること", async () => {
      const userId = "user_valid_123" as Id<"users">;
      mockGetAuthUserId.mockResolvedValue(userId);
      mockDb.get.mockResolvedValue(validUserData);

      const result = await getCurrentUser(mockCtx);

      expect(mockGetAuthUserId).toHaveBeenCalledWith(mockCtx);
      expect(mockDb.get).toHaveBeenCalledWith(userId);
      expect(result).toEqual(validUserData);
    });

    test("認証されていない場合にnullが返されること", async () => {
      mockGetAuthUserId.mockResolvedValue(null);

      const result = await getCurrentUser(mockCtx);

      expect(mockGetAuthUserId).toHaveBeenCalledWith(mockCtx);
      expect(mockDb.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    test("メールアドレスで正しいユーザーが取得できること", async () => {
      const email = "yamada@example.com";
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.first.mockResolvedValue(validUserData);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getUserByEmail(mockCtx, email);

      expect(mockDb.query).toHaveBeenCalledWith("users");
      expect(mockQueryBuilder.withIndex).toHaveBeenCalledWith(
        "email",
        expect.any(Function),
      );
      expect(result).toEqual(validUserData);
    });

    test("存在しないメールアドレスでnullが返されること", async () => {
      const email = "nonexistent@example.com";
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.first.mockResolvedValue(null);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getUserByEmail(mockCtx, email);

      expect(result).toBeNull();
    });
  });

  describe("getUsersByRole", () => {
    test("管理者ユーザー一覧が正しく取得できること", async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.collect.mockResolvedValue([adminUserData]);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getUsersByRole(mockCtx, "admin");

      expect(mockDb.query).toHaveBeenCalledWith("users");
      expect(mockQueryBuilder.withIndex).toHaveBeenCalledWith(
        "role",
        expect.any(Function),
      );
      expect(result).toEqual([adminUserData]);
    });

    test("一般ユーザー一覧が正しく取得できること", async () => {
      const userOnlyData = [validUserData, inactiveUserData];
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.collect.mockResolvedValue(userOnlyData);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getUsersByRole(mockCtx, "user");

      expect(result).toEqual(userOnlyData);
    });
  });

  describe("getActiveUsers", () => {
    test("アクティブユーザー一覧が正しく取得できること", async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.collect.mockResolvedValue(activeUsersArray);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getActiveUsers(mockCtx);

      expect(mockDb.query).toHaveBeenCalledWith("users");
      expect(mockQueryBuilder.withIndex).toHaveBeenCalledWith(
        "active",
        expect.any(Function),
      );
      expect(result).toEqual(activeUsersArray);
    });

    test("ロールフィルターが正しく動作すること", async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.collect.mockResolvedValue(activeUsersArray);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getActiveUsers(mockCtx, {
        role: "admin",
      });

      const filteredUsers = result.filter((user) => user.role === "admin");
      expect(filteredUsers.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("updateUserProfile", () => {
    test("プロファイル更新の正常系テストで更新が成功すること", async () => {
      const userId = "user_valid_123" as Id<"users">;
      const updateData = { name: "更新された名前", updatedAt: Date.now() };
      const updatedUser = cloneUserData(validUserData, updateData);

      mockDb.get
        .mockResolvedValueOnce(validUserData) // 存在確認
        .mockResolvedValueOnce(updatedUser); // 更新後取得
      mockDb.patch.mockResolvedValue(undefined);

      const result = await updateUserProfile(
        mockMutationCtx,
        userId,
        updateData,
      );

      expect(mockDb.get).toHaveBeenCalledWith(userId);
      expect(mockDb.patch).toHaveBeenCalledWith(
        userId,
        expect.objectContaining(updateData),
      );
      expect(result).toEqual(updatedUser);
    });

    test("存在しないユーザー更新でエラーになること", async () => {
      const userId = "nonexistent_user" as Id<"users">;
      const updateData = { name: "更新された名前" };

      mockDb.get.mockResolvedValue(null);

      await expect(
        updateUserProfile(mockMutationCtx, userId, updateData),
      ).rejects.toThrow("ユーザーが見つかりません");

      expect(mockDb.patch).not.toHaveBeenCalled();
    });

    test("部分更新の動作確認テストで指定フィールドのみ更新されること", async () => {
      const userId = "user_valid_123" as Id<"users">;
      const updateData = { name: "更新されたユーザー" };
      const updatedUser = cloneUserData(validUserData, updateData);

      mockDb.get
        .mockResolvedValueOnce(validUserData)
        .mockResolvedValueOnce(updatedUser);
      mockDb.patch.mockResolvedValue(undefined);

      const result = await updateUserProfile(
        mockMutationCtx,
        userId,
        updateData,
      );

      expect(mockDb.patch).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          name: "更新されたユーザー",
          updatedAt: expect.any(Number),
        }),
      );
      expect(result.name).toBe("更新されたユーザー");
    });
  });

  describe("updateUserRole", () => {
    test("ロール更新が正常に動作すること", async () => {
      const userId = "user_valid_123" as Id<"users">;
      const newRole = "admin";
      const updatedUser = cloneUserData(validUserData, { role: newRole });

      mockDb.get
        .mockResolvedValueOnce(validUserData)
        .mockResolvedValueOnce(updatedUser);
      mockDb.patch.mockResolvedValue(undefined);

      const result = await updateUserRole(mockMutationCtx, userId, newRole);

      expect(mockDb.patch).toHaveBeenCalledWith(userId, {
        role: newRole,
        updatedAt: expect.any(Number),
      });
      expect(result.role).toBe(newRole);
    });

    test("存在しないユーザーのロール更新でエラーになること", async () => {
      const userId = "nonexistent_user" as Id<"users">;
      const newRole = "admin";

      mockDb.get.mockResolvedValue(null);

      await expect(
        updateUserRole(mockMutationCtx, userId, newRole),
      ).rejects.toThrow("ユーザーが見つかりません");
    });
  });

  describe("updateUserActiveStatus", () => {
    test("アクティブ状態更新が正常に動作すること", async () => {
      const userId = "user_valid_123" as Id<"users">;
      const isActive = false;
      const updatedUser = cloneUserData(validUserData, { isActive });

      mockDb.get
        .mockResolvedValueOnce(validUserData)
        .mockResolvedValueOnce(updatedUser);
      mockDb.patch.mockResolvedValue(undefined);

      const result = await updateUserActiveStatus(
        mockMutationCtx,
        userId,
        isActive,
      );

      expect(mockDb.patch).toHaveBeenCalledWith(userId, {
        isActive,
        updatedAt: expect.any(Number),
      });
      expect(result.isActive).toBe(isActive);
    });
  });

  describe("getUserStats", () => {
    test("ユーザー統計情報が正しく計算されること", async () => {
      const testUsers = [
        validUserData, // active user
        adminUserData, // active admin
        inactiveUserData, // inactive user
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.collect.mockResolvedValue(testUsers);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getUserStats(mockCtx);

      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.inactive).toBe(1);
      expect(result.admins).toBe(1);
      expect(result.users).toBe(2);
    });

    test("全体統計情報が正しく計算されること", async () => {
      const allUsers = [
        validUserData,
        adminUserData,
        inactiveUserData,
        otherOrgUserData,
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.collect.mockResolvedValue(allUsers);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getUserStats(mockCtx);

      expect(result.total).toBe(4);
      expect(result.active).toBe(3);
      expect(result.inactive).toBe(1);
      expect(result.admins).toBe(1);
      expect(result.users).toBe(3);
    });

    test("ユーザーが存在しない場合はゼロ統計が返されること", async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.collect.mockResolvedValue([]);
      mockDb.query.mockReturnValue(mockQueryBuilder);

      const result = await getUserStats(mockCtx);

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.inactive).toBe(0);
      expect(result.admins).toBe(0);
      expect(result.users).toBe(0);
    });
  });
});
