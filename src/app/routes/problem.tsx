import { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Problem } from '@/types/problem'
import {
  isIntegerAnswer,
  isFractionAnswer,
  isMultipleChoiceAnswer,
  isSymbolAnswer,
  isMultiBlankAnswer,
  isDrawAnswer,
} from '@/types/problem'
import { useProblemSession } from '@/features/problem/hooks/useProblemSession'
import { CustomKeypad } from '@/features/problem/components/CustomKeypad'
import { FractionInput } from '@/features/problem/components/FractionInput'
import { IntegerInput } from '@/features/problem/components/IntegerInput'
import { MultipleChoiceInput } from '@/features/problem/components/MultipleChoiceInput'
import { SymbolInput } from '@/features/problem/components/SymbolInput'
import { MultiBlankInput } from '@/features/problem/components/MultiBlankInput'
import { DrawProblem } from '@/features/problem/components/DrawProblem'
import { AnimationPlayer } from '@/shared/components/AnimationPlayer'
import { AppHeader } from '@/shared/components/AppHeader'
import { Scratchpad } from '@/features/problem/components/Scratchpad'
import { SubmitFeedback } from '@/features/result/components/SubmitFeedback'
import { isFractionEqual } from '@/shared/utils/fractionUtils'

// 키패드가 필요 없는 타입
const NO_KEYPAD_TYPES = new Set(['multiple_choice', 'symbol', 'draw', 'text'])

function ProblemScreen({ problem }: { problem: Problem }) {
  const navigate = useNavigate()
  const session = useProblemSession(problem)
  const [submitResult, setSubmitResult] = useState<boolean | null>(null)
  const [showScratchpad, setShowScratchpad] = useState(false)
  const handleScratchpadClear = useCallback(() => {}, [])

  const isDraw = session.answerType === 'draw'
  const showKeypad = !NO_KEYPAD_TYPES.has(session.answerType)

  function checkCorrect(): boolean {
    const answer = session.getAnswer()
    const correct = problem.answer

    if (!answer) return false

    if (isIntegerAnswer(answer) && isIntegerAnswer(correct)) {
      return answer.value === correct.value
    }
    if (isFractionAnswer(answer) && isFractionAnswer(correct)) {
      return isFractionEqual(answer, correct)
    }
    if (isMultipleChoiceAnswer(answer) && isMultipleChoiceAnswer(correct)) {
      return answer.choice === correct.choice
    }
    if (isSymbolAnswer(answer) && isSymbolAnswer(correct)) {
      return answer.symbol === correct.symbol
    }
    if (isMultiBlankAnswer(answer) && isMultiBlankAnswer(correct)) {
      return (
        answer.values.length === correct.values.length &&
        answer.values.every((v, i) => v === correct.values[i])
      )
    }
    return false
  }

  function handleSubmit() {
    const isCorrect = checkCorrect()
    setSubmitResult(isCorrect)
    setTimeout(() => {
      navigate('/result', {
        state: {
          problem,
          userAnswer: session.getAnswer(),
          isCorrect,
          timeSpent: session.getTimeSpent(),
          hintUsed: session.hintUsed,
          inputSequence: session.inputSequence,
        },
      })
    }, 400)
  }

  function handleDrawSelfAssess(isCorrect: boolean) {
    if (isCorrect) {
      navigate('/result', {
        state: {
          problem,
          userAnswer: problem.answer,
          isCorrect: true,
          timeSpent: session.getTimeSpent(),
          hintUsed: session.hintUsed,
          inputSequence: [],
        },
      })
    } else {
      // 다시 그리기 — 페이지 리셋
      navigate(0)
    }
  }

  const header = (
    <AppHeader
      title={problem.concept}
      onBack={() => navigate('/home')}
      right={
        <div className="flex items-center gap-2">
          {!isDraw && (
            <button
              onClick={() => setShowScratchpad(s => !s)}
              className={`text-xs font-bold px-2 py-1 rounded-xl border transition-colors ${
                showScratchpad
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => session.setHintUsed(true)}
            className="text-xs font-bold px-2 py-1 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-600"
          >
            💡
          </button>
        </div>
      }
    />
  )

  const hint = session.hintUsed && (
    <div className="mx-4 mt-2 rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm">
      {problem.conceptExplanation}
    </div>
  )

  const question = (
    <div className="px-6 py-4 text-base font-medium text-gray-800 leading-relaxed">
      {problem.question}
      {problem.questionImage && (
        <img
          src={problem.questionImage}
          alt="문제 그림"
          className="mt-3 w-full rounded-xl border border-gray-100 object-contain max-h-52"
        />
      )}
    </div>
  )

  return (
    <div className="flex h-screen flex-col">
      {submitResult !== null && <SubmitFeedback isCorrect={submitResult} />}

      {/* Draw 타입: 스크롤 없이 캔버스가 나머지 영역 차지 */}
      {isDraw && isDrawAnswer(problem.answer) ? (
        <>
          {header}
          {hint}
          {question}
          <div className="flex-1 px-4 pb-4 min-h-0">
            <DrawProblem
              referenceImage={problem.answer.referenceImage}
              onSelfAssess={handleDrawSelfAssess}
            />
          </div>
        </>
      ) : (
        <>
          {/* 상단 스크롤 영역: 헤더·힌트·문제·애니메이션 */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {header}
            {hint}
            {question}
            <div className="mx-4 mb-2 rounded-2xl h-44 overflow-hidden">
              {showScratchpad ? (
                <Scratchpad onClear={handleScratchpadClear} />
              ) : (
                <div className="flex items-center justify-center bg-indigo-50 w-full h-full">
                  <AnimationPlayer asset={problem.animationAsset} className="w-full h-full max-h-44" />
                </div>
              )}
            </div>
          </div>

          {/* 하단 고정 영역: 입력·키패드·제출 */}
          <div className="shrink-0 border-t bg-white">
            <div className="py-4">
              {session.answerType === 'multiple_choice' && (
                <MultipleChoiceInput
                  choices={problem.choices}
                  choiceImages={problem.choiceImages}
                  selected={session.selectedChoice}
                  onSelect={session.setSelectedChoice}
                />
              )}
              {session.answerType === 'symbol' && (
                <SymbolInput
                  selected={session.selectedSymbol}
                  onSelect={session.setSelectedSymbol}
                />
              )}
              {session.answerType === 'multi_blank' && (
                <MultiBlankInput
                  values={session.blankValues}
                  labels={
                    isMultiBlankAnswer(problem.answer)
                      ? problem.answer.labels
                      : undefined
                  }
                  activeIndex={session.activeBlankIndex}
                  onFocus={session.setActiveBlankIndex}
                />
              )}
              {session.answerType === 'integer' && (
                <IntegerInput value={session.intValue} />
              )}
              {(session.answerType === 'fraction' || session.answerType === undefined) && (
                <FractionInput
                  numerator={session.numerator}
                  denominator={session.denominator}
                  activeField={session.activeField}
                  onFieldSelect={session.setActiveField}
                />
              )}
            </div>

            {showKeypad && (
              <CustomKeypad onKey={session.handleKeyPress} mode={session.answerType} />
            )}

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
        </>
      )}
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
