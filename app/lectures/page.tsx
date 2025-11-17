"use client";

import { LectureList } from "../../components/lectures/LectureList";

export default function LecturesPage() {
  return (
    <main className="p-8 flex flex-col gap-8">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-8">講義一覧</h2>
        <LectureList />
      </div>
    </main>
  );
}
