import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { IDoMathDB } from '../db'
import { userProfileRepo } from '../userProfileRepo'
import type { UserProfile } from '@/types/user'

// 테스트마다 격리된 DB 인스턴스 사용
const testDb = new IDoMathDB()
// repo가 testDb를 바라보도록 교체
Object.defineProperty(userProfileRepo, '_db', { value: testDb, writable: true })

const mockProfile: UserProfile = {
  userId: 'test-uuid',
  displayName: '테스트',
  grade: 4,
  characterId: 'char-01',
  level: 1,
  totalStars: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '2026-03-31',
  parentalPinHash: null,
  parentalPinSalt: null,
  createdAt: Date.now(),
  missionDate: '2026-03-31',
  missionProblemsSolved: 0,
  missionWrongReviewed: false,
  unlockedDifficulty: 'basic',
}

beforeEach(async () => {
  await testDb.userProfile.clear()
})

describe('userProfileRepo', () => {
  it('returns undefined when no profile exists', async () => {
    expect(await testDb.userProfile.toCollection().first()).toBeUndefined()
  })

  it('saves and retrieves a profile', async () => {
    await testDb.userProfile.put(mockProfile)
    const result = await testDb.userProfile.toCollection().first()
    expect(result?.displayName).toBe('테스트')
  })

  it('updates specific fields without losing others', async () => {
    await testDb.userProfile.put(mockProfile)
    await testDb.userProfile.update(mockProfile.userId, { totalStars: 50 })
    const result = await testDb.userProfile.toCollection().first()
    expect(result?.totalStars).toBe(50)
    expect(result?.displayName).toBe('테스트')
  })
})
