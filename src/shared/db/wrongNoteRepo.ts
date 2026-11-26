import { db } from './db'
import type { WrongNote } from '@/types/wrongNote'
import type { MistakeType } from '@/types/problem'

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30]

function calcNextReviewAt(consecutiveCorrect: number): number {
  const days = REVIEW_INTERVALS_DAYS[Math.min(consecutiveCorrect, REVIEW_INTERVALS_DAYS.length - 1)]
  return Date.now() + days * 24 * 60 * 60 * 1000
}

export const wrongNoteRepo = {
  async upsertWrong(
    userId: string,
    concept: string,
    mistakeType: MistakeType,
    updates: Pick<WrongNote, 'lastWrongAnswer' | 'replayData' | 'drawingData' | 'questionText' | 'correctAnswer' | 'problemId'>
  ): Promise<void> {
    if (!mistakeType) return
    const id = `${userId}::${concept}::${mistakeType}`
    const existing = await db.wrongNotes.get(id)
    if (existing) {
      const consecutiveWrong = (existing.consecutiveWrong ?? 0) + 1
      const wrongCount = (existing.wrongCount ?? 0) + 1
      await db.wrongNotes.update(id, {
        ...updates,
        wrongCount,
        consecutiveWrong,
        consecutiveCorrect: 0,
        isWeak: true,
        lastAttemptAt: Date.now(),
        nextReviewAt: calcNextReviewAt(0),
      })
    } else {
      await db.wrongNotes.add({
        id,
        userId,
        concept,
        mistakeType,
        wrongCount: 1,
        consecutiveWrong: 1,
        consecutiveCorrect: 0,
        isWeak: true,
        lastAttemptAt: Date.now(),
        nextReviewAt: calcNextReviewAt(0),
        ...updates,
      })
    }
  },
  async recordCorrect(userId: string, concept: string): Promise<void> {
    const notes = await db.wrongNotes
      .where('userId').equals(userId)
      .filter(n => n.concept === concept)
      .toArray()
    for (const note of notes) {
      const consecutiveCorrect = (note.consecutiveCorrect ?? 0) + 1
      const isWeak = consecutiveCorrect >= 2 ? false : (note.isWeak ?? true)
      await db.wrongNotes.update(note.id, {
        consecutiveWrong: 0,
        consecutiveCorrect,
        isWeak,
        lastAttemptAt: Date.now(),
        nextReviewAt: isWeak ? calcNextReviewAt(consecutiveCorrect) : undefined,
      })
    }
  },
  async getWeakConcepts(userId: string): Promise<WrongNote[]> {
    return db.wrongNotes
      .where('userId').equals(userId)
      .filter(n => n.isWeak)
      .toArray()
  },
  async getAll(userId: string): Promise<WrongNote[]> {
    return db.wrongNotes.where('userId').equals(userId).toArray()
  },
}
