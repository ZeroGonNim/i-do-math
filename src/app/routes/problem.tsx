import { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Problem } from '@/types/problem'
import { isIntegerAnswer } from '@/types/problem'
import { useProblemSession } from '@/features/problem/hooks/useProblemSession'
import { CustomKeypad } from '@/features/problem/components/CustomKeypad'
import { FractionInput } from '@/features/problem/components/FractionInput'
import { IntegerInput } from '@/features/problem/components/IntegerInput'
import { AnimationPlayer } from '@/shared/components/AnimationPlayer'
import { Scratchpad } from '@/features/problem/components/Scratchpad'
import { SubmitFeedback } from '@/features/result/components/SubmitFeedback'
import { isFractionEqual } from '@/shared/utils/fractionUtils'

function ProblemScreen({ problem }: { problem: Problem }) {
  const navigate = useNavigate()
  const session = useProblemSession(problem)
  const [submitResult, setSubmitResult] = useState<boolean | null>(null)
  const [showScratchpad, setShowScratchpad] = useState(false)
  const handleScratchpadClear = useCallback(() => {}, [])

  function handleSubmit() {
    const answer = session.getAnswer()
    if (!answer) return

    let isCorrect: boolean
    if (isIntegerAnswer(answer) && isIntegerAnswer(problem.answer)) {
      isCorrect = answer.value === problem.answer.value
    } else if (!isIntegerAnswer(answer) && !isIntegerAnswer(problem.answer)) {
      isCorrect = isFractionEqual(answer, problem.answer)
    } else {
      isCorrect = false
    }

    // 즉각 피드백 오버레이 표시 후 400ms 뒤 navigate
    setSubmitResult(isCorrect)
    setTimeout(() => {
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
    }, 400)
  }

  return (
    <div className="flex h-screen flex-col">
      {submitResult !== null && <SubmitFeedback isCorrect={submitResult} />}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button onClick={() => navigate('/home')} className="text-gray-500 font-medium">
          ← 나가기
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScratchpad(s => !s)}
            className={`text-sm font-bold px-3 py-1 rounded-xl border transition-colors ${
              showScratchpad
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
          >
            ✏️ 연습장
          </button>
          <button
            onClick={() => session.setHintUsed(true)}
            className="text-indigo-500 font-medium"
          >
            💡 힌트
          </button>
        </div>
      </div>

      {/* Hint */}
      {session.hintUsed && (
        <div className="mx-4 mt-2 rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm">
          {problem.conceptExplanation}
        </div>
      )}

      {/* Animation / Scratchpad */}
      <div className="flex-1 mx-4 mt-4 rounded-2xl min-h-0 overflow-hidden">
        {showScratchpad ? (
          <Scratchpad onClear={handleScratchpadClear} />
        ) : (
          <div className="flex items-center justify-center bg-indigo-50 w-full h-full">
            <AnimationPlayer asset={problem.animationAsset} className="w-full h-full max-h-48" />
          </div>
        )}
      </div>

      {/* Question */}
      <div className="px-6 py-4 text-base font-medium text-gray-800 leading-relaxed">
        {problem.question}
      </div>

      {/* Input + Keypad */}
      <div className="border-t bg-white">
        <div className="py-4">
          {session.answerType === 'integer' ? (
            <IntegerInput value={session.intValue} />
          ) : (
            <FractionInput
              numerator={session.numerator}
              denominator={session.denominator}
              activeField={session.activeField}
              onFieldSelect={session.setActiveField}
            />
          )}
        </div>
        <CustomKeypad onKey={session.handleKeyPress} mode={session.answerType} />
        <div className="p-4 pb-6">
          <button
            disabled={!session.isReady || submitResult !== null}
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
