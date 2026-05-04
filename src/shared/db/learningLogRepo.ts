import { db } from './db'
import type { LearningLog } from '@/types/learningLog'
import { supabase, isSupabaseConfigured, ensureAnonSession } from '../lib/supabase'

export const learningLogRepo = {
  async add(log: LearningLog): Promise<void> {
    await db.learningLogs.add(log)

    // Cloud Sync (Safe Guard) — RLS: auth.uid() = user_id
    if (isSupabaseConfigured() && supabase) {
      const authUid = await ensureAnonSession()
      if (!authUid || authUid !== log.userId) {
        return // 세션 없거나 user_id 불일치 → 로컬만 저장
      }
      try {
        await supabase.from('learning_logs').insert({
          user_id: log.userId,
          problem_id: log.problemId,
          concept: log.concept,
          difficulty: log.difficulty,
          is_correct: log.isCorrect,
          time_spent: log.timeSpent,
          hint_used: log.hintUsed,
          timestamp: new Date(log.timestamp).toISOString()
        })
      } catch (err) {
        console.error('Supabase log sync failed:', err)
      }
    }
  },
  async getRecentByUser(userId: string, limit: number): Promise<LearningLog[]> {
    const logs = await db.learningLogs
      .where('userId').equals(userId)
      .toArray()
    return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  },
  async getRecentTimeSpent(userId: string, count = 20): Promise<number[]> {
    const logs = await learningLogRepo.getRecentByUser(userId, count)
    return logs.map(l => l.timeSpent)
  },
  async getRecentProblemIds(userId: string, count = 10): Promise<string[]> {
    const logs = await learningLogRepo.getRecentByUser(userId, count)
    return logs.map(l => l.problemId)
  },
  async getRecentConcepts(userId: string, count = 10): Promise<string[]> {
    const logs = await learningLogRepo.getRecentByUser(userId, count)
    return logs.map(l => l.concept)
  },
  async getRecentForUnlockCheck(
    userId: string,
    concept: string,
    limit = 20
  ): Promise<{ isCorrect: boolean }[]> {
    const logs = await db.learningLogs
      .where('userId').equals(userId)
      .filter(l => l.concept === concept)
      .toArray()
    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(l => ({ isCorrect: l.isCorrect }))
  },
}
