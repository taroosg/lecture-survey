/**
 * Convex Cron Jobs設定
 * 定期実行されるスケジュールタスクを管理
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * 講義自動締切・分析処理
 * 5分毎に実行し、期限を過ぎた講義を自動的に締切→分析
 */
crons.interval(
  "lecture-auto-closure-and-analysis",
  { minutes: 5 },
  internal.actions.analysis.closeLectureOrchestrator
    .processExpiredLecturesOrchestrator,
);

export default crons;
