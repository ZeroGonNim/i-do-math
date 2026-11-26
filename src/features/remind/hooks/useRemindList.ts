import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/db/db'
import type { WrongNote } from '@/types/wrongNote'

export interface RemindDay {
  date: string
  notes: WrongNote[]
}

function todayStartTs(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function todayEndTs(): number {
  return todayStartTs() + 24 * 60 * 60 * 1000
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isDueToday(note: WrongNote): boolean {
  if (!note.nextReviewAt) return true
  return note.nextReviewAt < todayEndTs()
}

function groupByDate(notes: WrongNote[]): RemindDay[] {
  const todayStr = formatDate(Date.now())
  const dueNotes = notes.filter(isDueToday)
  const pendingNotes = notes.filter(n => !isDueToday(n))

  const map = new Map<string, WrongNote[]>()

  // 오늘 복습 대상은 'today' 그룹으로 맨 위에
  if (dueNotes.length > 0) {
    map.set(todayStr, dueNotes.sort((a, b) => (a.nextReviewAt ?? 0) - (b.nextReviewAt ?? 0)))
  }

  // 나머지는 nextReviewAt 기준 날짜별 그룹
  for (const note of pendingNotes) {
    const date = note.nextReviewAt ? formatDate(note.nextReviewAt) : formatDate(note.lastAttemptAt)
    if (date === todayStr) continue
    const arr = map.get(date) ?? []
    arr.push(note)
    map.set(date, arr)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayNotes]) => ({ date, notes: dayNotes }))
}

export function useRemindList(userId: string | undefined) {
  return useLiveQuery(async () => {
    if (!userId) return []
    const notes = await db.wrongNotes
      .where('userId').equals(userId)
      .filter(n => n.isWeak)
      .toArray()
    return groupByDate(notes)
  }, [userId], [])
}

export function useTodayReviewCount(userId: string | undefined): number {
  return useLiveQuery(async () => {
    if (!userId) return 0
    const notes = await db.wrongNotes
      .where('userId').equals(userId)
      .filter(n => n.isWeak && isDueToday(n))
      .toArray()
    return notes.length
  }, [userId], 0) ?? 0
}
