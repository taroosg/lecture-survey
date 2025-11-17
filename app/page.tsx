import DashboardCard from "../components/dashboard/DashboardCard";

export default function Home() {
  return (
    <main className="p-8 flex flex-col gap-8">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-8">ダッシュボード</h2>
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
  );
}
