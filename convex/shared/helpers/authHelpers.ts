import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";
import { ConvexError } from "convex/values";

export interface AuthenticatedContext {
  userId: Id<"users">;
  user: Doc<"users">;
}

/**
 * 認証チェックを行い、認証されたユーザー情報を返すヘルパー関数
 * 参考プロジェクトのパターンに従った実装
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<AuthenticatedContext> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("認証が必要です");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError("ユーザー情報が見つかりません");
  }

  return { userId: userId as Id<"users">, user };
}

/**
 * 管理者権限チェック
 */
export function requireAdmin(user: Doc<"users">): void {
  if (user.role !== "admin") {
    throw new ConvexError("管理者権限が必要です");
  }
}

/**
 * リソース作成者またはアドミン権限チェック
 */
export function requireOwnershipOrAdmin(
  user: Doc<"users">,
  resourceCreatedBy: Id<"users">,
): void {
  if (user.role !== "admin" && user._id !== resourceCreatedBy) {
    throw new ConvexError("このリソースにアクセスする権限がありません");
  }
}

/**
 * アクティブユーザーチェック
 */
export function requireActiveUser(user: Doc<"users">): void {
  if (user.isActive === false) {
    throw new ConvexError("無効化されたアカウントです");
  }
}

/**
 * 認証 + アクティブユーザーチェックの組み合わせ
 */
export async function requireActiveAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<AuthenticatedContext> {
  const { userId, user } = await requireAuth(ctx);
  requireActiveUser(user);
  return { userId, user };
}

/**
 * 認証 + 管理者権限チェックの組み合わせ
 */
export async function requireAdminAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<AuthenticatedContext> {
  const { userId, user } = await requireAuth(ctx);
  requireAdmin(user);
  return { userId, user };
}
