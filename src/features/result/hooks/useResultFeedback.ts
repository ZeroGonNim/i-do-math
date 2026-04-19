import { useEffect, useRef, useState } from 'react'
import { classifyMistake } from '@/shared/utils/mistakeClassifier'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { userBoxRepo } from '@/shared/db/userBoxRepo'
import { updateStreak } from '@/shared/hooks/useStreak'
import { recordMissionProblemSolved, recordMissionWrongReviewed } from '@/shared/hooks/useDailyMission'
import { calcLevel } from '@/shared/utils/levelUp'
import { canUnlockNextDifficulty } from '@/shared/utils/difficultyUnlock'
import { generateUUID } from '@/shared/utils/uuid'
import { getAvatarAbility } from '@/shared/utils/avatarAbility'
import type { Problem, Answer } from '@/types/problem'
import type { UserProfile } from '@/types/user'

interface Params {
  problem: Problem
  userAnswer: Answer
  isCorrect: boolean
  timeSpent: number
  hintUsed: boolean
  inputSequence: string[]
  isRemind?: boolean
  drawingData?: string
  retryCount?: number
}

/** XP 획득량 (스펙 §3-2) */
function calcXpGain(isRemind: boolean, hintUsed: boolean): number {
  if (isRemind) return 10       // 오답 복습 정답
  if (hintUsed) return 15       // 힌트 없이 재도전 정답 (근사)
  return 20                     // 일반 정답
}

/** 별 획득량 계산 (난이도 및 힌트 사용 여부 반영) */
function calcStarsGained(difficulty: string, hintUsed: boolean): number {
  const baseStars = difficulty === 'challenge' ? 30 : difficulty === 'applied' ? 20 : 10
  return hintUsed ? Math.floor(baseStars / 2) : baseStars
}

export function useResultFeedback({
  problem,
  userAnswer,
  isCorrect,
  timeSpent,
  hintUsed,
  inputSequence,
  isRemind,
  drawingData,
  retryCount = 0,
}: Params) {
  const [leveledUp, setLeveledUp] = useState(false)
  const [newLevel, setNewLevel] = useState<number | null>(null)
  const [difficultyUnlocked, setDifficultyUnlocked] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [boxDropped, setBoxDropped] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [starsGained, setStarsGained] = useState(0)
  const [xpMultiplierApplied, setXpMultiplierApplied] = useState(false)
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    async function processResult() {
      const profile = await userProfileRepo.get()
      if (!profile) return

      try {
        const mistakeType = isCorrect
          ? null
          : classifyMistake(problem.type, problem.answer, userAnswer, timeSpent)

        const effectiveHintUsed = hintUsed || (retryCount > 0)

        // 1. 학습 로그 저장
        await learningLogRepo.add({
          logId: generateUUID(),
          userId: profile.userId,
          grade: profile.grade,
          semester: problem.semester as 1 | 2,
          problemId: problem.id,
          concept: problem.concept,
          difficulty: problem.difficulty,
          mistakeType,
          isCorrect,
          userAnswer,
          timeSpent,
          hintUsed: effectiveHintUsed,
          retryCount,
          timestamp: Date.now(),
          drawingData,
        })

        // 2. 기본 업데이트
        const { newStreak } = await updateStreak(profile.userId)
        await recordMissionProblemSolved(profile.userId)

        // 30일 연속 달성 시 레전드 박스 지급 (30의 배수마다)
        if (newStreak > 0 && newStreak % 30 === 0) {
          await userBoxRepo.add({
            userId: profile.userId,
            boxType: 'legend',
            acquiredAt: Date.now(),
            isOpened: false,
          })
          await userProfileRepo.update({
            boxCount: (profile.boxCount ?? 0) + 1,
          })
        }

        // 3. 아바타 특수 능력 계산 (profile의 noDropStreak 재활용 — 추가 DB 읽기 불필요)
        const ability = getAvatarAbility(profile.avatarId, {
          isCorrect,
          hintUsed,
          noDropStreak: profile.noDropStreak ?? 0,
        })

        // 4. 정답/오답 분기 처리
        if (isCorrect) {
          const latestProfile = await userProfileRepo.get()
          if (!latestProfile) return

          // XP 및 별 계산
          const abilityHintUsed = ability.ignoreHintPenalty ? false : effectiveHintUsed
          const baseXp = calcXpGain(!!isRemind, abilityHintUsed)
          const xpGain = Math.round(baseXp * ability.xpMultiplier)
          const stars = calcStarsGained(problem.difficulty, abilityHintUsed)

          const prevXP = latestProfile.totalXP ?? 0
          const newXP = prevXP + xpGain
          const prevLevel = latestProfile.level
          const nextLevel = calcLevel(newXP)

          // 박스 드롭 판단 (로봇: +0.05 보너스율)
          const noDropStreak = latestProfile.noDropStreak ?? 0
          const buffRate = (latestProfile.duplicateBuff?.bonusRate ?? 0) + ability.boxBonusRate
          const dropNormalBox = userBoxRepo.shouldDropBox(noDropStreak, buffRate)
          const dropLevelupBox = userBoxRepo.isLevelupBoxLevel(prevLevel, nextLevel)
          const anyBoxDropped = dropNormalBox || dropLevelupBox

          // 중복 버프 소진
          const duplicateBuff = (() => {
            const buff = latestProfile.duplicateBuff
            if (!buff || buff.remaining <= 0) return undefined
            const remaining = buff.remaining - 1
            return remaining > 0 ? { ...buff, remaining } : undefined
          })()

          const updates: Partial<UserProfile> = {
            totalStars: latestProfile.totalStars + stars,
            totalXP: newXP,
            level: nextLevel,
            noDropStreak: dropNormalBox ? 0 : noDropStreak + 1,
            boxCount: (latestProfile.boxCount ?? 0)
              + (dropNormalBox ? 1 : 0)
              + (dropLevelupBox ? 1 : 0),
            duplicateBuff,
          }

          // 원자적 업데이트 (totalXP + level 동시)
          await userProfileRepo.update(updates)

          // userBoxes 레코드 저장
          if (dropNormalBox) {
            await userBoxRepo.add({
              userId: latestProfile.userId,
              boxType: 'normal',
              acquiredAt: Date.now(),
              isOpened: false,
            })
          }
          if (dropLevelupBox) {
            await userBoxRepo.add({
              userId: latestProfile.userId,
              boxType: 'levelup',
              acquiredAt: Date.now(),
              isOpened: false,
            })
          }

          await wrongNoteRepo.recordCorrect(profile.userId, problem.concept)

          if (isRemind) {
            await recordMissionWrongReviewed(profile.userId)
          }

          if (nextLevel > prevLevel) {
            setLeveledUp(true)
            setNewLevel(nextLevel)
          }

          setBoxDropped(anyBoxDropped)
          setXpGained(xpGain)
          setStarsGained(stars)
          if (ability.xpMultiplier > 1) setXpMultiplierApplied(true)

          if (latestProfile.unlockedDifficulty === 'basic') {
            const conceptLogs = await learningLogRepo.getRecentForUnlockCheck(
              profile.userId,
              problem.concept,
              20
            )
            if (canUnlockNextDifficulty(conceptLogs)) {
              await userProfileRepo.update({ unlockedDifficulty: 'applied' })
              setDifficultyUnlocked(true)
            }
          }
        } else {
          // 오답 처리: 전사는 +2 XP 지급
          if (ability.wrongXpBonus > 0) {
            const latestProfile = await userProfileRepo.get()
            if (latestProfile) {
              const newXP = (latestProfile.totalXP ?? 0) + ability.wrongXpBonus
              await userProfileRepo.update({
                totalXP: newXP,
                level: calcLevel(newXP),
              })
              setXpGained(ability.wrongXpBonus)
            }
          }

          if (mistakeType) {
            // 오답 노트 저장
            await wrongNoteRepo.upsertWrong(profile.userId, problem.concept, mistakeType, {
              problemId: problem.id,
              questionText: problem.question,
              correctAnswer: problem.answer,
              lastWrongAnswer: userAnswer,
              replayData: { inputSequence },
              drawingData,
            })
          }
        }
      } catch (err) {
        console.error('결과 피드백 처리 중 오류:', err)
        setSaveError(true)
      }
    }

    processResult().catch(err => {
      console.error('결과 처리 최상위 오류:', err)
      setSaveError(true)
    })
  }, [isCorrect, problem, userAnswer, timeSpent, hintUsed, inputSequence, isRemind, drawingData, retryCount])

  return { leveledUp, newLevel, difficultyUnlocked, saveError, boxDropped, xpGained, starsGained, xpMultiplierApplied }
}
