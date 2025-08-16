import { describe, test, expect } from "vitest";
import {
  generateSurveySlug,
  generateSurveyUrl,
  calculateSurveyStatus,
  isClosable,
  isValidStatusTransition,
  extractSuggestionKeywords,
  generateSearchKeywords,
  calculateResponsePeriod,
  formatLectureDateTime,
  getWeekdayName,
} from "./lectureService";

describe("lectureService", () => {
  describe("generateSurveySlug", () => {
    test("一意性の確保テスト - 同じ入力でも異なるスラッグが生成されること", () => {
      const title = "プログラミング基礎";
      const date = "2024-03-15";
      const time = "10:00";

      const slug1 = generateSurveySlug(title, date, time);
      const slug2 = generateSurveySlug(title, date, time);

      expect(slug1).not.toBe(slug2);
      expect(slug1.length).toBeGreaterThan(0);
      expect(slug2.length).toBeGreaterThan(0);
    });

    test("URL安全な文字列生成テスト", () => {
      const title = "プログラミング基礎！@#$%";
      const date = "2024-03-15";
      const time = "10:00";

      const slug = generateSurveySlug(title, date, time);

      // URL安全な文字のみが含まれることを確認
      expect(slug).toMatch(/^[a-z0-9_]+$/);
    });

    test("文字数制限のテスト", () => {
      const longTitle = "非常に長い講義タイトルです".repeat(10);
      const date = "2024-03-15";
      const time = "10:00";

      const slug = generateSurveySlug(longTitle, date, time);

      // スラッグが適切な長さになることを確認
      expect(slug.length).toBeLessThan(100);
    });

    test("特殊文字を含むタイトルが適切に処理されること", () => {
      const title = "Web開発 & データベース設計";
      const date = "2024-03-15";
      const time = "10:00";

      const slug = generateSurveySlug(title, date, time);

      expect(slug).toContain("20240315");
      expect(slug).toContain("1000");
    });
  });

  describe("generateSurveyUrl", () => {
    test("正しいURL形式生成テスト", () => {
      const baseUrl = "https://example.com";
      const slug = "test_slug_123";

      const url = generateSurveyUrl(baseUrl, slug);

      expect(url).toBe("https://example.com/survey/test_slug_123");
    });

    test("末尾スラッシュがある場合の処理テスト", () => {
      const baseUrl = "https://example.com/";
      const slug = "test_slug_123";

      const url = generateSurveyUrl(baseUrl, slug);

      expect(url).toBe("https://example.com/survey/test_slug_123");
    });

    test("slugの組み込み確認テスト", () => {
      const baseUrl = "https://example.com";
      const slug = "programming_20240315_1000_abc123";

      const url = generateSurveyUrl(baseUrl, slug);

      expect(url).toContain(slug);
      expect(url).toContain("/survey/");
    });
  });

  describe("calculateSurveyStatus", () => {
    test("現在時刻が締切前の場合、activeが返されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const closeDate = "2024-12-31";
        const closeTime = "23:59";
        const currentTime = new Date("2024-12-30T12:00:00").getTime();

        const status = calculateSurveyStatus(closeDate, closeTime, currentTime);

        expect(status).toBe("active");
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("現在時刻が締切後の場合、closedが返されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const closeDate = "2024-03-15";
        const closeTime = "12:00";
        const currentTime = new Date("2024-03-15T13:00:00").getTime();

        const status = calculateSurveyStatus(closeDate, closeTime, currentTime);

        expect(status).toBe("closed");
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("現在時刻が締切時刻と同じ場合、closedが返されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const closeDate = "2024-03-15";
        const closeTime = "12:00";
        const currentTime = new Date("2024-03-15T12:00:00").getTime();

        const status = calculateSurveyStatus(closeDate, closeTime, currentTime);

        expect(status).toBe("closed");
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });
  });

  describe("isClosable", () => {
    test("アクティブ状態で締切時刻前の場合、締切可能であること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const currentStatus = "active";
        const closeDate = "2024-12-31";
        const closeTime = "23:59";
        const currentTime = new Date("2024-12-30T12:00:00").getTime();

        const closable = isClosable(
          currentStatus,
          closeDate,
          closeTime,
          currentTime,
        );

        expect(closable).toBe(true);
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("既に締切済みの場合、締切不可であること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const currentStatus = "closed";
        const closeDate = "2024-03-15";
        const closeTime = "12:00";
        const currentTime = new Date("2024-03-15T10:00:00").getTime();

        const closable = isClosable(
          currentStatus,
          closeDate,
          closeTime,
          currentTime,
        );

        expect(closable).toBe(false);
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("締切時刻を過ぎている場合、締切不可であること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const currentStatus = "active";
        const closeDate = "2024-03-15";
        const closeTime = "12:00";
        const currentTime = new Date("2024-03-15T13:00:00").getTime();

        const closable = isClosable(
          currentStatus,
          closeDate,
          closeTime,
          currentTime,
        );

        expect(closable).toBe(false);
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("エッジケース：締切時刻と現在時刻が同じ場合", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const currentStatus = "active";
        const closeDate = "2024-03-15";
        const closeTime = "12:00";
        const currentTime = new Date("2024-03-15T12:00:00").getTime();

        const closable = isClosable(
          currentStatus,
          closeDate,
          closeTime,
          currentTime,
        );

        expect(closable).toBe(true);
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });
  });

  describe("isValidStatusTransition", () => {
    test("同じ状態への遷移は有効であること", () => {
      expect(isValidStatusTransition("active", "active")).toBe(true);
      expect(isValidStatusTransition("closed", "closed")).toBe(true);
    });

    test("active から closed への遷移は有効であること", () => {
      expect(isValidStatusTransition("active", "closed")).toBe(true);
    });

    test("closed から active への遷移は無効であること", () => {
      expect(isValidStatusTransition("closed", "active")).toBe(false);
    });
  });

  describe("extractSuggestionKeywords", () => {
    test("一般的なキーワードが抽出されること", () => {
      const title = "プログラミング基礎入門";
      const keywords = extractSuggestionKeywords(title);

      expect(keywords).toContain("プログラミング");
      expect(keywords).toContain("基礎");
      expect(keywords).toContain("入門");
    });

    test("該当キーワードがない場合、空配列が返されること", () => {
      const title = "特殊なタイトル";
      const keywords = extractSuggestionKeywords(title);

      expect(keywords).toEqual([]);
    });

    test("複数のキーワードが含まれる場合、すべて抽出されること", () => {
      const title = "Web開発実習とデータベース設計演習";
      const keywords = extractSuggestionKeywords(title);

      expect(keywords).toContain("Web");
      expect(keywords).toContain("開発");
      expect(keywords).toContain("実習");
      expect(keywords).toContain("データベース");
      expect(keywords).toContain("設計");
      expect(keywords).toContain("演習");
    });
  });

  describe("generateSearchKeywords", () => {
    test("タイトルからキーワードが生成されること", () => {
      const title = "プログラミング基礎";
      const keywords = generateSearchKeywords(title);

      expect(keywords).toContain("プログラミング");
      expect(keywords).toContain("基礎");
    });

    test("説明も含めてキーワードが生成されること", () => {
      const title = "プログラミング基礎";
      const description = "Web開発の実習を行います";
      const keywords = generateSearchKeywords(title, description);

      expect(keywords).toContain("プログラミング");
      expect(keywords).toContain("基礎");
      expect(keywords).toContain("Web");
      expect(keywords).toContain("開発");
      expect(keywords).toContain("実習");
    });

    test("重複キーワードが除去されること", () => {
      const title = "プログラミング基礎とプログラミング実習";
      const keywords = generateSearchKeywords(title);

      const programmingCount = keywords.filter(
        (k) => k === "プログラミング",
      ).length;
      expect(programmingCount).toBe(1);
    });
  });

  describe("calculateResponsePeriod", () => {
    test("回答期間が正しく計算されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const lectureDate = "2024-03-15";
        const lectureTime = "10:00";
        const closeDate = "2024-03-18";
        const closeTime = "23:59";

        const period = calculateResponsePeriod(
          lectureDate,
          lectureTime,
          closeDate,
          closeTime,
        );

        // JST固定で計算されるため、UTC-9された値になる
        expect(period.startDateTime.toISOString()).toBe(
          "2024-03-15T01:00:00.000Z",
        );
        expect(period.endDateTime.toISOString()).toBe(
          "2024-03-18T14:59:00.000Z",
        );
        expect(period.durationHours).toBeCloseTo(85.98, 1); // 約86時間
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("同日の回答期間が正しく計算されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const lectureDate = "2024-03-15";
        const lectureTime = "10:00";
        const closeDate = "2024-03-15";
        const closeTime = "18:00";

        const period = calculateResponsePeriod(
          lectureDate,
          lectureTime,
          closeDate,
          closeTime,
        );

        expect(period.durationHours).toBe(8);
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });
  });

  describe("formatLectureDateTime", () => {
    test("日本語ロケールで正しくフォーマットされること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const lectureDate = "2024-03-15";
        const lectureTime = "10:30";

        const formatted = formatLectureDateTime(
          lectureDate,
          lectureTime,
          "ja-JP",
        );

        expect(formatted).toBe("2024年3月15日 10:30");
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("デフォルト（日本語）ロケールで正しくフォーマットされること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const lectureDate = "2024-03-15";
        const lectureTime = "09:05";

        const formatted = formatLectureDateTime(lectureDate, lectureTime);

        expect(formatted).toBe("2024年3月15日 09:05");
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });
  });

  describe("getWeekdayName", () => {
    test("日本語ロケールで正しい曜日が返されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        // 2024-03-15は金曜日
        const lectureDate = "2024-03-15";

        const weekday = getWeekdayName(lectureDate, "ja-JP");

        expect(weekday).toBe("金");
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("デフォルト（日本語）ロケールで正しい曜日が返されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        // 2024-03-17は日曜日
        const lectureDate = "2024-03-17";

        const weekday = getWeekdayName(lectureDate);

        expect(weekday).toBe("日");
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });

    test("各曜日が正しく返されること", () => {
      // タイムゾーンをJSTに固定（CI環境対応）
      const originalTZ = process.env.TZ;
      process.env.TZ = "Asia/Tokyo";

      try {
        const dates = [
          { date: "2024-03-17", expected: "日" }, // 日曜日
          { date: "2024-03-18", expected: "月" }, // 月曜日
          { date: "2024-03-19", expected: "火" }, // 火曜日
          { date: "2024-03-20", expected: "水" }, // 水曜日
          { date: "2024-03-21", expected: "木" }, // 木曜日
          { date: "2024-03-22", expected: "金" }, // 金曜日
          { date: "2024-03-23", expected: "土" }, // 土曜日
        ];

        for (const { date, expected } of dates) {
          expect(getWeekdayName(date)).toBe(expected);
        }
      } finally {
        // タイムゾーンを元に戻す
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }
      }
    });
  });
});
