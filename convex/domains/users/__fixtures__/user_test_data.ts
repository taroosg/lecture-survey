/**
 * ユーザードメインのテストデータとフィクスチャ
 * テストで使用するサンプルデータを提供
 */

import type { Doc } from "../../../_generated/dataModel";
import type { UserProfile, UserProfileUpdate } from "../services/userValidator";

/**
 * テスト用ユーザーデータ（基本タイプ）
 */
export type TestUserData = Doc<"users">;

/**
 * テスト用講義データ（簡易版）
 */
export interface TestLectureData {
  _id: string;
  createdBy: string;
}

/**
 * 有効なユーザーデータサンプル
 */
export const validUserData: TestUserData = {
  _id: "user_valid_123" as any,
  _creationTime: Date.now(),
  name: "山田太郎",
  email: "yamada@example.com",
  role: "user",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

/**
 * 管理者ユーザーデータサンプル
 */
export const adminUserData: TestUserData = {
  _id: "admin_123" as any,
  _creationTime: Date.now(),
  name: "管理者ユーザー",
  email: "admin@example.com",
  role: "admin",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

/**
 * 非アクティブユーザーデータサンプル
 */
export const inactiveUserData: TestUserData = {
  _id: "user_inactive_123" as any,
  _creationTime: Date.now(),
  name: "非アクティブユーザー",
  email: "inactive@example.com",
  role: "user",
  organizationName: "テスト大学",
  isActive: false,
  updatedAt: Date.now(),
};

/**
 * 別組織のユーザーデータサンプル
 */
export const otherOrgUserData: TestUserData = {
  _id: "user_other_org_123" as any,
  _creationTime: Date.now(),
  name: "他組織ユーザー",
  email: "other@other-org.com",
  role: "user",
  organizationName: "他の組織",
  isActive: true,
  updatedAt: Date.now(),
};

/**
 * 名前のないユーザーデータサンプル
 */
export const noNameUserData: TestUserData = {
  _id: "user_no_name_123" as any,
  _creationTime: Date.now(),
  email: "noname@example.com",
  role: "user",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

/**
 * メールアドレスのないユーザーデータサンプル
 */
export const noEmailUserData: TestUserData = {
  _id: "user_no_email_123" as any,
  _creationTime: Date.now(),
  role: "user",
  organizationName: "テスト大学",
  isActive: true,
  updatedAt: Date.now(),
};

/**
 * テスト用講義データサンプル
 */
export const testLectureData: TestLectureData = {
  _id: "lecture_123",
  createdBy: "user_valid_123",
};

/**
 * 他ユーザーの講義データサンプル
 */
export const otherUserLectureData: TestLectureData = {
  _id: "lecture_other_123",
  createdBy: "user_other_org_123",
};

/**
 * 有効なユーザープロファイルデータ
 */
export const validUserProfile: UserProfile = {
  name: "田中花子",
  email: "tanaka@example.com",
  role: "user",
};

/**
 * 無効なユーザープロファイルデータ（メール形式エラー）
 */
export const invalidEmailUserProfile: UserProfile = {
  name: "田中花子",
  email: "invalid-email",
  role: "user",
};

/**
 * 有効なプロファイル更新データ
 */
export const validProfileUpdate: UserProfileUpdate = {
  name: "更新された名前",
};

/**
 * 無効なプロファイル更新データ（名前長すぎ）
 */
export const invalidNameUpdateData: UserProfileUpdate = {
  name: "あ".repeat(101), // 101文字
};

/**
 * エッジケース用の文字列データ
 */
export const edgeCaseStrings = {
  empty: "",
  whitespaceOnly: "   ",
  longName: "あ".repeat(100), // 境界値
  tooLongName: "あ".repeat(101), // 境界値超過
  normalText: "正常な文字列",
  withSpaces: "  前後にスペース  ",
  multipleSpaces: "複数  の    スペース",
};

/**
 * テスト用メールアドレス
 */
export const testEmails = {
  valid: [
    "test@example.com",
    "user.name@domain.co.jp",
    "test+tag@example.org",
    "123@test.com",
  ],
  invalid: [
    "invalid-email",
    "@example.com",
    "test@",
    "test..test@example.com",
    "test@example",
    "",
    "a".repeat(256) + "@example.com", // 長すぎるメール
  ],
};

/**
 * テスト用ロール値
 */
export const testRoles = {
  valid: ["user", "admin"] as const,
  invalid: ["invalid", "guest", "", "USER", "ADMIN"],
};

/**
 * ユーザーデータ配列（複数ユーザーテスト用）
 */
export const userDataArray: TestUserData[] = [
  validUserData,
  adminUserData,
  inactiveUserData,
  otherOrgUserData,
  noNameUserData,
];

/**
 * 同一組織のユーザーデータ配列
 */
export const sameOrgUsersArray: TestUserData[] = [
  validUserData,
  adminUserData,
  inactiveUserData,
  noNameUserData,
];

/**
 * アクティブユーザーのみの配列
 */
export const activeUsersArray: TestUserData[] = [
  validUserData,
  adminUserData,
  otherOrgUserData,
  noNameUserData,
];

/**
 * テストヘルパー関数：ユーザーデータの複製
 */
export const cloneUserData = (
  user: TestUserData,
  overrides?: Partial<TestUserData>,
): TestUserData => {
  return {
    ...user,
    ...overrides,
  };
};

/**
 * テストヘルパー関数：ランダムなユーザーIDの生成
 */
export const generateTestUserId = (): string => {
  return `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * テストヘルパー関数：現在時刻からの相対時刻
 */
export const getRelativeTime = (offsetMs: number): number => {
  return Date.now() + offsetMs;
};
