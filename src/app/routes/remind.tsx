import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { getTopWeakNote } from '@/features/remind/hooks/useRemind'
import { loadProblems } from '@/shared/services/problemLoader'
import type { WrongNote } from '@/types/wrongNote'
import type { Problem } from '@/types/problem'

export function RemindRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const [note, setNote] = useState<WrongNote | null>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const weakNote = await getTopWeakNote(profile!.userId)
      if (!weakNote) { setLoading(false); return }
      setNote(weakNote)
      const data = await loadProblems()
      const match = data.problems.find(p => p.concept === weakNote.concept)
      setProblem(match ?? null)
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    )
  }

  if (!note || !problem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">틀린 문제가 없어요!</h2>
        <p className="text-gray-500 text-center">계속 잘하고 있어요. 새 문제에 도전해봐요!</p>
        <button
          className="mt-4 w-full max-w-xs min-h-[48px] rounded-2xl bg-indigo-500 text-white font-bold"
          onClick={() => navigate('/home')}
        >
          홈으로
        </button>
      </div>
    )
  }

  const mistakeLabel: Record<string, string> = {
    denominator_error: '분모를 잘못 쓰는 실수',
    numerator_error: '분자를 잘못 쓰는 실수',
    concept_error: '개념을 헷갈리는 실수',
    precision_error: '계산 실수',
    guess_error: '추측으로 답한 경우',
    hint_dependent_error: '힌트에 너무 의존',
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 p-6 bg-white pt-10">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/home')} className="text-gray-500 font-medium">← 나가기</button>
      </div>

      <div className="text-center">
        <div className="text-5xl mb-2">🔁</div>
        <h2 className="text-2xl font-bold text-gray-800">다시 도전해봐요!</h2>
        <p className="text-gray-500 text-sm mt-1">예전에 틀린 유형이에요</p>
      </div>

      {/* 약점 정보 */}
      <div className="rounded-2xl bg-red-50 border border-red-200 p-4 space-y-2">
        <p className="text-sm font-bold text-red-700">⚠️ 자주 틀리는 유형</p>
        <p className="text-gray-700 font-medium">{mistakeLabel[note.mistakeType ?? ''] ?? note.mistakeType}</p>
        <p className="text-xs text-gray-400">틀린 횟수: {note.wrongCount}회</p>
      </div>

      {/* 이전에 쓴 오답 */}
      <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
        <p className="text-sm font-bold text-gray-600 mb-2">📋 이전에 쓴 답</p>
        <p className="text-2xl font-bold text-red-500 text-center">
          {'value' in note.lastWrongAnswer
            ? note.lastWrongAnswer.value
            : `${note.lastWrongAnswer.numerator}/${note.lastWrongAnswer.denominator}`}
        </p>
      </div>

      {/* 힌트 */}
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-sm font-bold text-yellow-800 mb-1">💡 이번엔 이걸 기억해요</p>
        <p className="text-gray-700">{problem.conceptExplanation}</p>
      </div>

      <button
        className="w-full min-h-[48px] rounded-2xl bg-indigo-500 text-white text-xl font-bold"
        onClick={() => navigate('/problem', { state: { problem } })}
      >
        🎯 지금 풀어보기
      </button>
    </div>
  )
}
