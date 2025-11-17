"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import DashboardCard from "../components/dashboard/DashboardCard";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        <h1 className="text-lg font-bold">講義アンケートシステム</h1>
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-8">
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-center mb-8">
            ダッシュボード
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard
              title="講義作成"
              description="新しい講義とアンケートを作成します"
              href="/lectures/create"
              icon="📝"
            />
            <DashboardCard
              title="講義一覧"
              description="登録済み講義の確認・管理を行います"
              href="/lectures"
              icon="📊"
            />
          </div>
        </div>
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-4 py-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          onClick={() =>
            void signOut().then(() => {
              router.push("/signin");
            })
          }
        >
          サインアウト
        </button>
      )}
    </>
  );
}
