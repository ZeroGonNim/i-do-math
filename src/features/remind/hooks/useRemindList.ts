import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/db/db'
import type { WrongNote } from '@/types/wrongNote'

interface RemindDay {
  date: string
  notes: WrongNote[]
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

function groupByDate(notes: WrongNote[]): RemindDay[] {
  const map = new Map<string, WrongNote[]>()
  
  // 최근에 틀린 날짜가 위로 오도록 정렬된 상태로 처리
  for (const note of notes) {
    const date = formatDate(note.lastAttemptAt)
    const arr = map.get(date) ?? []
    arr.push(note)
    map.set(date, arr)
  }
  
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // 날짜 내림차순
    .map(([date, dayNotes]) => ({
      date,
      notes: dayNotes.sort((a, b) => b.lastAttemptAt - a.lastAttemptAt) // 같은 날짜 내에서도 최신순
    }))
}

export function useRemindList(userId: string | undefined) {
  return useLiveQuery(async () => {
    if (!userId) return []
    
    // 2번 연속 맞추지 못한(아직 약점인) 오답들만 가져오기
    const notes = await db.wrongNotes
      .where('userId').equals(userId)
      .filter(n => n.isWeak)
      .toArray()
      
    return groupByDate(notes)
  }, [userId], [])
}
