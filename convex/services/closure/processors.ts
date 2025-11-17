/**
 * Closure Processors - Parallel Processing Helpers
 *
 * 並列処理を行うヘルパー関数群
 * エラーハンドリングを含む安全な並列実行
 */

import { Id } from "../../_generated/dataModel";
import { ProcessResult } from "./aggregators";

/**
 * 配列の要素を並列処理する
 * 一部が失敗しても全体の処理を継続
 *
 * @param items 処理対象の配列
 * @param processor 各要素を処理する関数
 * @returns 処理結果の配列
 */
export async function processInParallel<T>(
  items: T[],
  processor: (item: T) => Promise<ProcessResult<Id<"lectures">>>,
): Promise<ProcessResult<Id<"lectures">>[]> {
  const results = await Promise.allSettled(items.map(processor));

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      // rejected の場合、エラー情報を含む失敗結果を返す
      // itemsからidを取得できないため、エラー情報のみ記録
      const errorMessage =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);

      return {
        id: "" as Id<"lectures">, // プレースホルダー
        success: false,
        error: `並列処理エラー[${index}]: ${errorMessage}`,
      };
    }
  });
}
