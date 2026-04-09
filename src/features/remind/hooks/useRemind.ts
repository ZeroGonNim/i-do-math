import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import type { WrongNote } from '@/types/wrongNote'

export async function checkRemindTrigger(userId: string, concept: string): Promise<WrongNote | null> {
  const notes = await wrongNoteRepo.getAll(userId)
  const matchNote = notes.find(n => n.concept === concept)
  if (!matchNote) return null
  
  // 이미 충분히 맞춘 경우 제외 (3번 연속 맞추면 약점에서 완전 해제 검토 가능하나 현재는 2번)
  if (matchNote.consecutiveCorrect >= 2) return null

  // 조건 완화: 오답이 하나라도 있으면 복습 대상으로 간주하여 성취감 부여
  return matchNote
}

export async function getTopWeakNote(userId: string): Promise<WrongNote | null> {
  // DB에서 직접 isWeak인 것들만 가져오도록 변경
  const eligible = await wrongNoteRepo.getWeakConcepts(userId)
  
  if (eligible.length === 0) return null
  
  // 정렬: 틀린 횟수가 많은 순 -> 가장 최근에 틀린 순
  return eligible.sort((a, b) => {
    if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount
    return b.lastAttemptAt - a.lastAttemptAt
  })[0]
}
