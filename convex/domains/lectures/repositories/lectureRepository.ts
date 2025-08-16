import { v } from "convex/values";
import { DatabaseReader, DatabaseWriter } from "../../../_generated/server";
import { Id } from "../../../_generated/dataModel";
import {
  generateSurveySlug,
  generateSurveyUrl,
} from "../services/lectureService";

// 講義作成用データ型
export interface CreateLectureData {
  title: string;
  lectureDate: string;
  lectureTime: string;
  description?: string;
  surveyCloseDate: string;
  surveyCloseTime: string;
  organizationName: string;
  createdBy: Id<"users">;
  baseUrl: string;
}

// 講義更新用データ型
export interface UpdateLectureData {
  title?: string;
  lectureDate?: string;
  lectureTime?: string;
  description?: string;
  surveyCloseDate?: string;
  surveyCloseTime?: string;
  surveyStatus?: "active" | "closed";
}

// 講義検索フィルター型
export interface LectureFilter {
  organizationName?: string;
  createdBy?: Id<"users">;
  surveyStatus?: "active" | "closed";
  dateFrom?: string;
  dateTo?: string;
}

// 講義データ型（データベースから取得される完全な形）
export interface LectureData {
  _id: Id<"lectures">;
  title: string;
  lectureDate: string;
  lectureTime: string;
  description?: string;
  surveyCloseDate: string;
  surveyCloseTime: string;
  surveyUrl: string;
  surveySlug: string;
  surveyStatus: "active" | "closed";
  closedAt?: number;
  createdBy: Id<"users">;
  organizationName: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 新しい講義を作成する
 */
export const createLecture = async (
  db: DatabaseWriter,
  data: CreateLectureData,
): Promise<LectureData> => {
  const now = Date.now();

  // スラッグを生成（重複チェック付き）
  let slug: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    slug = generateSurveySlug(data.title, data.lectureDate, data.lectureTime);
    const existing = await db
      .query("lectures")
      .withIndex("by_survey_slug", (q) => q.eq("surveySlug", slug))
      .unique();

    if (!existing) break;

    attempts++;
    if (attempts >= maxAttempts) {
      throw new Error(
        "スラッグの生成に失敗しました。時間をおいて再試行してください。",
      );
    }
  } while (attempts < maxAttempts);

  // URLを生成
  const surveyUrl = generateSurveyUrl(data.baseUrl, slug);

  // 講義データを挿入
  const lectureId = await db.insert("lectures", {
    title: data.title,
    lectureDate: data.lectureDate,
    lectureTime: data.lectureTime,
    description: data.description,
    surveyCloseDate: data.surveyCloseDate,
    surveyCloseTime: data.surveyCloseTime,
    surveyUrl,
    surveySlug: slug,
    surveyStatus: "active",
    createdBy: data.createdBy,
    organizationName: data.organizationName,
    createdAt: now,
    updatedAt: now,
  });

  // 作成された講義を取得して返す
  const lecture = await db.get(lectureId);
  if (!lecture) {
    throw new Error("講義の作成に失敗しました");
  }

  return lecture as LectureData;
};

/**
 * 講義を更新する
 */
export const updateLecture = async (
  db: DatabaseWriter,
  lectureId: Id<"lectures">,
  data: UpdateLectureData,
  userId: Id<"users">,
): Promise<LectureData> => {
  // 講義の存在と権限をチェック
  const existingLecture = await db.get(lectureId);
  if (!existingLecture) {
    throw new Error("指定された講義が見つかりません");
  }

  if (existingLecture.createdBy !== userId) {
    throw new Error("この講義を編集する権限がありません");
  }

  const now = Date.now();
  const updateData: Partial<LectureData> = {
    ...data,
    updatedAt: now,
  };

  // closedAt フィールドの処理
  if (
    data.surveyStatus === "closed" &&
    existingLecture.surveyStatus === "active"
  ) {
    updateData.closedAt = now;
  }

  await db.patch(lectureId, updateData);

  // 更新された講義を取得して返す
  const updatedLecture = await db.get(lectureId);
  if (!updatedLecture) {
    throw new Error("講義の更新に失敗しました");
  }

  return updatedLecture as LectureData;
};

/**
 * スラッグで講義を取得する
 */
export const getLectureBySlug = async (
  db: DatabaseReader,
  slug: string,
): Promise<LectureData | null> => {
  const lecture = await db
    .query("lectures")
    .withIndex("by_survey_slug", (q) => q.eq("surveySlug", slug))
    .unique();

  return lecture as LectureData | null;
};

/**
 * IDで講義を取得する
 */
export const getLectureById = async (
  db: DatabaseReader,
  lectureId: Id<"lectures">,
): Promise<LectureData | null> => {
  const lecture = await db.get(lectureId);
  return lecture as LectureData | null;
};

/**
 * ユーザー別の講義一覧を取得する
 */
export const getLecturesByUser = async (
  db: DatabaseReader,
  userId: Id<"users">,
  filter?: LectureFilter,
): Promise<LectureData[]> => {
  let query = db
    .query("lectures")
    .withIndex("by_creator", (q) => q.eq("createdBy", userId));

  const lectures = await query.collect();

  // フィルタリング
  let filteredLectures = lectures;

  if (filter?.surveyStatus) {
    filteredLectures = filteredLectures.filter(
      (lecture) => lecture.surveyStatus === filter.surveyStatus,
    );
  }

  if (filter?.dateFrom) {
    filteredLectures = filteredLectures.filter(
      (lecture) => lecture.lectureDate >= filter.dateFrom!,
    );
  }

  if (filter?.dateTo) {
    filteredLectures = filteredLectures.filter(
      (lecture) => lecture.lectureDate <= filter.dateTo!,
    );
  }

  // 講義日順でソート（新しい順）
  filteredLectures.sort((a, b) => {
    const dateComparison = b.lectureDate.localeCompare(a.lectureDate);
    if (dateComparison !== 0) return dateComparison;
    return b.lectureTime.localeCompare(a.lectureTime);
  });

  return filteredLectures as LectureData[];
};

/**
 * 組織別の講義一覧を取得する
 */
export const getLecturesByOrganization = async (
  db: DatabaseReader,
  organizationName: string,
  filter?: LectureFilter,
): Promise<LectureData[]> => {
  let query = db
    .query("lectures")
    .withIndex("by_organization", (q) =>
      q.eq("organizationName", organizationName),
    );

  const lectures = await query.collect();

  // フィルタリング（ユーザー別と同じロジック）
  let filteredLectures = lectures;

  if (filter?.surveyStatus) {
    filteredLectures = filteredLectures.filter(
      (lecture) => lecture.surveyStatus === filter.surveyStatus,
    );
  }

  if (filter?.dateFrom) {
    filteredLectures = filteredLectures.filter(
      (lecture) => lecture.lectureDate >= filter.dateFrom!,
    );
  }

  if (filter?.dateTo) {
    filteredLectures = filteredLectures.filter(
      (lecture) => lecture.lectureDate <= filter.dateTo!,
    );
  }

  // 講義日順でソート（新しい順）
  filteredLectures.sort((a, b) => {
    const dateComparison = b.lectureDate.localeCompare(a.lectureDate);
    if (dateComparison !== 0) return dateComparison;
    return b.lectureTime.localeCompare(a.lectureTime);
  });

  return filteredLectures as LectureData[];
};

/**
 * アクティブな講義（自動締切対象）を取得する
 */
export const getActiveLecturesForAutoClosure = async (
  db: DatabaseReader,
  currentTime: number,
): Promise<LectureData[]> => {
  const lectures = await db
    .query("lectures")
    .withIndex("by_survey_status", (q) => q.eq("surveyStatus", "active"))
    .collect();

  // 締切時刻を過ぎた講義をフィルタリング
  const expiredLectures = lectures.filter((lecture) => {
    const closeDateTime = new Date(
      `${lecture.surveyCloseDate}T${lecture.surveyCloseTime}:00`,
    );
    return new Date(currentTime) > closeDateTime;
  });

  return expiredLectures as LectureData[];
};

/**
 * 講義を削除する（ソフトデリート想定なら状態更新、ハードデリートなら実際に削除）
 */
export const deleteLecture = async (
  db: DatabaseWriter,
  lectureId: Id<"lectures">,
  userId: Id<"users">,
): Promise<void> => {
  // 講義の存在と権限をチェック
  const existingLecture = await db.get(lectureId);
  if (!existingLecture) {
    throw new Error("指定された講義が見つかりません");
  }

  if (existingLecture.createdBy !== userId) {
    throw new Error("この講義を削除する権限がありません");
  }

  // ハードデリート（実際の要件に応じて変更）
  await db.delete(lectureId);
};

/**
 * 講義統計情報を取得する
 */
export const getLectureStats = async (
  db: DatabaseReader,
  userId: Id<"users">,
): Promise<{
  totalLectures: number;
  activeLectures: number;
  closedLectures: number;
}> => {
  const lectures = await db
    .query("lectures")
    .withIndex("by_creator", (q) => q.eq("createdBy", userId))
    .collect();

  const activeLectures = lectures.filter(
    (l) => l.surveyStatus === "active",
  ).length;
  const closedLectures = lectures.filter(
    (l) => l.surveyStatus === "closed",
  ).length;

  return {
    totalLectures: lectures.length,
    activeLectures,
    closedLectures,
  };
};
