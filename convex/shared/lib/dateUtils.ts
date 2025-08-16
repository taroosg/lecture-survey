/**
 * 日時ユーティリティ関数
 * ユーザー入力の日時は日本時間（JST）として扱う
 */

/**
 * 日本時間のタイムゾーン（UTC+9）
 */
const JST_OFFSET_HOURS = 9;

/**
 * 日本時間での現在時刻をUTCタイムスタンプで取得
 * @returns {number} UTCタイムスタンプ（ミリ秒）
 */
export function getCurrentJSTTimestamp(): number {
  return Date.now();
}

/**
 * 日本時間での現在の日付文字列を取得
 * @returns {string} YYYY-MM-DD形式の日付文字列
 */
export function getCurrentJSTDateString(): string {
  const now = new Date();
  // UTCから日本時間に変換
  const jstTime = new Date(now.getTime() + JST_OFFSET_HOURS * 60 * 60 * 1000);
  return jstTime.toISOString().split("T")[0];
}

/**
 * 日本時間での現在の時刻文字列を取得
 * @returns {string} HH:MM形式の時刻文字列
 */
export function getCurrentJSTTimeString(): string {
  const now = new Date();
  // UTCから日本時間に変換
  const jstTime = new Date(now.getTime() + JST_OFFSET_HOURS * 60 * 60 * 1000);
  const hours = jstTime.getUTCHours().toString().padStart(2, "0");
  const minutes = jstTime.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * 日本時間の日付・時刻文字列をUTCタイムスタンプに変換
 * @param {string} dateStr YYYY-MM-DD形式の日付文字列
 * @param {string} timeStr HH:MM形式の時刻文字列
 * @returns {number} UTCタイムスタンプ（ミリ秒）
 * @throws {Error} 無効な日付・時刻形式の場合
 */
export function convertJSTToUTCTimestamp(
  dateStr: string,
  timeStr: string,
): number {
  // 日付形式の検証
  if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error(
      `無効な日付形式です: ${dateStr}. YYYY-MM-DD形式で入力してください。`,
    );
  }

  // 時刻形式の検証
  if (!timeStr.match(/^\d{2}:\d{2}$/)) {
    throw new Error(
      `無効な時刻形式です: ${timeStr}. HH:MM形式で入力してください。`,
    );
  }

  // 日本時間での日時を作成
  const jstDateTimeStr = `${dateStr}T${timeStr}:00+09:00`;
  const jstDate = new Date(jstDateTimeStr);

  if (isNaN(jstDate.getTime())) {
    throw new Error(`無効な日時です: ${dateStr} ${timeStr}`);
  }

  return jstDate.getTime();
}

/**
 * UTCタイムスタンプを日本時間の日付・時刻文字列に変換
 * @param {number} timestamp UTCタイムスタンプ（ミリ秒）
 * @returns {object} {dateStr: YYYY-MM-DD, timeStr: HH:MM}
 */
export function convertUTCTimestampToJST(timestamp: number): {
  dateStr: string;
  timeStr: string;
} {
  const date = new Date(timestamp);
  // UTCから日本時間に変換
  const jstTime = new Date(date.getTime() + JST_OFFSET_HOURS * 60 * 60 * 1000);

  const dateStr = jstTime.toISOString().split("T")[0];
  const hours = jstTime.getUTCHours().toString().padStart(2, "0");
  const minutes = jstTime.getUTCMinutes().toString().padStart(2, "0");
  const timeStr = `${hours}:${minutes}`;

  return { dateStr, timeStr };
}

/**
 * 指定した日本時間が現在時刻を過ぎているかチェック
 * @param {string} dateStr YYYY-MM-DD形式の日付文字列
 * @param {string} timeStr HH:MM形式の時刻文字列
 * @returns {boolean} 現在時刻を過ぎている場合true
 */
export function isJSTDateTimePast(dateStr: string, timeStr: string): boolean {
  try {
    const targetTimestamp = convertJSTToUTCTimestamp(dateStr, timeStr);
    const currentTimestamp = getCurrentJSTTimestamp();
    return targetTimestamp < currentTimestamp;
  } catch (error) {
    // 日時変換に失敗した場合は過去として扱わない（安全側に倒す）
    return false;
  }
}

/**
 * 指定した日本時間が現在時刻を過ぎているか、また何分過ぎているかを取得
 * @param {string} dateStr YYYY-MM-DD形式の日付文字列
 * @param {string} timeStr HH:MM形式の時刻文字列
 * @returns {object} {isPast: boolean, minutesPast: number}
 */
export function getJSTDateTimeDifference(
  dateStr: string,
  timeStr: string,
): {
  isPast: boolean;
  minutesPast: number;
} {
  try {
    const targetTimestamp = convertJSTToUTCTimestamp(dateStr, timeStr);
    const currentTimestamp = getCurrentJSTTimestamp();
    const differenceMs = currentTimestamp - targetTimestamp;
    const minutesPast = Math.floor(differenceMs / (1000 * 60));

    return {
      isPast: differenceMs > 0,
      minutesPast: minutesPast,
    };
  } catch (error) {
    return {
      isPast: false,
      minutesPast: 0,
    };
  }
}

/**
 * デバッグ用：日本時間の情報を表示
 * @param {string} dateStr YYYY-MM-DD形式の日付文字列
 * @param {string} timeStr HH:MM形式の時刻文字列
 * @returns {string} デバッグ情報
 */
export function debugJSTDateTime(dateStr: string, timeStr: string): string {
  try {
    const targetTimestamp = convertJSTToUTCTimestamp(dateStr, timeStr);
    const currentTimestamp = getCurrentJSTTimestamp();
    const { isPast, minutesPast } = getJSTDateTimeDifference(dateStr, timeStr);

    return `
Target JST: ${dateStr} ${timeStr}
Target UTC timestamp: ${targetTimestamp}
Current UTC timestamp: ${currentTimestamp}
Is past: ${isPast}
Minutes difference: ${minutesPast}
    `.trim();
  } catch (error) {
    return `Error: ${error}`;
  }
}
