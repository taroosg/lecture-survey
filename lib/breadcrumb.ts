import type { BreadcrumbItem } from "@/components/common/Breadcrumb";

/**
 * 静的パンくず設定の型定義
 */
export interface StaticBreadcrumbConfig {
  type: "static";
  items: BreadcrumbItem[];
}

/**
 * 動的パンくず設定の型定義
 */
export interface DynamicBreadcrumbConfig {
  type: "dynamic";
  items: (BreadcrumbItem | DynamicBreadcrumbItem)[];
}

/**
 * 動的パンくず項目の型定義
 */
export interface DynamicBreadcrumbItem {
  label: (data: Record<string, unknown>) => string;
  href?: (data: Record<string, unknown>) => string;
  current?: boolean;
}

/**
 * パンくず設定の統合型
 */
export type BreadcrumbConfig = StaticBreadcrumbConfig | DynamicBreadcrumbConfig;

/**
 * ルート別パンくず設定マッピング
 */
export const breadcrumbConfigs: Record<string, BreadcrumbConfig> = {
  // 講義管理系
  "/lectures": {
    type: "static",
    items: [
      { label: "ホーム", href: "/" },
      { label: "講義一覧", current: true },
    ],
  },

  "/lectures/create": {
    type: "static",
    items: [
      { label: "ホーム", href: "/" },
      { label: "講義一覧", href: "/lectures" },
      { label: "新規作成", current: true },
    ],
  },

  "/lectures/[id]": {
    type: "dynamic",
    items: [
      { label: "ホーム", href: "/" },
      { label: "講義一覧", href: "/lectures" },
      {
        label: (data: Record<string, unknown>) =>
          (data.lectureTitle as string) || "講義詳細",
        current: true,
      },
    ],
  },

  "/lectures/[id]/edit": {
    type: "dynamic",
    items: [
      { label: "ホーム", href: "/" },
      { label: "講義一覧", href: "/lectures" },
      {
        label: (data: Record<string, unknown>) =>
          (data.lectureTitle as string) || "講義詳細",
        href: (data: Record<string, unknown>) =>
          `/lectures/${data.lectureId as string}`,
      },
      { label: "編集", current: true },
    ],
  },

  "/lectures/[id]/responses": {
    type: "dynamic",
    items: [
      { label: "ホーム", href: "/" },
      { label: "講義一覧", href: "/lectures" },
      {
        label: (data: Record<string, unknown>) =>
          (data.lectureTitle as string) || "講義詳細",
        href: (data: Record<string, unknown>) =>
          `/lectures/${data.lectureId as string}`,
      },
      { label: "回答データ", current: true },
    ],
  },
};

/**
 * 静的パンくずアイテムを生成
 * @param config 静的パンくず設定
 * @returns パンくずアイテム配列
 */
function generateStaticBreadcrumb(
  config: StaticBreadcrumbConfig,
): BreadcrumbItem[] {
  return config.items;
}

/**
 * 動的パンくずアイテムを生成
 * @param config 動的パンくず設定
 * @param data 動的データ
 * @returns パンくずアイテム配列
 */
function generateDynamicBreadcrumb(
  config: DynamicBreadcrumbConfig,
  data: Record<string, unknown>,
): BreadcrumbItem[] {
  return config.items.map((item): BreadcrumbItem => {
    if ("label" in item && typeof item.label === "function") {
      // 動的アイテム
      const dynamicItem = item as DynamicBreadcrumbItem;
      return {
        label: dynamicItem.label(data),
        href: dynamicItem.href ? dynamicItem.href(data) : undefined,
        current: dynamicItem.current,
      };
    } else {
      // 静的アイテム
      return item as BreadcrumbItem;
    }
  });
}

/**
 * ルートパスに基づいてパンくずアイテムを生成
 * @param routePath ルートパス（例: "/lectures/[id]/edit"）
 * @param data 動的データ（動的ルートの場合）
 * @returns パンくずアイテム配列
 */
export function generateBreadcrumbItems(
  routePath: string,
  data?: Record<string, unknown>,
): BreadcrumbItem[] {
  const config = breadcrumbConfigs[routePath];

  if (!config) {
    // 設定が見つからない場合は空配列を返す（パンくずリストを表示しない）
    return [];
  }

  if (config.type === "static") {
    return generateStaticBreadcrumb(config);
  } else {
    return generateDynamicBreadcrumb(config, data || {});
  }
}

/**
 * Next.jsのパス名を正規化してルートパスに変換
 * @param pathname Next.jsのパス名（例: "/lectures/123/edit"）
 * @returns 正規化されたルートパス（例: "/lectures/[id]/edit"）
 */
export function normalizePathname(pathname: string): string {
  // 動的ルートのパターンマッチング
  const patterns: Array<{ pattern: RegExp; route: string }> = [
    { pattern: /^\/lectures\/[^/]+\/edit$/, route: "/lectures/[id]/edit" },
    {
      pattern: /^\/lectures\/[^/]+\/responses$/,
      route: "/lectures/[id]/responses",
    },
    { pattern: /^\/lectures\/(?!create)[^/]+$/, route: "/lectures/[id]" },
  ];

  for (const { pattern, route } of patterns) {
    if (pattern.test(pathname)) {
      return route;
    }
  }

  // 静的ルートはそのまま返す
  return pathname;
}

/**
 * パス名から動的パラメータを抽出
 * @param pathname Next.jsのパス名（例: "/lectures/123/edit"）
 * @param routePath 正規化されたルートパス（例: "/lectures/[id]/edit"）
 * @returns 動的パラメータのオブジェクト
 */
export function extractDynamicParams(
  pathname: string,
  routePath: string,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (routePath && routePath.includes("[id]")) {
    // 講義ID抽出のパターン
    const lectureIdMatch = pathname.match(/^\/lectures\/([^/]+)/);
    if (lectureIdMatch) {
      params.lectureId = lectureIdMatch[1];
    }
  }

  return params;
}

/**
 * ブラウザのURL変更を監視してパンくずを自動更新するためのヘルパー
 * @param pathname 現在のパス名
 * @param dynamicData 動的データ
 * @returns パンくずアイテム配列
 */
export function useBreadcrumbForPath(
  pathname: string,
  dynamicData?: Record<string, unknown>,
): BreadcrumbItem[] {
  const routePath = normalizePathname(pathname);
  const params = extractDynamicParams(pathname, routePath);
  const combinedData = { ...params, ...dynamicData };

  return generateBreadcrumbItems(routePath, combinedData);
}
