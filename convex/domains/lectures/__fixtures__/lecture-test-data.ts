import { Id } from "../../../_generated/dataModel";
import type {
  LectureData,
  CreateLectureData,
  UpdateLectureData,
} from "../repositories/lectureRepository";

// テスト用のID
export const TEST_USER_ID = "test_user_123" as Id<"users">;
export const TEST_LECTURE_ID = "test_lecture_123" as Id<"lectures">;
export const TEST_OTHER_USER_ID = "other_user_456" as Id<"users">;
export const TEST_OTHER_LECTURE_ID = "other_lecture_456" as Id<"lectures">;

// テスト用ユーザーデータ
export const createMockUser = (overrides: Partial<any> = {}) => ({
  _id: TEST_USER_ID,
  email: "test@example.com",
  name: "テストユーザー",
  organizationName: "テスト大学",
  role: "organizer" as const,
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

// テスト用講義データの基本形
export const createMockLecture = (
  overrides: Partial<LectureData> = {},
): LectureData => ({
  _id: TEST_LECTURE_ID,
  title: "プログラミング基礎",
  lectureDate: "2024-12-31",
  lectureTime: "10:00",
  description: "プログラミングの基礎を学びます",
  surveyCloseDate: "2025-01-03",
  surveyCloseTime: "23:59",
  surveyUrl: "https://example.com/survey/programming_20241231_1000_abc123",
  surveySlug: "programming_20241231_1000_abc123",
  surveyStatus: "active",
  createdBy: TEST_USER_ID,
  organizationName: "テスト大学",
  createdAt: 1703980800000, // 2024-01-01 00:00:00 UTC
  updatedAt: 1703980800000,
  ...overrides,
});

// 作成用テストデータ
export const createMockCreateLectureData = (
  overrides: Partial<CreateLectureData> = {},
): CreateLectureData => ({
  title: "プログラミング基礎",
  lectureDate: "2024-12-31",
  lectureTime: "10:00",
  description: "プログラミングの基礎を学びます",
  surveyCloseDate: "2025-01-03",
  surveyCloseTime: "23:59",
  organizationName: "テスト大学",
  createdBy: TEST_USER_ID,
  baseUrl: "https://example.com",
  ...overrides,
});

// 更新用テストデータ
export const createMockUpdateLectureData = (
  overrides: Partial<UpdateLectureData> = {},
): UpdateLectureData => ({
  title: "更新されたプログラミング基礎",
  description: "更新されたプログラミングの基礎を学びます",
  ...overrides,
});

// 様々な状態の講義データ
export const MOCK_LECTURES = {
  // アクティブな講義
  active: createMockLecture({
    _id: "active_lecture" as Id<"lectures">,
    title: "アクティブな講義",
    surveyStatus: "active",
  }),

  // 締切済み講義
  closed: createMockLecture({
    _id: "closed_lecture" as Id<"lectures">,
    title: "締切済み講義",
    surveyStatus: "closed",
    closedAt: Date.now(),
  }),

  // 過去の講義
  past: createMockLecture({
    _id: "past_lecture" as Id<"lectures">,
    title: "過去の講義",
    lectureDate: "2024-01-15",
    lectureTime: "14:00",
    surveyCloseDate: "2024-01-18",
    surveyCloseTime: "23:59",
    surveyStatus: "closed",
    closedAt: 1705708800000, // 2024-01-20 00:00:00 UTC
  }),

  // 未来の講義
  future: createMockLecture({
    _id: "future_lecture" as Id<"lectures">,
    title: "未来の講義",
    lectureDate: "2025-06-15",
    lectureTime: "10:00",
    surveyCloseDate: "2025-06-18",
    surveyCloseTime: "23:59",
    surveyStatus: "active",
  }),

  // 他のユーザーの講義
  otherUser: createMockLecture({
    _id: "other_user_lecture" as Id<"lectures">,
    title: "他のユーザーの講義",
    createdBy: TEST_OTHER_USER_ID,
    organizationName: "他の大学",
  }),
};

// バリデーションテスト用のデータ
export const VALIDATION_TEST_DATA = {
  // 正常なデータ
  valid: {
    title: "正常な講義タイトル",
    lectureDate: "2024-12-31",
    lectureTime: "10:00",
    description: "正常な講義説明",
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    organizationName: "テスト大学",
  },

  // 不正なデータ（タイトル空）
  emptyTitle: {
    title: "",
    lectureDate: "2024-12-31",
    lectureTime: "10:00",
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    organizationName: "テスト大学",
  },

  // 不正なデータ（日付形式）
  invalidDate: {
    title: "テスト講義",
    lectureDate: "2024/12/31", // スラッシュ区切り
    lectureTime: "10:00",
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    organizationName: "テスト大学",
  },

  // 不正なデータ（時刻形式）
  invalidTime: {
    title: "テスト講義",
    lectureDate: "2024-12-31",
    lectureTime: "25:00", // 無効な時刻
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    organizationName: "テスト大学",
  },

  // 不正なデータ（締切が講義より前）
  invalidCloseDate: {
    title: "テスト講義",
    lectureDate: "2024-12-31",
    lectureTime: "10:00",
    surveyCloseDate: "2024-12-30", // 講義日より前
    surveyCloseTime: "23:59",
    organizationName: "テスト大学",
  },

  // 長すぎるタイトル
  tooLongTitle: {
    title: "a".repeat(101), // 101文字
    lectureDate: "2024-12-31",
    lectureTime: "10:00",
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    organizationName: "テスト大学",
  },

  // 長すぎる説明
  tooLongDescription: {
    title: "テスト講義",
    lectureDate: "2024-12-31",
    lectureTime: "10:00",
    description: "a".repeat(501), // 501文字
    surveyCloseDate: "2025-01-03",
    surveyCloseTime: "23:59",
    organizationName: "テスト大学",
  },
};

// APIテスト用のモックレスポンス
export const MOCK_API_RESPONSES = {
  createLectureSuccess: {
    ...createMockLecture(),
    surveyUrl: "https://example.com/survey/programming_20241231_1000_abc123",
    surveySlug: "programming_20241231_1000_abc123",
  },

  getLecturesSuccess: [
    MOCK_LECTURES.active,
    MOCK_LECTURES.future,
    MOCK_LECTURES.past,
  ],

  getLectureStatsSuccess: {
    totalLectures: 10,
    activeLectures: 6,
    closedLectures: 4,
  },

  bulkOperationSuccess: {
    successCount: 3,
    errorCount: 0,
    errors: [],
  },

  bulkOperationPartialSuccess: {
    successCount: 2,
    errorCount: 1,
    errors: [
      {
        lectureId: "failed_lecture" as Id<"lectures">,
        error: "権限がありません",
      },
    ],
  },
};

// エラーメッセージ定数
export const ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED: "認証が必要です",
  USER_NOT_FOUND: "ユーザー情報が見つかりません",
  LECTURE_NOT_FOUND: "指定された講義が見つかりません",
  NO_PERMISSION: "この講義にアクセスする権限がありません",
  INVALID_STATUS_TRANSITION: "無効な状態遷移です",
  CANNOT_CLOSE: "現在の状況では講義を締切ることができません",
  VALIDATION_ERROR: "バリデーションエラー",
} as const;

// 日付・時刻のテスト用ユーティリティ
export const TEST_DATES = {
  // 2024-01-01 00:00:00 UTC
  PAST_DATE: "2024-01-01",
  PAST_TIME: "00:00",
  PAST_TIMESTAMP: 1704067200000,

  // 2024-12-31 10:00:00 UTC
  FUTURE_DATE: "2024-12-31",
  FUTURE_TIME: "10:00",
  FUTURE_TIMESTAMP: 1735639200000,

  // 2025-01-03 23:59:00 UTC
  FAR_FUTURE_DATE: "2025-01-03",
  FAR_FUTURE_TIME: "23:59",
  FAR_FUTURE_TIMESTAMP: 1735948740000,
} as const;

// テスト用のスラッグとURL
export const TEST_SLUGS = {
  VALID: "programming_20241231_1000_abc123",
  INVALID: "nonexistent_slug",
  DUPLICATE: "duplicate_slug_test",
} as const;

export const TEST_URLS = {
  BASE: "https://example.com",
  SURVEY: "https://example.com/survey/programming_20241231_1000_abc123",
  LOCAL: "http://localhost:3000",
} as const;
