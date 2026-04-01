import { db } from './db'
import type { LearningLog } from '@/types/learningLog'

export const learningLogRepo = {
  async add(log: LearningLog): Promise<void> {
    await db.learningLogs.add(log)
  },
  async getRecentByUser(userId: string, limit: number): Promise<LearningLog[]> {
    return db.learningLogs
      .where('userId').equals(userId)
      .reverse().sortBy('timestamp')
      .then(logs => logs.slice(0, limit))
  },
  async getRecentTimeSpent(userId: string, count = 20): Promise<number[]> {
    const logs = await learningLogRepo.getRecentByUser(userId, count)
    return logs.map(l => l.timeSpent)
  },
  async getRecentProblemIds(userId: string, count = 10): Promise<string[]> {
    const logs = await learningLogRepo.getRecentByUser(userId, count)
    return logs.map(l => l.problemId)
  },
  async getRecentForUnlockCheck(
    userId: string,
    concept: string,
    limit = 20
  ): Promise<{ isCorrect: boolean }[]> {
    return db.learningLogs
      .where('userId').equals(userId)
      .filter(l => l.concept === concept)
      .reverse().sortBy('timestamp')
      .then(logs => logs.slice(0, limit).map(l => ({ isCorrect: l.isCorrect })))
  },
}
