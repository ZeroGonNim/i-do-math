import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/db/db'
import { useMemo } from 'react'

export interface UnitStat {
  subject: string
  A: number // 정답률
  avgTime: number // 평균 풀이 시간 (초)
  fullMark: number
}

export interface RetryStat {
  name: string
  value: number
  color: string
}

export interface TrendStat {
  date: string
  accuracy: number
}

export interface WeakConcept {
  concept: string
  count: number
  lastAnswer?: any
  correctAnswer?: any
}

export function useDashboardData(userId?: string) {
  const logs = useLiveQuery(async () => {
    if (!userId) return []
    return await db.learningLogs
      .where('userId')
      .equals(userId)
      .toArray()
  }, [userId])

  const wrongNotes = useLiveQuery(async () => {
    if (!userId) return []
    return await db.wrongNotes
      .where('userId')
      .equals(userId)
      .toArray()
  }, [userId])

  const data = useMemo(() => {
    if (!logs || logs.length === 0) return { unitStats: [], trendStats: [], retryStats: [], weakConcepts: [], totalCount: 0 }

    // 1. 단원별 통계 (Radar Chart + Avg Time)
    const unitMap = new Map<string, { total: number; correct: number; totalTime: number }>()
    logs.forEach(log => {
      const unit = log.unit || '기타'
      const current = unitMap.get(unit) || { total: 0, correct: 0, totalTime: 0 }
      unitMap.set(unit, {
        total: current.total + 1,
        correct: current.correct + (log.isCorrect ? 1 : 0),
        totalTime: current.totalTime + (log.timeSpent || 0)
      })
    })

    const unitStats: UnitStat[] = Array.from(unitMap.entries()).map(([unit, stat]) => ({
      subject: unit,
      A: Math.round((stat.correct / stat.total) * 100),
      avgTime: Math.round(stat.totalTime / stat.total),
      fullMark: 100
    }))

    // 2. 재시도 비율 통계 (Pie Chart)
    const total = logs.length
    const oneShot = logs.filter(l => l.isCorrect && (!l.retryCount || l.retryCount === 0)).length
    const retry = logs.filter(l => l.isCorrect && l.retryCount && l.retryCount > 0).length
    const failed = total - oneShot - retry

    const retryStats: RetryStat[] = [
      { name: '한 번에 성공', value: Math.round((oneShot / total) * 100), color: '#10b981' },
      { name: '재시도 성공', value: Math.round((retry / total) * 100), color: '#fbbf24' },
      { name: '학습 필요', value: Math.round((failed / total) * 100), color: '#ff716c' },
    ].filter(s => s.value > 0)

    // 3. 추세 통계 (최근 7일)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    const trendStats: TrendStat[] = last7Days.map(date => {
      const dayLogs = logs.filter(l => l.timestamp && new Date(l.timestamp).toISOString().split('T')[0] === date)
      const accuracy = dayLogs.length > 0 
        ? Math.round((dayLogs.filter(l => l.isCorrect).length / dayLogs.length) * 100)
        : 0
      return { date: date.slice(5), accuracy } // MM-DD 포맷
    })

    // 3. 취약 개념 (Top 3)
    const weakMap = new Map<string, number>()
    wrongNotes?.forEach(note => {
      weakMap.set(note.concept, (weakMap.get(note.concept) || 0) + 1)
    })

    const weakConcepts: WeakConcept[] = Array.from(weakMap.entries())
      .map(([concept, count]) => ({ concept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    return { 
      unitStats, 
      trendStats, 
      retryStats,
      weakConcepts, 
      totalCount: logs.length 
    }
  }, [logs, wrongNotes])

  return data ?? { unitStats: [], trendStats: [], retryStats: [], weakConcepts: [], totalCount: 0 }
}
