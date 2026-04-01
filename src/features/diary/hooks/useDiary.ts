import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/db/db'
import type { LearningLog } from '@/types/learningLog'

interface DiaryDay {
  date: string
  logs: LearningLog[]
  totalProblems: number
  correctCount: number
  stars: number
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function groupByDate(logs: LearningLog[]): DiaryDay[] {
  const map = new Map<string, LearningLog[]>()
  for (const log of logs) {
    const date = formatDate(log.timestamp)
    const arr = map.get(date) ?? []
    arr.push(log)
    map.set(date, arr)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayLogs]) => ({
      date,
      logs: dayLogs,
      totalProblems: dayLogs.length,
      correctCount: dayLogs.filter(l => l.isCorrect).length,
      stars: dayLogs.reduce((sum, l) => sum + (l.isCorrect ? (l.hintUsed ? 5 : 10) : 0), 0),
    }))
}

export function useDiary(userId: string | undefined) {
  return useLiveQuery(async () => {
    if (!userId) return []
    const logs = await db.learningLogs
      .where('userId').equals(userId)
      .reverse().sortBy('timestamp')
      .then(all => all.slice(0, 200))
    return groupByDate(logs)
  }, [userId], [])
}
