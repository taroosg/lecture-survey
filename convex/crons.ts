/**
 * Convex Cron Jobs設定
 * 定期実行されるスケジュールタスクを管理
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// cronJobs()を呼び出してCronsインスタンスを作成
const crons = cronJobs();

/**
 * 講義自動締切処理
 * 5分毎に実行し、期限を過ぎた講義を自動的に締切
 */
crons.interval(
  "lecture-auto-closure",
  { minutes: 5 },
  internal.actions.analysis.closeLectureOrchestrator
    .processExpiredLecturesOrchestrator,
);

export default crons;
