/**
 * ランダムなslug文字列を生成するユーティリティ関数
 */

/**
 * ランダムなアンケートslugを生成
 * ConvexのIDと同様の形式でランダムな文字列を生成します
 * @returns ランダムなslug文字列（例: "jd7abc123def456"）
 */
export function generateRandomSlug(): string {
  // ConvexのIDと同様の文字セット（英数字）
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  // 16文字のランダム文字列を生成（ConvexのIDと同程度の長さ）
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
