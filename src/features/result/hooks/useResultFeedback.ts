import { useEffect } from 'react'
import { classifyMistake } from '@/shared/utils/mistakeClassifier'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import type { Problem, FractionAnswer } from '@/types/problem'

interface Params {
  problem: Problem
  userAnswer: FractionAnswer
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

      if (isCorrect) {
        const stars = hintUsed ? 5 : 10
        await userProfileRepo.update({ totalStars: profile.totalStars + stars })
        await wrongNoteRepo.recordCorrect(profile.userId, problem.concept)
      } else if (mistakeType && mistakeType !== 'guess_error') {
        await wrongNoteRepo.upsertWrong(profile.userId, problem.concept, mistakeType, {
          lastWrongAnswer: userAnswer,
          replayData: { inputSequence },
        })
      }
    }
    save()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
