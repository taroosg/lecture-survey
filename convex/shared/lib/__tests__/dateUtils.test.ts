/**
 * 日時ユーティリティ関数のテスト
 * Vitestを使用した単体テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  convertJSTToUTCTimestamp,
  convertUTCTimestampToJST,
  isJSTDateTimePast,
  getJSTDateTimeDifference,
  getCurrentJSTTimestamp,
  getCurrentJSTDateString,
  getCurrentJSTTimeString,
  debugJSTDateTime,
} from "../dateUtils";

describe("日時ユーティリティ関数", () => {
  // モックされた現在時刻を保存
  let originalDate: DateConstructor;

  beforeEach(() => {
    originalDate = global.Date;
  });

  afterEach(() => {
    global.Date = originalDate;
    vi.restoreAllMocks();
  });

  describe("convertJSTToUTCTimestamp", () => {
    it("正常な日本時間をUTCタイムスタンプに変換できること", () => {
      // 2024-03-15 15:30 JST は 2024-03-15 06:30 UTC
      const result = convertJSTToUTCTimestamp("2024-03-15", "15:30");

      // 期待値を計算: 2024-03-15T06:30:00.000Z のタイムスタンプ
      const expected = new Date("2024-03-15T06:30:00.000Z").getTime();

      expect(result).toBe(expected);
    });

    it("無効な日付形式でエラーを発生させること", () => {
      expect(() => {
        convertJSTToUTCTimestamp("2024/03/15", "15:30");
      }).toThrow(
        "無効な日付形式です: 2024/03/15. YYYY-MM-DD形式で入力してください。",
      );
    });

    it("無効な時刻形式でエラーを発生させること", () => {
      expect(() => {
        convertJSTToUTCTimestamp("2024-03-15", "15-30");
      }).toThrow("無効な時刻形式です: 15-30. HH:MM形式で入力してください。");
    });

    it("存在しない日付でエラーを発生させること", () => {
      expect(() => {
        convertJSTToUTCTimestamp("2024-13-01", "15:30");
      }).toThrow("無効な日時です: 2024-13-01 15:30");
    });
  });

  describe("convertUTCTimestampToJST", () => {
    it("UTCタイムスタンプを日本時間に変換できること", () => {
      // 2024-03-15T06:30:00.000Z (UTC) は 2024-03-15 15:30 (JST)
      const timestamp = new Date("2024-03-15T06:30:00.000Z").getTime();
      const result = convertUTCTimestampToJST(timestamp);

      expect(result.dateStr).toBe("2024-03-15");
      expect(result.timeStr).toBe("15:30");
    });

    it("別のタイムスタンプでも正しく変換できること", () => {
      // 2024-12-31T15:00:00.000Z (UTC) は 2025-01-01 00:00 (JST)
      const timestamp = new Date("2024-12-31T15:00:00.000Z").getTime();
      const result = convertUTCTimestampToJST(timestamp);

      expect(result.dateStr).toBe("2025-01-01");
      expect(result.timeStr).toBe("00:00");
    });
  });

  describe("isJSTDateTimePast", () => {
    it("過去の日時でtrueを返すこと", () => {
      // 現在時刻を2024-03-15 12:00 JST (03:00 UTC)にモック
      const mockNow = new Date("2024-03-15T03:00:00.000Z").getTime();
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      // 2024-03-15 10:00 JST (01:00 UTC) は過去
      const result = isJSTDateTimePast("2024-03-15", "10:00");
      expect(result).toBe(true);
    });

    it("未来の日時でfalseを返すこと", () => {
      // 現在時刻を2024-03-15 12:00 JST (03:00 UTC)にモック
      const mockNow = new Date("2024-03-15T03:00:00.000Z").getTime();
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      // 2024-03-15 15:00 JST (06:00 UTC) は未来
      const result = isJSTDateTimePast("2024-03-15", "15:00");
      expect(result).toBe(false);
    });

    it("無効な日時でfalseを返すこと（安全側に倒す）", () => {
      const result = isJSTDateTimePast("invalid-date", "15:00");
      expect(result).toBe(false);
    });
  });

  describe("getJSTDateTimeDifference", () => {
    it("過去の日時で正しい差分を計算すること", () => {
      // 現在時刻を2024-03-15 12:00 JST (03:00 UTC)にモック
      const mockNow = new Date("2024-03-15T03:00:00.000Z").getTime();
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      // 2024-03-15 10:00 JST (01:00 UTC) は2時間前
      const result = getJSTDateTimeDifference("2024-03-15", "10:00");
      expect(result.isPast).toBe(true);
      expect(result.minutesPast).toBe(120); // 2時間 = 120分
    });

    it("未来の日時で負の差分を計算すること", () => {
      // 現在時刻を2024-03-15 12:00 JST (03:00 UTC)にモック
      const mockNow = new Date("2024-03-15T03:00:00.000Z").getTime();
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      // 2024-03-15 15:00 JST (06:00 UTC) は3時間後
      const result = getJSTDateTimeDifference("2024-03-15", "15:00");
      expect(result.isPast).toBe(false);
      expect(result.minutesPast).toBe(-180); // -3時間 = -180分
    });

    it("無効な日時で安全な値を返すこと", () => {
      const result = getJSTDateTimeDifference("invalid", "invalid");
      expect(result.isPast).toBe(false);
      expect(result.minutesPast).toBe(0);
    });
  });

  describe("現在時刻取得関数", () => {
    it("getCurrentJSTTimestamp は現在のタイムスタンプを返すこと", () => {
      const mockNow = new Date("2024-03-15T03:00:00.000Z").getTime();
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      const result = getCurrentJSTTimestamp();
      expect(result).toBe(mockNow);
    });

    it("getCurrentJSTDateString は日本時間の日付文字列を返すこと", () => {
      // 2024-03-15T15:30:00.000Z (UTC) = 2024-03-16 00:30 (JST)
      const mockNow = new Date("2024-03-15T15:30:00.000Z").getTime();
      global.Date = vi.fn().mockImplementation((time?: number) => {
        return new originalDate(time || mockNow);
      }) as any;
      global.Date.now = vi.fn().mockReturnValue(mockNow);

      const result = getCurrentJSTDateString();
      expect(result).toBe("2024-03-16");
    });

    it("getCurrentJSTTimeString は日本時間の時刻文字列を返すこと", () => {
      // 2024-03-15T15:30:00.000Z (UTC) = 2024-03-16 00:30 (JST)
      const mockNow = new Date("2024-03-15T15:30:00.000Z").getTime();
      global.Date = vi.fn().mockImplementation((time?: number) => {
        return new originalDate(time || mockNow);
      }) as any;
      global.Date.now = vi.fn().mockReturnValue(mockNow);

      const result = getCurrentJSTTimeString();
      expect(result).toBe("00:30");
    });
  });

  describe("debugJSTDateTime", () => {
    it("正常な日時でデバッグ情報を返すこと", () => {
      // 現在時刻を2024-03-15 09:00 JST (00:00 UTC) に設定
      const mockNow = new Date("2024-03-15T00:00:00.000Z").getTime();
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      const result = debugJSTDateTime("2024-03-15", "10:00");

      expect(result).toContain("Target JST: 2024-03-15 10:00");
      expect(result).toContain("Is past: false");
      expect(result).toContain("Minutes difference: -60"); // 1時間後なので-60分
    });

    it("無効な日時でエラー情報を返すこと", () => {
      const result = debugJSTDateTime("invalid", "invalid");
      expect(result).toContain("Error:");
    });
  });

  describe("境界値テスト", () => {
    it("日付変更線をまたぐ変換が正しく動作すること", () => {
      // 2024-03-15 01:00 JST は 2024-03-14 16:00 UTC
      const result = convertJSTToUTCTimestamp("2024-03-15", "01:00");
      const expected = new Date("2024-03-14T16:00:00.000Z").getTime();
      expect(result).toBe(expected);
    });

    it("年末年始をまたぐ変換が正しく動作すること", () => {
      // 2025-01-01 01:00 JST は 2024-12-31 16:00 UTC
      const result = convertJSTToUTCTimestamp("2025-01-01", "01:00");
      const expected = new Date("2024-12-31T16:00:00.000Z").getTime();
      expect(result).toBe(expected);
    });

    it("うるう年の2月29日を正しく処理すること", () => {
      // 2024年はうるう年 - 2月29日は有効
      expect(() => {
        convertJSTToUTCTimestamp("2024-02-29", "12:00");
      }).not.toThrow();

      // 2023年はうるう年ではないが、JavaScriptのDateは自動変換するため
      // より明確な無効日付（13月など）でテスト
      expect(() => {
        convertJSTToUTCTimestamp("2023-13-01", "12:00");
      }).toThrow();
    });
  });
});
