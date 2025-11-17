/**
 * General Utilities - Pure Functions
 *
 * 汎用ユーティリティ関数群
 */

/**
 * 配列を指定キーでグループ化
 */
export const groupBy = <T, K extends string | number>(
  array: T[],
  keySelector: (item: T) => K,
): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const key = String(keySelector(item));
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

/**
 * 配列の重複を除去
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * 配列を平坦化
 */
export const flatten = <T>(arrays: T[][]): T[] => {
  return arrays.reduce((flat, arr) => flat.concat(arr), []);
};

/**
 * オブジェクトから指定キーの値を安全に取得
 */
export const safeGet = <T, K extends keyof T, D>(
  obj: T,
  key: K,
  defaultValue: D,
): NonNullable<T[K]> | D => {
  const value = obj[key];
  return value !== undefined && value !== null
    ? (value as NonNullable<T[K]>)
    : defaultValue;
};
