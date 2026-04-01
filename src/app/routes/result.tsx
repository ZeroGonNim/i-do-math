import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useResultFeedback } from '@/features/result/hooks/useResultFeedback'
import { selectRecommendedProblem } from '@/shared/utils/recommendEngine'
import { loadProblems } from '@/shared/services/problemLoader'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import type { Problem, FractionAnswer } from '@/types/problem'

export function ResultRoute() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const profile = useUserProfile()

  const { problem, userAnswer, isCorrect, timeSpent, hintUsed, inputSequence } = state as {
    problem: Problem
    userAnswer: FractionAnswer
    isCorrect: boolean
    timeSpent: number
    hintUsed: boolean
    inputSequence: string[]
  }

  const [recommended, setRecommended] = useState<Problem | null>(null)

  useResultFeedback({ problem, userAnswer, isCorrect, timeSpent, hintUsed, inputSequence })

  useEffect(() => {
    if (isCorrect || !profile) return
    async function loadRecommend() {
      const data = await loadProblems()
      const recentIds = await learningLogRepo.getRecentProblemIds(profile!.userId, 10)
      const rec = selectRecommendedProblem({
        concept: problem.concept,
        currentDifficulty: problem.difficulty,
        isCorrect: false,
        recentIds,
        pool: data.problems,
      })
      setRecommended(rec)
    }
    loadRecommend()
  }, [isCorrect, problem, profile])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 bg-white">
      {isCorrect ? (
        <>
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800">참 잘했어요!</h2>
          <p className="text-indigo-500 font-bold">+{hintUsed ? 5 : 10}⭐</p>
          {problem.steps.length > 0 && (
            <div className="w-full rounded-2xl bg-indigo-50 p-4 space-y-2">
              {problem.steps.map((s, i) => (
                <div key={i} className="py-2 border-b last:border-0">
                  <span className="text-gray-500 text-sm">Step {i + 1}: {s.desc}</span>
                  <div className="font-bold text-lg">{s.expression}</div>
                </div>
              ))}
            </div>
          )}
          <button
            className="w-full min-h-[48px] rounded-2xl bg-indigo-500 text-white text-xl font-bold"
            onClick={() => navigate('/home')}
          >
            ▶ 다음 문제
          </button>
        </>
      ) : (
        <>
          <div className="text-6xl">🤔</div>
          <h2 className="text-2xl font-bold text-gray-800">다시 한번 생각해볼까?</h2>
          <div className="w-full rounded-2xl bg-yellow-50 p-4 border border-yellow-200">
            <p className="font-bold text-yellow-800">💡 개념 정리</p>
            <p className="mt-2 text-gray-700">{problem.conceptExplanation}</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              className="flex-1 min-h-[48px] rounded-2xl bg-gray-100 text-lg font-bold"
              onClick={() => navigate('/problem', { state: { problem } })}
            >
              🔁 다시 풀기
            </button>
            <button
              className="flex-1 min-h-[48px] rounded-2xl bg-indigo-500 text-white text-lg font-bold"
              onClick={() => navigate('/home')}
            >
              ▶ 건너뛰기
            </button>
          </div>
          {recommended && (
            <button
              className="w-full min-h-[48px] rounded-2xl bg-green-500 text-white text-lg font-bold"
              onClick={() => navigate('/problem', { state: { problem: recommended } })}
            >
              🎯 비슷한 문제 풀어보기
            </button>
          )}
        </>
      )}
    </div>
  )
}
