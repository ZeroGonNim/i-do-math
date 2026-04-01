import { useLocation, useNavigate } from 'react-router-dom'
import type { Problem } from '@/types/problem'
import { useProblemSession } from '@/features/problem/hooks/useProblemSession'
import { CustomKeypad } from '@/features/problem/components/CustomKeypad'
import { FractionInput } from '@/features/problem/components/FractionInput'
import { isFractionEqual } from '@/shared/utils/fractionUtils'

function ProblemScreen({ problem }: { problem: Problem }) {
  const navigate = useNavigate()
  const session = useProblemSession(problem)

  function handleSubmit() {
    const answer = session.getAnswer()
    if (!answer) return
    const isCorrect = isFractionEqual(answer, problem.answer)
    navigate('/result', {
      state: {
        problem,
        userAnswer: answer,
        isCorrect,
        timeSpent: session.getTimeSpent(),
        hintUsed: session.hintUsed,
        inputSequence: session.inputSequence,
      },
    })
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button onClick={() => navigate('/home')} className="text-gray-500 font-medium">
          ← 나가기
        </button>
        <button
          onClick={() => session.setHintUsed(true)}
          className="text-indigo-500 font-medium"
        >
          💡 힌트
        </button>
      </div>

      {/* Hint */}
      {session.hintUsed && (
        <div className="mx-4 mt-2 rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm">
          {problem.conceptExplanation}
        </div>
      )}

      {/* Animation Canvas Placeholder */}
      <div className="flex-1 flex items-center justify-center bg-indigo-50 mx-4 mt-4 rounded-2xl min-h-0">
        <span className="text-gray-400 text-sm">🎬 {problem.animationAsset}</span>
      </div>

      {/* Question */}
      <div className="px-6 py-4 text-base font-medium text-gray-800 leading-relaxed">
        {problem.question}
      </div>

      {/* Input + Keypad */}
      <div className="border-t bg-white">
        <div className="py-4">
          <FractionInput
            numerator={session.numerator}
            denominator={session.denominator}
            activeField={session.activeField}
            onFieldSelect={session.setActiveField}
          />
        </div>
        <CustomKeypad onKey={session.handleKeyPress} />
        <div className="p-4 pb-6">
          <button
            disabled={!session.isReady}
            onClick={handleSubmit}
            className="w-full min-h-[48px] rounded-2xl bg-blue-500 text-white text-xl font-bold disabled:opacity-40 transition-opacity"
          >
            정답 확인 ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProblemRoute() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const problem = state?.problem as Problem | undefined

  if (!problem) {
    navigate('/home', { replace: true })
    return null
  }

  return <ProblemScreen problem={problem} />
}
