import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/shared/db/db'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import { classifyMistake } from '@/shared/utils/mistakeClassifier'
import { isFractionEqual } from '@/shared/utils/fractionUtils'
import { selectRecommendedProblem } from '@/shared/utils/recommendEngine'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'
import { updateStreak } from '@/shared/hooks/useStreak'
import { getTopWeakNote } from '@/features/remind/hooks/useRemind'
import type { UserProfile } from '@/types/user'
import type { Problem } from '@/types/problem'

const TEST_USER_ID = 'test-user-001'

const mockProfile: UserProfile = {
  userId: TEST_USER_ID,
  displayName: '테스트',
  grade: 4,
  characterId: 'char-01',
  level: 1,
  totalStars: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '2020-01-01',
  parentalPinHash: null,
  parentalPinSalt: null,
  createdAt: Date.now(),
  missionDate: '2020-01-01',
  missionProblemsSolved: 0,
  missionWrongReviewed: false,
  unlockedDifficulty: 'basic',
}

const mockProblem: Problem = {
  id: 'test-problem-001',
  grade: 4,
  semester: 1,
  unit: '분수의 덧셈과 뺄셈',
  subUnit: '분모가 같은 분수의 덧셈',
  type: 'calculation',
  difficulty: 'basic',
  concept: 'fraction_add_same_denominator',
  skills: ['numerator_add'],
  mistakeTypes: ['denominator_error'],
  question: '3/8 + 2/8 = ?',
  answer: { numerator: 5, denominator: 8 },
  steps: [],
  animationAsset: '',
  conceptExplanation: '분모가 같으면 분자끼리 더합니다.',
}

beforeEach(async () => {
  await db.userProfile.clear()
  await db.learningLogs.clear()
  await db.wrongNotes.clear()
  await db.templateCounters.clear()
  await userProfileRepo.save(mockProfile)
})

describe('분수 정답 판별', () => {
  it('동일 분수는 정답', () => {
    expect(isFractionEqual({ numerator: 5, denominator: 8 }, { numerator: 5, denominator: 8 })).toBe(true)
  })

  it('동치 분수는 정답', () => {
    expect(isFractionEqual({ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 4 })).toBe(true)
  })

  it('다른 분수는 오답', () => {
    expect(isFractionEqual({ numerator: 3, denominator: 8 }, { numerator: 5, denominator: 8 })).toBe(false)
  })
})

describe('오답 유형 분류', () => {
  it('3초 미만 입력 → guess_error', () => {
    const mt = classifyMistake(
      'calculation',
      { numerator: 5, denominator: 8 },
      { numerator: 3, denominator: 8 },
      2
    )
    expect(mt).toBe('guess_error')
  })

  it('분모 틀림 → denominator_error', () => {
    const mt = classifyMistake(
      'calculation',
      { numerator: 5, denominator: 8 },
      { numerator: 5, denominator: 6 },
      10
    )
    expect(mt).toBe('denominator_error')
  })

  it('분자 틀림 → numerator_error', () => {
    // 3/8 is irreducible so denominator stays 8 after normalization
    const mt = classifyMistake(
      'calculation',
      { numerator: 5, denominator: 8 },
      { numerator: 3, denominator: 8 },
      10
    )
    expect(mt).toBe('numerator_error')
  })
})

describe('학습 로그 저장', () => {
  it('정답 로그 저장', async () => {
    await learningLogRepo.add({
      logId: 'log-001',
      userId: TEST_USER_ID,
      grade: 4,
      problemId: mockProblem.id,
      concept: mockProblem.concept,
      mistakeType: null,
      isCorrect: true,
      userAnswer: { numerator: 5, denominator: 8 },
      timeSpent: 15,
      hintUsed: false,
      retryCount: 0,
      timestamp: Date.now(),
    })
    const logs = await learningLogRepo.getRecentByUser(TEST_USER_ID, 10)
    expect(logs).toHaveLength(1)
    expect(logs[0].isCorrect).toBe(true)
  })
})

describe('오답 노트', () => {
  it('3회 틀리면 isWeak=true', async () => {
    for (let i = 0; i < 3; i++) {
      await wrongNoteRepo.upsertWrong(TEST_USER_ID, mockProblem.concept, 'numerator_error', {
        lastWrongAnswer: { numerator: 4, denominator: 8 },
        replayData: { inputSequence: ['4', '/', '8'] },
      })
    }
    const notes = await wrongNoteRepo.getAll(TEST_USER_ID)
    expect(notes[0].isWeak).toBe(true)
  })

  it('정답 2회 연속이면 isWeak 해제', async () => {
    for (let i = 0; i < 3; i++) {
      await wrongNoteRepo.upsertWrong(TEST_USER_ID, mockProblem.concept, 'numerator_error', {
        lastWrongAnswer: { numerator: 4, denominator: 8 },
        replayData: { inputSequence: [] },
      })
    }
    await wrongNoteRepo.recordCorrect(TEST_USER_ID, mockProblem.concept)
    await wrongNoteRepo.recordCorrect(TEST_USER_ID, mockProblem.concept)
    const notes = await wrongNoteRepo.getAll(TEST_USER_ID)
    expect(notes[0].isWeak).toBe(false)
  })
})

describe('추천 문제 엔진', () => {
  it('틀렸을 때 같은 개념 기본 문제 추천', () => {
    const pool: Problem[] = [
      { ...mockProblem, id: 'p-basic', difficulty: 'basic' },
      { ...mockProblem, id: 'p-applied', difficulty: 'applied' },
    ]
    const rec = selectRecommendedProblem({
      concept: mockProblem.concept,
      currentDifficulty: 'applied',
      isCorrect: false,
      recentIds: [],
      pool,
    })
    expect(rec?.difficulty).toBe('basic')
  })
})

describe('일일 미션', () => {
  it('초기 상태: 미션 미완료', () => {
    const result = getMissionProgress(mockProfile)
    expect(result.problemsSolved).toBe(0)
    expect(result.wrongReviewed).toBe(false)
    expect(result.isComplete).toBe(false)
  })

  it('DAILY_PROBLEM_GOAL은 5', () => {
    expect(DAILY_PROBLEM_GOAL).toBe(5)
  })
})

describe('스트릭', () => {
  it('어제 학습 기록 → 스트릭 증가', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)
    await db.userProfile.update(TEST_USER_ID, { lastStudyDate: yesterdayStr, currentStreak: 3 })
    await updateStreak(TEST_USER_ID)
    const updated = await userProfileRepo.get()
    expect(updated?.currentStreak).toBe(4)
  })

  it('오늘 이미 학습했으면 스트릭 변화 없음', async () => {
    const today = new Date().toISOString().slice(0, 10)
    await db.userProfile.update(TEST_USER_ID, { lastStudyDate: today, currentStreak: 5 })
    await updateStreak(TEST_USER_ID)
    const updated = await userProfileRepo.get()
    expect(updated?.currentStreak).toBe(5)
  })

  it('이틀 이상 건너뛰면 스트릭 1로 초기화', async () => {
    await db.userProfile.update(TEST_USER_ID, { lastStudyDate: '2020-01-01', currentStreak: 10 })
    await updateStreak(TEST_USER_ID)
    const updated = await userProfileRepo.get()
    expect(updated?.currentStreak).toBe(1)
  })
})

describe('스마트 리마인드', () => {
  it('약점 개념 없으면 null 반환', async () => {
    const result = await getTopWeakNote(TEST_USER_ID)
    expect(result).toBeNull()
  })

  it('약점 개념 있으면 가장 많이 틀린 것 반환', async () => {
    for (let i = 0; i < 3; i++) {
      await wrongNoteRepo.upsertWrong(TEST_USER_ID, 'fraction_add_same_denominator', 'numerator_error', {
        lastWrongAnswer: { numerator: 4, denominator: 8 },
        replayData: { inputSequence: [] },
      })
    }
    const result = await getTopWeakNote(TEST_USER_ID)
    expect(result).not.toBeNull()
    expect(result?.concept).toBe('fraction_add_same_denominator')
  })
})
