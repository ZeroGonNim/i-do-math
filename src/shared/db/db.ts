import Dexie, { type Table } from 'dexie'
import type { UserProfile } from '@/types/user'
import type { LearningLog } from '@/types/learningLog'
import type { WrongNote } from '@/types/wrongNote'
import type { UserItem, EquippedItems } from '@/types/item'
import type { UserBox } from '@/types/userBox'
import type { ProblemReport } from '@/types/problemReport'

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
  problemReports!: Table<ProblemReport>

  constructor() {
    super('IDoMathDB')
    
    // v1: 초기 스키마
    this.version(1).stores({
      userProfile: 'userId',
      learningLogs: 'logId, userId, concept, timestamp',
      wrongNotes: 'id, userId, concept, mistakeType, isWeak',
      templateCounters: 'key',
    })

    // v2: 난이도 해금 필드 추가
    this.version(2).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, any>) => {
        if (!profile.unlockedDifficulty) profile.unlockedDifficulty = 'basic'
      })
    })

    // v3: 아이템 및 상자 시스템
    this.version(3).stores({
      userItems: 'id, userId, itemId, obtainedAt',
      equippedItems: 'userId',
    }).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, any>) => {
        if (profile.boxCount === undefined) profile.boxCount = 0
        if (profile.pittyCount === undefined) profile.pittyCount = 0
      })
    })

    // v4: XP 및 박스 드롭 시스템
    this.version(4).stores({
      userBoxes: '++boxId, userId, isOpened, acquiredAt',
    }).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, any>) => {
        if (profile.totalXP === undefined) profile.totalXP = 0
        if (profile.noDropStreak === undefined) profile.noDropStreak = 0
      })
    })

    // v5: 아바타 시스템
    this.version(5).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, any>) => {
        if (profile.avatarId === undefined) profile.avatarId = 'warrior'
        if (profile.unlockedAvatars === undefined) profile.unlockedAvatars = ['warrior']
      })
    })

    // v6: 월드맵(학기) 시스템
    this.version(6).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, any>) => {
        if (profile.currentSemester === undefined) profile.currentSemester = 1
      })
    })

    // v7: 학습 로그 학기 필드 추가
    this.version(7).stores({
      learningLogs: 'logId, userId, concept, semester, timestamp',
    }).upgrade(tx => {
      return tx.table('learningLogs').toCollection().modify((log: Record<string, any>) => {
        if (log.semester === undefined) {
          log.semester = (log.problemId && log.problemId.includes('-s2-')) ? 2 : 1
        }
      })
    })

    // v8: 난이도 모드 (자동/수동)
    this.version(8).upgrade(tx => {
      return tx.table('userProfile').toCollection().modify((profile: Record<string, any>) => {
        if (profile.difficultyMode === undefined) profile.difficultyMode = 'auto'
      })
    })

    // v9: (reserved stub — keeps migration chain sequential)
    this.version(9).upgrade(() => Promise.resolve())

    // v11: 문제 신고 테이블 추가
    this.version(11).stores({
      problemReports: 'reportId, problemId, status, timestamp',
    })

    // v10: 오답 노트 상세 데이터 백필 (UI 레벨로 로직 이동하여 안정화)
    this.version(10).upgrade(tx => {
      return tx.table('wrongNotes').toCollection().modify((note: Record<string, any>) => {
        if (!note.lastAttemptAt && note.lastWrongAt) {
          note.lastAttemptAt = note.lastWrongAt
        }
        if (!note.lastAttemptAt) {
          note.lastAttemptAt = Date.now()
        }
      })
    })
  }
}

export const db = new IDoMathDB()
