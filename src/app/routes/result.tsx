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
    <div className="flex min-h-screen flex-col gap-5 p-6 bg-white pt-10">
      {isCorrect ? (
        <>
          {/* 정답 헤더 */}
          <div className="text-center">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800">참 잘했어요!</h2>
            <p className="text-indigo-500 font-bold mt-1">+{hintUsed ? 5 : 10}⭐ 획득!</p>
          </div>

          {/* 정답 확인 */}
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-bold text-green-700 mb-2">✅ 정답</p>
            <p className="text-2xl font-bold text-center text-green-800">
              {problem.answer.numerator}/{problem.answer.denominator}
            </p>
          </div>

          {/* 단계별 풀이 */}
          {problem.steps.length > 0 && (
            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm font-bold text-indigo-700 mb-3">📚 단계별 풀이</p>
              <div className="space-y-3">
                {problem.steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-gray-500 text-sm">{s.desc}</p>
                      <p className="font-bold text-lg text-indigo-800">{s.expression}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 개념 정리 */}
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm font-bold text-blue-700 mb-1">💡 핵심 개념</p>
            <p className="text-gray-700">{problem.conceptExplanation}</p>
          </div>

          <button
            className="w-full min-h-[48px] rounded-2xl bg-indigo-500 text-white text-xl font-bold"
            onClick={() => navigate('/home')}
          >
            ▶ 다음 문제
          </button>
        </>
      ) : (
        <>
          {/* 오답 헤더 */}
          <div className="text-center">
            <div className="text-6xl mb-2">🤔</div>
            <h2 className="text-2xl font-bold text-gray-800">아쉬워요, 다시 도전해봐요!</h2>
          </div>

          {/* 내 답 vs 정답 비교 */}
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-600 mb-3">📊 답 비교</p>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-xs text-gray-400 mb-1">내가 쓴 답</p>
                <p className="text-2xl font-bold text-red-500">
                  {userAnswer.numerator}/{userAnswer.denominator}
                </p>
              </div>
              <div className="text-2xl text-gray-300 self-center">→</div>
              <div>
                <p className="text-xs text-gray-400 mb-1">정답</p>
                <p className="text-2xl font-bold text-green-600">
                  {problem.answer.numerator}/{problem.answer.denominator}
                </p>
              </div>
            </div>
          </div>

          {/* 개념 정리 */}
          <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm font-bold text-yellow-800 mb-2">💡 이렇게 생각해봐요</p>
            <p className="text-gray-700">{problem.conceptExplanation}</p>
          </div>

          {/* 단계별 풀이 */}
          {problem.steps.length > 0 && (
            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm font-bold text-indigo-700 mb-3">📚 올바른 풀이 과정</p>
              <div className="space-y-3">
                {problem.steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-gray-500 text-sm">{s.desc}</p>
                      <p className="font-bold text-lg text-indigo-800">{s.expression}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
