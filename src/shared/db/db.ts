import Dexie, { type Table } from 'dexie'
import type { UserProfile } from '@/types/user'
import type { LearningLog } from '@/types/learningLog'
import type { WrongNote } from '@/types/wrongNote'

interface TemplateCounter {
  key: string
  count: number
}

export class IDoMathDB extends Dexie {
  userProfile!: Table<UserProfile>
  learningLogs!: Table<LearningLog>
  wrongNotes!: Table<WrongNote>
  templateCounters!: Table<TemplateCounter>

  constructor() {
    super('IDoMathDB')
    this.version(1).stores({
      userProfile: 'userId',
      learningLogs: 'logId, userId, concept, timestamp',
      wrongNotes: 'id, userId, concept, mistakeType, isWeak',
      templateCounters: 'key',
    })
  }
}

export const db = new IDoMathDB()
