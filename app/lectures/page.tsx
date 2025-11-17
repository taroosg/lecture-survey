"use client";

import { LectureList } from "../../components/lectures/LectureList";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { usePathname } from "next/navigation";
import { useBreadcrumbForPath } from "../../lib/breadcrumb";

export default function LecturesPage() {
  const pathname = usePathname();
  const breadcrumbItems = useBreadcrumbForPath(pathname);

  return (
    <main className="p-8 flex flex-col gap-8">
      <div className="max-w-4xl mx-auto w-full">
        <Breadcrumb items={breadcrumbItems} />
        <h2 className="text-3xl font-bold text-center mb-8">講義一覧</h2>
        <LectureList />
      </div>
    </main>
  );
}
