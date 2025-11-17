import Link from "next/link";

export interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

/**
 * ダッシュボードカードコンポーネント
 * ダッシュボードの各機能へのリンクを表示
 */
export default function DashboardCard({
  title,
  description,
  href,
  icon,
}: DashboardCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
        <div className="flex flex-col gap-4">
          <div className="text-4xl" role="img" aria-label={title}>
            {icon}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
