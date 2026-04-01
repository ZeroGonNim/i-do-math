import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import type { WrongNote } from '@/types/wrongNote'

export async function checkRemindTrigger(userId: string, concept: string): Promise<WrongNote | null> {
  const notes = await wrongNoteRepo.getWeakConcepts(userId)
  const matchNote = notes.find(n => n.concept === concept)
  if (!matchNote) return null
  const now = Date.now()
  const daysSinceLastWrong = (now - matchNote.lastAttemptAt) / (1000 * 60 * 60 * 24)
  if (matchNote.wrongCount >= 3 || matchNote.consecutiveWrong >= 2 || daysSinceLastWrong >= 3) {
    return matchNote
  }
  return null
}

export async function getTopWeakNote(userId: string): Promise<WrongNote | null> {
  const notes = await wrongNoteRepo.getWeakConcepts(userId)
  if (notes.length === 0) return null
  return notes.sort((a, b) => b.wrongCount - a.wrongCount)[0]
}
