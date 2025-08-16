import { vi } from "vitest";
import { Id } from "../../../_generated/dataModel";

/**
 * モックデータベースの作成
 */
export const createMockDatabase = () => {
  const mockQuery = {
    withIndex: vi.fn().mockReturnThis(),
    unique: vi.fn(),
    collect: vi.fn(),
  };

  const mockDb = {
    query: vi.fn().mockReturnValue(mockQuery),
    get: vi.fn(),
    insert: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  return { mockDb, mockQuery };
};

/**
 * モックコンテキストの作成
 */
export const createMockContext = () => {
  const { mockDb } = createMockDatabase();

  return {
    db: mockDb,
    auth: {
      getUserId: vi.fn(),
    },
  };
};

/**
 * バリデーション結果のモック
 */
export const createValidationResult = (
  isValid: boolean,
  errors: string[] = [],
) => ({
  isValid,
  errors,
});

/**
 * 成功時のバリデーション結果
 */
export const VALID_RESULT = createValidationResult(true);

/**
 * 失敗時のバリデーション結果
 */
export const INVALID_RESULT = createValidationResult(false, [
  "バリデーションエラー",
]);

/**
 * ページネーション用のモックデータ
 */
export const createPaginatedResponse = <T>(
  data: T[],
  page: number = 1,
  perPage: number = 10,
) => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      perPage,
      total: data.length,
      totalPages: Math.ceil(data.length / perPage),
      hasNext: endIndex < data.length,
      hasPrev: page > 1,
    },
  };
};

/**
 * APIレスポンス用のモック
 */
export const createApiResponse = <T>(
  data: T,
  success: boolean = true,
  message?: string,
) => ({
  success,
  data,
  message,
  timestamp: Date.now(),
});

/**
 * エラーレスポンス用のモック
 */
export const createErrorResponse = (message: string, code?: string) => ({
  success: false,
  error: {
    message,
    code,
    timestamp: Date.now(),
  },
});

/**
 * 非同期処理のモック（遅延付き）
 */
export const createAsyncMock = <T>(data: T, delay: number = 0) => {
  return vi.fn().mockImplementation(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return data;
  });
};

/**
 * ランダムエラーを発生させるモック
 */
export const createRandomErrorMock = <T>(data: T, errorRate: number = 0.1) => {
  return vi.fn().mockImplementation(async () => {
    if (Math.random() < errorRate) {
      throw new Error("ランダムエラー");
    }
    return data;
  });
};

/**
 * データベース操作のモック設定
 */
export const setupDatabaseMocks = (data: any) => {
  const { mockDb, mockQuery } = createMockDatabase();

  // 基本的なモック設定
  mockQuery.unique.mockResolvedValue(data.single || null);
  mockQuery.collect.mockResolvedValue(data.multiple || []);
  mockDb.get.mockResolvedValue(data.single || null);
  mockDb.insert.mockResolvedValue(data.insertId || "new_id");
  mockDb.patch.mockResolvedValue(undefined);
  mockDb.delete.mockResolvedValue(undefined);

  return { mockDb, mockQuery };
};

/**
 * 認証モックの設定
 */
export const setupAuthMocks = (userId?: Id<"users"> | null) => {
  const mockGetAuthUserId = vi.fn();

  if (userId === undefined) {
    // デフォルトで認証済みとする
    mockGetAuthUserId.mockResolvedValue("test_user_123" as Id<"users">);
  } else {
    mockGetAuthUserId.mockResolvedValue(userId);
  }

  return mockGetAuthUserId;
};

/**
 * サービス層のモック設定
 */
export const setupServiceMocks = () => {
  return {
    validateLectureData: vi.fn().mockReturnValue(VALID_RESULT),
    validateLectureUpdate: vi.fn().mockReturnValue(VALID_RESULT),
    generateSurveySlug: vi.fn().mockReturnValue("test_slug_123"),
    generateSurveyUrl: vi
      .fn()
      .mockReturnValue("https://example.com/survey/test_slug_123"),
    calculateSurveyStatus: vi.fn().mockReturnValue("active"),
    isClosable: vi.fn().mockReturnValue(true),
    isValidStatusTransition: vi.fn().mockReturnValue(true),
  };
};

/**
 * リポジトリ層のモック設定
 */
export const setupRepositoryMocks = (data: any) => {
  return {
    createLecture: vi.fn().mockResolvedValue(data.lecture),
    updateLecture: vi.fn().mockResolvedValue(data.lecture),
    deleteLecture: vi.fn().mockResolvedValue(undefined),
    getLectureById: vi.fn().mockResolvedValue(data.lecture),
    getLectureBySlug: vi.fn().mockResolvedValue(data.lecture),
    getLecturesByUser: vi.fn().mockResolvedValue(data.lectures || []),
    getLectureStats: vi.fn().mockResolvedValue(data.stats || {}),
  };
};

/**
 * テスト用のタイムスタンプ
 */
export const TEST_TIMESTAMPS = {
  // 2024-01-01 00:00:00 UTC
  PAST: 1704067200000,

  // 2024-06-15 12:00:00 UTC (現在時刻として使用)
  CURRENT: 1718452800000,

  // 2024-12-31 23:59:59 UTC
  FUTURE: 1735689599000,
} as const;

/**
 * テスト環境の設定
 */
export const setupTestEnvironment = () => {
  // 固定時刻を設定
  vi.setSystemTime(new Date(TEST_TIMESTAMPS.CURRENT));

  // 環境変数のモック
  process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

  return {
    cleanup: () => {
      vi.useRealTimers();
      delete process.env.NEXT_PUBLIC_APP_URL;
    },
  };
};

/**
 * テストケース実行のヘルパー
 */
export const runTestCase = async <T>(
  testFn: () => Promise<T>,
  setup?: () => void,
  cleanup?: () => void,
): Promise<T> => {
  try {
    setup?.();
    return await testFn();
  } finally {
    cleanup?.();
  }
};

/**
 * 並列テスト実行のヘルパー
 */
export const runParallelTests = async <T>(
  testCases: Array<() => Promise<T>>,
): Promise<T[]> => {
  return Promise.all(testCases.map((testCase) => testCase()));
};

/**
 * テストデータの生成器
 */
export const generateTestData = {
  /**
   * 複数の講義データを生成
   */
  lectures: (count: number, baseData: any = {}) => {
    return Array.from({ length: count }, (_, index) => ({
      _id: `lecture_${index}` as Id<"lectures">,
      title: `講義 ${index + 1}`,
      lectureDate: `2024-0${Math.floor(index / 28) + 1}-${String((index % 28) + 1).padStart(2, "0")}`,
      lectureTime: `${String(9 + (index % 8)).padStart(2, "0")}:00`,
      ...baseData,
    }));
  },

  /**
   * 複数のユーザーデータを生成
   */
  users: (count: number, baseData: any = {}) => {
    return Array.from({ length: count }, (_, index) => ({
      _id: `user_${index}` as Id<"users">,
      email: `user${index}@example.com`,
      name: `ユーザー ${index + 1}`,
      organizationName: `組織 ${Math.floor(index / 5) + 1}`,
      ...baseData,
    }));
  },

  /**
   * 時系列データを生成
   */
  timeSeriesData: (count: number, startTime: number, interval: number) => {
    return Array.from({ length: count }, (_, index) => ({
      timestamp: startTime + index * interval,
      value: Math.random() * 100,
    }));
  },
};

/**
 * パフォーマンステスト用のヘルパー
 */
export const performanceTest = {
  /**
   * 実行時間を測定
   */
  measureTime: async <T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * メモリ使用量を測定（Node.js環境）
   */
  measureMemory: <T>(
    fn: () => T,
  ): { result: T; memoryUsage: NodeJS.MemoryUsage } => {
    const start = process.memoryUsage();
    const result = fn();
    const end = process.memoryUsage();

    return {
      result,
      memoryUsage: {
        rss: end.rss - start.rss,
        heapTotal: end.heapTotal - start.heapTotal,
        heapUsed: end.heapUsed - start.heapUsed,
        external: end.external - start.external,
        arrayBuffers: end.arrayBuffers - start.arrayBuffers,
      },
    };
  },
};
