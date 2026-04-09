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

/**
 * 타임스탬프를 로컬 시간 기준 YYYY-MM-DD 문자열로 변환합니다.
 */
function formatDate(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
      .then(all => all.slice(0, 500)) // 기록 제한 상향
    return groupByDate(logs)
  }, [userId], [])
}
