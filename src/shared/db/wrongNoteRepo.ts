import { db } from './db'
import type { WrongNote } from '@/types/wrongNote'
import type { MistakeType } from '@/types/problem'

export const wrongNoteRepo = {
  async upsertWrong(
    userId: string,
    concept: string,
    mistakeType: MistakeType,
    updates: Pick<WrongNote, 'lastWrongAnswer' | 'replayData'>
  ): Promise<void> {
    if (!mistakeType) return
    const id = `${userId}::${concept}::${mistakeType}`
    const existing = await db.wrongNotes.get(id)
    if (existing) {
      const consecutiveWrong = existing.consecutiveWrong + 1
      const wrongCount = existing.wrongCount + 1
      await db.wrongNotes.update(id, {
        ...updates,
        wrongCount,
        consecutiveWrong,
        consecutiveCorrect: 0,
        isWeak: wrongCount >= 3,
        lastAttemptAt: Date.now(),
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
        isWeak: false,
        lastAttemptAt: Date.now(),
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
      const isWeak = consecutiveCorrect >= 2 ? false : note.isWeak
      await db.wrongNotes.update(note.id, {
        consecutiveWrong: 0,
        consecutiveCorrect,
        isWeak,
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
