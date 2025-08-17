"use client";

import { LectureList } from "../../components/lectures/LectureList";

export default function LecturesPage() {
  return (
    <main className="container mx-auto min-h-screen bg-gray-50 p-8 pt-24 dark:bg-gray-900">
      <LectureList />
    </main>
  );
}
