import Dexie, { type Table } from 'dexie'
import type { UserProfile } from '@/types/user'
import type { LearningLog } from '@/types/learningLog'
import type { WrongNote } from '@/types/wrongNote'
import type { UserItem, EquippedItems } from '@/types/item'
import type { UserBox } from '@/types/userBox'

interface TemplateCounter {
  key: string
  count: number
}

export class IDoMathDB extends Dexie {
  userProfile!: Table<UserProfile>
  learningLogs!: Table<LearningLog>
  wrongNotes!: Table<WrongNote>
  templateCounters!: Table<TemplateCounter>
  userItems!: Table<UserItem>
  equippedItems!: Table<EquippedItems>
  userBoxes!: Table<UserBox>

  constructor() {
    super('IDoMathDB')
    this.version(1).stores({
      userProfile: 'userId',
      learningLogs: 'logId, userId, concept, timestamp',
      wrongNotes: 'id, userId, concept, mistakeType, isWeak',
      templateCounters: 'key',
    })
    this.version(2).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, unknown>) => {
        if (!profile.unlockedDifficulty) {
          profile.unlockedDifficulty = 'basic'
        }
      })
    })
    this.version(3).stores({
      userProfile: 'userId',
      learningLogs: 'logId, userId, concept, timestamp',
      wrongNotes: 'id, userId, concept, mistakeType, isWeak',
      templateCounters: 'key',
      userItems: 'id, userId, itemId, obtainedAt',
      equippedItems: 'userId',
    }).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, unknown>) => {
        if (profile.boxCount === undefined) profile.boxCount = 0
        if (profile.pittyCount === undefined) profile.pittyCount = 0
      })
    })

    this.version(4).stores({
      userProfile: 'userId',
      learningLogs: 'logId, userId, concept, timestamp',
      wrongNotes: 'id, userId, concept, mistakeType, isWeak',
      templateCounters: 'key',
      userItems: 'id, userId, itemId, obtainedAt',
      equippedItems: 'userId',
      userBoxes: '++boxId, userId, isOpened, acquiredAt',
    }).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, unknown>) => {
        if (profile.totalXP === undefined) profile.totalXP = 0
        if (profile.noDropStreak === undefined) profile.noDropStreak = 0
      })
    })

    this.version(5).stores({
      userProfile: 'userId',
      learningLogs: 'logId, userId, concept, timestamp',
      wrongNotes: 'id, userId, concept, mistakeType, isWeak',
      templateCounters: 'key',
      userItems: 'id, userId, itemId, obtainedAt',
      equippedItems: 'userId',
      userBoxes: '++boxId, userId, isOpened, acquiredAt',
    }).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, unknown>) => {
        if (profile.avatarId === undefined) profile.avatarId = 'warrior'
        if (profile.unlockedAvatars === undefined) profile.unlockedAvatars = ['warrior']
      })
    })
  }
}

export const db = new IDoMathDB()
