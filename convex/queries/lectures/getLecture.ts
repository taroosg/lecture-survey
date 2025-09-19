/**
 * Internal Queries - 講義取得機能
 * IDやスラッグによる講義取得のinternal関数群
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";

/**
 * 講義データの型定義
 */
export type LectureData = Doc<"lectures">;

/**
 * IDで講義を取得する
 * @param lectureId - 講義ID
 * @returns 講義データ（存在しない場合はnull）
 */
export const getLectureById = internalQuery({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<LectureData | null> => {
    return await ctx.db.get(args.lectureId);
  },
});

/**
 * スラッグで講義を取得する（lectureIdベース）
 * @param slug - 講義のスラッグ（lectureId）
 * @returns 講義データ（存在しない場合はnull）
 */
export const getLectureBySlug = internalQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<LectureData | null> => {
    // slug is now just the lectureId
    try {
      return await ctx.db.get(args.slug as Id<"lectures">);
    } catch {
      return null;
    }
  },
});

/**
 * 複数の講義IDによる一括取得
 * @param lectureIds - 講義IDの配列
 * @returns 講義データの配列（存在しないIDは除外）
 */
export const getLecturesByIds = internalQuery({
  args: {
    lectureIds: v.array(v.id("lectures")),
  },
  handler: async (ctx, args): Promise<LectureData[]> => {
    const lectures = await Promise.all(
      args.lectureIds.map(async (lectureId) => {
        return await ctx.db.get(lectureId);
      }),
    );

    // null値を除外して返す
    return lectures.filter(
      (lecture): lecture is LectureData => lecture !== null,
    );
  },
});

/**
 * 講義の存在確認
 * @param lectureId - 講義ID
 * @returns 講義が存在するかどうか
 */
export const lectureExists = internalQuery({
  args: {
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const lecture = await ctx.db.get(args.lectureId);
    return lecture !== null;
  },
});

/**
 * スラッグによる講義の存在確認（lectureIdベース）
 * @param slug - 講義のスラッグ（lectureId）
 * @returns 講義が存在するかどうか
 */
export const lectureExistsBySlug = internalQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    // slug is now just the lectureId
    try {
      const lecture = await ctx.db.get(args.slug as Id<"lectures">);
      return lecture !== null;
    } catch {
      return false;
    }
  },
});

/**
 * 講義のタイトルによる検索
 * @param titlePattern - タイトルの部分文字列
 * @returns マッチする講義データの配列
 */
export const searchLecturesByTitle = internalQuery({
  args: {
    titlePattern: v.string(),
  },
  handler: async (ctx, args): Promise<LectureData[]> => {
    const allLectures = await ctx.db.query("lectures").collect();

    // タイトルが部分文字列でマッチする講義をフィルタリング
    return allLectures.filter((lecture) => {
      return lecture.title
        .toLowerCase()
        .includes(args.titlePattern.toLowerCase());
    });
  },
});

/**
 * スラッグで講義を取得（Internal Query）（lectureIdベース）
 * 公開アンケート用、認証不要
 */
export const getLectureBySlugInternal = internalQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // slug is now just the lectureId
    let lecture;
    try {
      lecture = await ctx.db.get(args.slug as Id<"lectures">);
    } catch {
      return null;
    }

    if (!lecture) {
      return null;
    }

    // 公開用には一部フィールドのみ返す
    return {
      _id: lecture._id,
      title: lecture.title,
      lectureDate: lecture.lectureDate,
      lectureTime: lecture.lectureTime,
      description: lecture.description,
      surveyStatus: lecture.surveyStatus,
    };
  },
});
