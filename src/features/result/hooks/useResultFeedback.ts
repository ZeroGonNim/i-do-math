import { useEffect, useState } from 'react'
import { classifyMistake } from '@/shared/utils/mistakeClassifier'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { updateStreak } from '@/shared/hooks/useStreak'
import { recordMissionProblemSolved, recordMissionWrongReviewed } from '@/shared/hooks/useDailyMission'
import { calcLevel } from '@/shared/utils/levelUp'
import { canUnlockNextDifficulty } from '@/shared/utils/difficultyUnlock'
import type { Problem, Answer } from '@/types/problem'

interface Params {
  problem: Problem
  userAnswer: Answer
  isCorrect: boolean
  timeSpent: number
  hintUsed: boolean
  inputSequence: string[]
}

export function useResultFeedback({
  problem,
  userAnswer,
  isCorrect,
  timeSpent,
  hintUsed,
  inputSequence,
}: Params) {
  const [leveledUp, setLeveledUp] = useState(false)
  const [newLevel, setNewLevel] = useState<number | null>(null)
  const [difficultyUnlocked, setDifficultyUnlocked] = useState(false)

  useEffect(() => {
    async function save() {
      const profile = await userProfileRepo.get()
      if (!profile) return

      const mistakeType = isCorrect
        ? null
        : classifyMistake(problem.type, problem.answer, userAnswer, timeSpent)

      await learningLogRepo.add({
        logId: crypto.randomUUID(),
        userId: profile.userId,
        grade: profile.grade,
        problemId: problem.id,
        concept: problem.concept,
        mistakeType,
        isCorrect,
        userAnswer,
        timeSpent,
        hintUsed,
        retryCount: 0,
        timestamp: Date.now(),
      })

      await updateStreak(profile.userId)
      await recordMissionProblemSolved(profile.userId)

      if (isCorrect) {
        const stars = hintUsed ? 5 : 10
        const newStars = profile.totalStars + stars
        const prevLevel = profile.level
        const nextLevel = calcLevel(newStars)
        await userProfileRepo.update({ totalStars: newStars, level: nextLevel })
        await wrongNoteRepo.recordCorrect(profile.userId, problem.concept)
        if (nextLevel > prevLevel) {
          setLeveledUp(true)
          setNewLevel(nextLevel)
        }

        if (profile.unlockedDifficulty === 'basic') {
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
      } else if (mistakeType && mistakeType !== 'guess_error') {
        await wrongNoteRepo.upsertWrong(profile.userId, problem.concept, mistakeType, {
          lastWrongAnswer: userAnswer,
          replayData: { inputSequence },
        })
        await recordMissionWrongReviewed(profile.userId)
      }
    }
    save()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { leveledUp, newLevel, difficultyUnlocked }
}
