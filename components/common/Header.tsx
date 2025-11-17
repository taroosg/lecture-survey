"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * 共通ヘッダーコンポーネント
 * 全画面で表示されるヘッダー
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
      <Link href="/">
        <h1 className="text-lg font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          講義アンケートシステム
        </h1>
      </Link>
      <SignOutButton />
    </header>
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
