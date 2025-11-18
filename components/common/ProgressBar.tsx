/**
 * ProgressBar Component
 *
 * 5段階評価の進捗バーを表示するコンポーネント
 */

export interface ProgressBarProps {
  /**
   * ラベル（理解度、満足度など）
   */
  label: string;
  /**
   * 値（1.0-5.0）
   */
  value: number;
  /**
   * バーの色
   * @default "blue"
   */
  color?: "blue" | "green";
}

/**
 * ProgressBar Component
 *
 * @param label - ラベル
 * @param value - 値（1.0-5.0）
 * @param color - バーの色（デフォルト: blue）
 */
export function ProgressBar({
  label,
  value,
  color = "blue",
}: ProgressBarProps) {
  // パーセンテージ計算（5点満点を100%とする）
  const percentage = (value / 5) * 100;

  // 色クラスの決定
  const barColorClass =
    color === "blue"
      ? "bg-blue-500 dark:bg-blue-400"
      : "bg-green-500 dark:bg-green-400";

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-300 ${barColorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
