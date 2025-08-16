// TODO: APIレイヤーのテスト実装が必要
// convex-testライブラリを使用したテストを将来実装する
// 参考: https://docs.convex.dev/testing/convex-test

import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  createLecture,
  updateLecture,
  deleteLecture,
  type CreateLectureData,
  type UpdateLectureData,
} from "../repositories/lectureRepository";
import {
  validateLectureData,
  validateLectureUpdate,
  lectureDataValidator,
  lectureUpdateValidator,
  type LectureData,
  type LectureUpdateData,
} from "../services/lectureValidator";
import {
  isValidStatusTransition,
  isClosable,
} from "../services/lectureService";

/**
 * 新しい講義を作成する
 */
export const createNewLecture = mutation({
  args: {
    title: v.string(),
    lectureDate: v.string(),
    lectureTime: v.string(),
    description: v.optional(v.string()),
    surveyCloseDate: v.string(),
    surveyCloseTime: v.string(),
    baseUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    // ユーザー情報を取得
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("ユーザー情報が見つかりません");
    }

    if (!user.organizationName) {
      throw new Error("ユーザーの組織名が設定されていません");
    }

    // バリデーション用データを準備
    const lectureData: LectureData = {
      title: args.title,
      lectureDate: args.lectureDate,
      lectureTime: args.lectureTime,
      description: args.description,
      surveyCloseDate: args.surveyCloseDate,
      surveyCloseTime: args.surveyCloseTime,
      organizationName: user.organizationName,
    };

    // バリデーション実行
    const validationResult = validateLectureData(lectureData);
    if (!validationResult.isValid) {
      throw new Error(
        `バリデーションエラー: ${validationResult.errors.join(", ")}`,
      );
    }

    // リポジトリ用データを準備
    const createData: CreateLectureData = {
      ...lectureData,
      createdBy: userId,
      baseUrl:
        args.baseUrl ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000",
    };

    // 講義作成
    const newLecture = await createLecture(ctx.db, createData);

    return newLecture;
  },
});

/**
 * 既存の講義を更新する
 */
export const updateExistingLecture = mutation({
  args: {
    lectureId: v.id("lectures"),
    title: v.optional(v.string()),
    lectureDate: v.optional(v.string()),
    lectureTime: v.optional(v.string()),
    description: v.optional(v.string()),
    surveyCloseDate: v.optional(v.string()),
    surveyCloseTime: v.optional(v.string()),
    surveyStatus: v.optional(v.union(v.literal("active"), v.literal("closed"))),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    // 更新データを準備
    const updateData: LectureUpdateData = {
      title: args.title,
      lectureDate: args.lectureDate,
      lectureTime: args.lectureTime,
      description: args.description,
      surveyCloseDate: args.surveyCloseDate,
      surveyCloseTime: args.surveyCloseTime,
      surveyStatus: args.surveyStatus,
    };

    // 更新データのバリデーション
    const validationResult = validateLectureUpdate(updateData);
    if (!validationResult.isValid) {
      throw new Error(
        `バリデーションエラー: ${validationResult.errors.join(", ")}`,
      );
    }

    // 既存講義の状態チェック（状態変更の場合）
    if (args.surveyStatus) {
      const existingLecture = await ctx.db.get(args.lectureId);
      if (!existingLecture) {
        throw new Error("指定された講義が見つかりません");
      }

      // 状態遷移の妥当性チェック
      if (
        !isValidStatusTransition(
          existingLecture.surveyStatus,
          args.surveyStatus,
        )
      ) {
        throw new Error("無効な状態遷移です");
      }

      // 手動締切の場合、締切可能な状態かチェック
      if (
        args.surveyStatus === "closed" &&
        existingLecture.surveyStatus === "active"
      ) {
        if (
          !isClosable(
            existingLecture.surveyStatus,
            existingLecture.surveyCloseDate,
            existingLecture.surveyCloseTime,
          )
        ) {
          throw new Error("現在の状況では講義を締切ることができません");
        }
      }
    }

    // 講義更新
    const updatedLecture = await updateLecture(
      ctx.db,
      args.lectureId,
      updateData,
      userId,
    );

    return updatedLecture;
  },
});

/**
 * 講義を手動で締切る
 */
export const closeLecture = mutation({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    // 既存講義の取得と権限チェック
    const existingLecture = await ctx.db.get(args.lectureId);
    if (!existingLecture) {
      throw new Error("指定された講義が見つかりません");
    }

    if (existingLecture.createdBy !== userId) {
      throw new Error("この講義を締切る権限がありません");
    }

    // 締切可能な状態かチェック
    if (
      !isClosable(
        existingLecture.surveyStatus,
        existingLecture.surveyCloseDate,
        existingLecture.surveyCloseTime,
      )
    ) {
      throw new Error("現在の状況では講義を締切ることができません");
    }

    // 講義を締切状態に更新
    const updatedLecture = await updateLecture(
      ctx.db,
      args.lectureId,
      { surveyStatus: "closed" },
      userId,
    );

    return updatedLecture;
  },
});

/**
 * 講義を削除する
 */
export const removeeLecture = mutation({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    // 講義削除
    await deleteLecture(ctx.db, args.lectureId, userId);

    return { success: true };
  },
});

/**
 * 講義を複製する
 */
export const duplicateLecture = mutation({
  args: {
    lectureId: v.id("lectures"),
    newTitle: v.optional(v.string()),
    newLectureDate: v.optional(v.string()),
    newLectureTime: v.optional(v.string()),
    newSurveyCloseDate: v.optional(v.string()),
    newSurveyCloseTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    // ユーザー情報を取得
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("ユーザー情報が見つかりません");
    }

    if (!user.organizationName) {
      throw new Error("ユーザーの組織名が設定されていません");
    }

    // 元の講義を取得
    const originalLecture = await ctx.db.get(args.lectureId);
    if (!originalLecture) {
      throw new Error("複製元の講義が見つかりません");
    }

    // 権限チェック
    if (originalLecture.createdBy !== userId) {
      throw new Error("この講義を複製する権限がありません");
    }

    // 複製用データを準備
    const duplicateData: LectureData = {
      title: args.newTitle || `${originalLecture.title} (コピー)`,
      lectureDate: args.newLectureDate || originalLecture.lectureDate,
      lectureTime: args.newLectureTime || originalLecture.lectureTime,
      description: originalLecture.description,
      surveyCloseDate:
        args.newSurveyCloseDate || originalLecture.surveyCloseDate,
      surveyCloseTime:
        args.newSurveyCloseTime || originalLecture.surveyCloseTime,
      organizationName: user.organizationName,
    };

    // バリデーション実行
    const validationResult = validateLectureData(duplicateData);
    if (!validationResult.isValid) {
      throw new Error(
        `バリデーションエラー: ${validationResult.errors.join(", ")}`,
      );
    }

    // 講義作成用データを準備
    const createData: CreateLectureData = {
      ...duplicateData,
      createdBy: userId,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    };

    // 新しい講義を作成
    const newLecture = await createLecture(ctx.db, createData);

    return newLecture;
  },
});

/**
 * 複数の講義を一括削除する
 */
export const bulkDeleteLectures = mutation({
  args: {
    lectureIds: v.array(v.id("lectures")),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const results = [];
    const errors = [];

    // 各講義を順次削除
    for (const lectureId of args.lectureIds) {
      try {
        await deleteLecture(ctx.db, lectureId, userId);
        results.push({ lectureId, success: true });
      } catch (error) {
        errors.push({
          lectureId,
          error: error instanceof Error ? error.message : "不明なエラー",
        });
      }
    }

    return {
      successCount: results.length,
      errorCount: errors.length,
      errors,
    };
  },
});

/**
 * 講義状態を一括更新する
 */
export const bulkUpdateLectureStatus = mutation({
  args: {
    lectureIds: v.array(v.id("lectures")),
    surveyStatus: v.union(v.literal("active"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("認証が必要です");
    }

    const results = [];
    const errors = [];

    // 各講義の状態を順次更新
    for (const lectureId of args.lectureIds) {
      try {
        const updatedLecture = await updateLecture(
          ctx.db,
          lectureId,
          { surveyStatus: args.surveyStatus },
          userId,
        );
        results.push({ lectureId, lecture: updatedLecture });
      } catch (error) {
        errors.push({
          lectureId,
          error: error instanceof Error ? error.message : "不明なエラー",
        });
      }
    }

    return {
      successCount: results.length,
      errorCount: errors.length,
      updatedLectures: results,
      errors,
    };
  },
});
