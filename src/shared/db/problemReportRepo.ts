import { db } from './db'
import type { ProblemReport, ReportStatus } from '@/types/problemReport'
import { supabase, isSupabaseConfigured, ensureAnonSession } from '../lib/supabase'

export const problemReportRepo = {
  async add(report: ProblemReport): Promise<void> {
    await db.problemReports.add(report)

    if (isSupabaseConfigured() && supabase) {
      const authUid = await ensureAnonSession()
      if (!authUid || authUid !== report.userId) {
        return // 세션 없거나 user_id 불일치 → 로컬만 저장
      }
      try {
        await supabase.from('problem_reports').insert({
          report_id: report.reportId,
          user_id: report.userId,
          problem_id: report.problemId,
          problem_unit: report.problemUnit,
          report_type: report.reportType,
          user_answer: report.userAnswer,
          correct_answer: report.correctAnswer,
          timestamp: new Date(report.timestamp).toISOString(),
          status: report.status,
        })
      } catch (err) {
        console.error('Supabase problem report sync failed:', err)
      }
    }
  },

  async getPending(): Promise<ProblemReport[]> {
    return db.problemReports
      .where('status').equals('pending')
      .toArray()
      .then(rows => rows.sort((a, b) => b.timestamp - a.timestamp))
  },

  async updateStatus(reportId: string, status: ReportStatus): Promise<void> {
    await db.problemReports.update(reportId, { status })
  },

  async getAll(): Promise<ProblemReport[]> {
    return db.problemReports
      .toArray()
      .then(rows => rows.sort((a, b) => b.timestamp - a.timestamp))
  },
}
