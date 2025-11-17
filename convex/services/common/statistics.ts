/**
 * Statistics Utilities - Pure Functions
 *
 * 統計計算の基本関数群
 */

/**
 * 平均値を計算
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * パーセンテージを計算（指定小数点以下で四捨五入）
 */
export const calculatePercentage = (
  count: number,
  total: number,
  decimals: number = 2,
): number => {
  if (total === 0) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.round((count / total) * 100 * multiplier) / multiplier;
};

/**
 * 値の出現回数をカウント
 */
export const countOccurrences = <T extends string | number>(
  values: T[],
): Record<string, number> => {
  return values.reduce(
    (acc, value) => {
      const key = String(value);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
};

/**
 * 中央値を計算
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

/**
 * 最頻値を計算
 */
export const calculateMode = (values: number[]): number[] => {
  if (values.length === 0) return [];

  const occurrences = countOccurrences(values);
  const maxCount = Math.max(...Object.values(occurrences));

  return Object.keys(occurrences)
    .filter((key) => occurrences[key] === maxCount)
    .map(Number);
};

/**
 * 標準偏差を計算
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const mean = calculateAverage(values);
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    values.length;

  return Math.sqrt(variance);
};

/**
 * 四分位数を計算
 */
export const calculateQuartiles = (
  values: number[],
): {
  q1: number;
  q2: number;
  q3: number;
} => {
  if (values.length === 0) {
    return { q1: 0, q2: 0, q3: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate quartile positions (use proper quartile calculation)
  const q1Pos = (n + 1) * 0.25;
  const q2Pos = (n + 1) * 0.5;
  const q3Pos = (n + 1) * 0.75;

  // Helper function to interpolate quartile values
  const getQuartileValue = (pos: number): number => {
    const index = Math.floor(pos) - 1;
    const fraction = pos - Math.floor(pos);

    if (index < 0) return sorted[0];
    if (index >= n - 1) return sorted[n - 1];

    if (fraction === 0) {
      return sorted[index];
    } else {
      return sorted[index] + fraction * (sorted[index + 1] - sorted[index]);
    }
  };

  return {
    q1: getQuartileValue(q1Pos),
    q2: getQuartileValue(q2Pos),
    q3: getQuartileValue(q3Pos),
  };
};

/**
 * 範囲（最大値 - 最小値）を計算
 */
export const calculateRange = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
};

/**
 * 相関係数を計算
 */
export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;

  const meanX = calculateAverage(x);
  const meanY = calculateAverage(y);

  const numerator = x.reduce(
    (sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY),
    0,
  );
  const denominatorX = Math.sqrt(
    x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0),
  );
  const denominatorY = Math.sqrt(
    y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0),
  );

  if (denominatorX === 0 || denominatorY === 0) return 0;

  return numerator / (denominatorX * denominatorY);
};

/**
 * 信頼区間を計算
 */
export const calculateConfidenceInterval = (
  values: number[],
  confidenceLevel: number = 0.95,
): { lower: number; upper: number; margin: number } => {
  if (values.length === 0) {
    return { lower: 0, upper: 0, margin: 0 };
  }

  const mean = calculateAverage(values);
  const standardError =
    calculateStandardDeviation(values) / Math.sqrt(values.length);

  // t値の近似（大標本の場合のz値）
  const alpha = 1 - confidenceLevel;
  const zValue = alpha <= 0.05 ? 1.96 : 1.645; // 95%信頼区間: 1.96, 90%信頼区間: 1.645

  const margin = zValue * standardError;

  return {
    lower: mean - margin,
    upper: mean + margin,
    margin: margin,
  };
};
