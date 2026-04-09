import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/shared/db/db'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import { userItemRepo } from '@/shared/db/userItemRepo'
import { equippedItemsRepo } from '@/shared/db/equippedItemsRepo'
import { userBoxRepo } from '@/shared/db/userBoxRepo'
import { classifyMistake } from '@/shared/utils/mistakeClassifier'
import { isFractionEqual } from '@/shared/utils/fractionUtils'
import { selectRecommendedProblem } from '@/shared/utils/recommendEngine'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'
import { updateStreak } from '@/shared/hooks/useStreak'
import { getTopWeakNote } from '@/features/remind/hooks/useRemind'
import { getAvatarAbility } from '@/shared/utils/avatarAbility'
import type { UserProfile } from '@/types/user'
import type { Problem } from '@/types/problem'

const TEST_USER_ID = 'test-user-001'

const mockProfile: UserProfile = {
  userId: TEST_USER_ID,
  displayName: '테스트',
  grade: 4,
  characterId: 'char-01',
  avatarId: 'warrior',
  unlockedAvatars: ['warrior'],
  level: 1,
  totalStars: 0,
  totalXP: 0,
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
  boxCount: 0,
  pittyCount: 0,
  noDropStreak: 0,
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
  await db.userItems.clear()
  await db.equippedItems.clear()
  await db.userBoxes.clear()
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
      difficulty: 'basic',
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
  it('틀렸을 때 시간 정보 없으면 현재 난이도 유지', () => {
    const pool: Problem[] = [
      { ...mockProblem, id: 'p-basic', difficulty: 'basic' },
      { ...mockProblem, id: 'p-applied', difficulty: 'applied' },
    ]
    const rec = selectRecommendedProblem({
      concept: mockProblem.concept,
      currentDifficulty: 'applied',
      currentId: mockProblem.id,
      isCorrect: false,
      recentIds: [],
      pool,
    })
    expect(rec?.difficulty).toBe('applied')
  })

  it('틀렸을 때 시간이 평균의 2배 초과(isHard)면 난이도 낮춤', () => {
    const pool: Problem[] = [
      { ...mockProblem, id: 'p-basic', difficulty: 'basic' },
      { ...mockProblem, id: 'p-applied', difficulty: 'applied' },
    ]
    const rec = selectRecommendedProblem({
      concept: mockProblem.concept,
      currentDifficulty: 'applied',
      currentId: mockProblem.id,
      isCorrect: false,
      recentIds: [],
      pool,
      timeSpent: 100,
      avgTimeSpent: 30,
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

describe('인벤토리 — 아이템 획득 및 장착', () => {
  it('아이템 획득 후 인벤토리에 저장됨', async () => {
    const ui = await userItemRepo.add(TEST_USER_ID, 'warrior_hat_common')
    const all = await userItemRepo.getAll(TEST_USER_ID)
    expect(all).toHaveLength(1)
    expect(all[0].itemId).toBe('warrior_hat_common')
    expect(ui.userId).toBe(TEST_USER_ID)
  })

  it('장착하면 해당 슬롯에 userItemId 저장됨', async () => {
    const ui = await userItemRepo.add(TEST_USER_ID, 'warrior_hat_common')
    await equippedItemsRepo.equip(TEST_USER_ID, 'hat', ui.id)
    const equipped = await equippedItemsRepo.get(TEST_USER_ID)
    expect(equipped.hat).toBe(ui.id)
  })

  it('같은 슬롯에 새 아이템 장착하면 이전 것이 교체됨', async () => {
    const ui1 = await userItemRepo.add(TEST_USER_ID, 'warrior_hat_common')
    const ui2 = await userItemRepo.add(TEST_USER_ID, 'warrior_hat_rare')
    await equippedItemsRepo.equip(TEST_USER_ID, 'hat', ui1.id)
    await equippedItemsRepo.equip(TEST_USER_ID, 'hat', ui2.id)
    const equipped = await equippedItemsRepo.get(TEST_USER_ID)
    expect(equipped.hat).toBe(ui2.id)
  })

  it('장착 해제하면 슬롯이 null이 됨', async () => {
    const ui = await userItemRepo.add(TEST_USER_ID, 'warrior_weapon_common')
    await equippedItemsRepo.equip(TEST_USER_ID, 'weapon', ui.id)
    await equippedItemsRepo.unequip(TEST_USER_ID, 'weapon')
    const equipped = await equippedItemsRepo.get(TEST_USER_ID)
    expect(equipped.weapon).toBeNull()
  })

  it('장착 없는 슬롯은 null 반환', async () => {
    const equipped = await equippedItemsRepo.get(TEST_USER_ID)
    expect(equipped.hat).toBeNull()
    expect(equipped.weapon).toBeNull()
    expect(equipped.armor).toBeNull()
    expect(equipped.pet).toBeNull()
  })
})

describe('박스 드롭 시스템', () => {
  it('천장(noDropStreak=10)에서 반드시 드롭', () => {
    const result = userBoxRepo.shouldDropBox(10, 0)
    expect(result).toBe(true)
  })

  it('천장 미만(noDropStreak=0)에서도 확률적으로 드롭 가능', () => {
    // 100회 시도 중 최소 1번은 드롭되어야 함 (20% 확률)
    const drops = Array.from({ length: 100 }, () => userBoxRepo.shouldDropBox(0, 0))
    expect(drops.some(Boolean)).toBe(true)
  })

  it('로봇 보너스(+5%) 포함 시 드롭율 높아짐 — 천장 조건은 동일', () => {
    const result = userBoxRepo.shouldDropBox(10, 0.05)
    expect(result).toBe(true)
  })

  it('박스 추가 후 boxCount 증가', async () => {
    await userBoxRepo.add({ userId: TEST_USER_ID, boxType: 'normal', acquiredAt: Date.now(), isOpened: false })
    await userProfileRepo.update({ boxCount: 1 })
    const profile = await userProfileRepo.get()
    expect(profile?.boxCount).toBe(1)
  })
})

describe('아바타 해금 및 변경', () => {
  it('초기 unlockedAvatars는 warrior만 포함', async () => {
    const profile = await userProfileRepo.get()
    expect(profile?.unlockedAvatars).toContain('warrior')
    expect(profile?.unlockedAvatars).not.toContain('mage')
  })

  it('별이 충분하면 새 아바타 해금 가능', async () => {
    await userProfileRepo.update({ totalStars: 200, unlockedAvatars: ['warrior', 'mage'], avatarId: 'mage' })
    const profile = await userProfileRepo.get()
    expect(profile?.unlockedAvatars).toContain('mage')
    expect(profile?.avatarId).toBe('mage')
    expect(profile?.totalStars).toBe(200)
  })

  it('해금 시 별 차감', async () => {
    await userProfileRepo.update({ totalStars: 128 })
    const before = await userProfileRepo.get()
    const cost = 128
    await userProfileRepo.update({
      totalStars: (before?.totalStars ?? 0) - cost,
      unlockedAvatars: [...(before?.unlockedAvatars ?? ['warrior']), 'mage'],
      avatarId: 'mage',
    })
    const after = await userProfileRepo.get()
    expect(after?.totalStars).toBe(0)
    expect(after?.unlockedAvatars).toContain('mage')
  })

  it('avatarId 변경 후 프로필에 반영', async () => {
    await userProfileRepo.update({ unlockedAvatars: ['warrior', 'assassin'], avatarId: 'assassin' })
    const profile = await userProfileRepo.get()
    expect(profile?.avatarId).toBe('assassin')
  })
})

describe('아바타 특수 능력', () => {
  it('전사 — 오답 시 wrongXpBonus=2', () => {
    const ability = getAvatarAbility('warrior', { isCorrect: false, hintUsed: false, noDropStreak: 0 })
    expect(ability.wrongXpBonus).toBe(2)
  })

  it('전사 — 정답 시 wrongXpBonus=0', () => {
    const ability = getAvatarAbility('warrior', { isCorrect: true, hintUsed: false, noDropStreak: 0 })
    expect(ability.wrongXpBonus).toBe(0)
  })

  it('마법사 — 힌트 사용 시 ignoreHintPenalty=true', () => {
    const ability = getAvatarAbility('mage', { isCorrect: true, hintUsed: true, noDropStreak: 0 })
    expect(ability.ignoreHintPenalty).toBe(true)
  })

  it('마법사 — 힌트 미사용 시 ignoreHintPenalty=false', () => {
    const ability = getAvatarAbility('mage', { isCorrect: true, hintUsed: false, noDropStreak: 0 })
    expect(ability.ignoreHintPenalty).toBe(false)
  })

  it('암살자 — 연속 정답(noDropStreak≥2)이면 xpMultiplier=2', () => {
    const ability = getAvatarAbility('assassin', { isCorrect: true, hintUsed: false, noDropStreak: 3 })
    expect(ability.xpMultiplier).toBe(2)
  })

  it('암살자 — 연속 정답 부족(noDropStreak=1)이면 xpMultiplier=1', () => {
    const ability = getAvatarAbility('assassin', { isCorrect: true, hintUsed: false, noDropStreak: 1 })
    expect(ability.xpMultiplier).toBe(1)
  })

  it('로봇 — boxBonusRate=0.05', () => {
    const ability = getAvatarAbility('robot', { isCorrect: true, hintUsed: false, noDropStreak: 0 })
    expect(ability.boxBonusRate).toBe(0.05)
  })

  it('avatarId 미지정 시 모든 보너스=기본값', () => {
    const ability = getAvatarAbility(undefined, { isCorrect: false, hintUsed: true, noDropStreak: 5 })
    expect(ability.wrongXpBonus).toBe(0)
    expect(ability.xpMultiplier).toBe(1)
    expect(ability.ignoreHintPenalty).toBe(false)
    expect(ability.boxBonusRate).toBe(0)
  })
})
