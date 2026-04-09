import { useState, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Problem } from '@/types/problem'
import {
  isIntegerAnswer,
  isFractionAnswer,
  isMultipleChoiceAnswer,
  isSymbolAnswer,
  isMultiBlankAnswer,
  isDrawAnswer,
  isTextAnswer,
} from '@/types/problem'
import { useProblemSession } from '@/features/problem/hooks/useProblemSession'
import { CustomKeypad } from '@/features/problem/components/CustomKeypad'
import { FractionInput } from '@/features/problem/components/FractionInput'
import { IntegerInput } from '@/features/problem/components/IntegerInput'
import { MultipleChoiceInput } from '@/features/problem/components/MultipleChoiceInput'
import { SymbolInput } from '@/features/problem/components/SymbolInput'
import { TextInput } from '@/features/problem/components/TextInput'
import { MultiBlankInput } from '@/features/problem/components/MultiBlankInput'
import { DrawProblem } from '@/features/problem/components/DrawProblem'
import { AnimationPlayer } from '@/shared/components/AnimationPlayer'
import { Scratchpad } from '@/features/problem/components/Scratchpad'
import { SubmitFeedback } from '@/features/result/components/SubmitFeedback'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { isFractionEqual } from '@/shared/utils/fractionUtils'
import { formatNumber, formatNumbersInString } from '@/shared/utils/format'
import { filterHintText } from '@/shared/utils/hintFilter'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'

const NO_KEYPAD_TYPES = new Set(['multiple_choice', 'symbol', 'draw', 'text'])

function normalizeTextAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s*,\s*/g, ',')  // "ㄴ, ㄹ" → "ㄴ,ㄹ"
    .replace(/\s+/g, ' ')      // 연속 공백 정리
}

/**
 * 이미지 절대 경로 생성 유틸리티
 */
function getAssetPath(path: string | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  return `${baseUrl}/${cleanPath}`
}

export function ProblemScreen({ problem, isRemind }: { problem: Problem; isRemind: boolean }) {
  const navigate = useNavigate()
  const session = useProblemSession(problem)
  const [submitResult, setSubmitResult] = useState<boolean | null>(null)
  const [showScratchpad, setShowScratchpad] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const handleScratchpadClear = useCallback(() => {}, [])

  const profile = useUserProfile()
  const isMage = (profile?.avatarId ?? 'warrior') === 'mage'
  const isDraw = session.answerType === 'draw'
  const showKeypad = !NO_KEYPAD_TYPES.has(session.answerType)

  const missionProgress = profile ? getMissionProgress(profile) : null
  const problemNum = Math.min((missionProgress?.problemsSolved ?? 0) + 1, DAILY_PROBLEM_GOAL)
  const progressPct = (problemNum / DAILY_PROBLEM_GOAL) * 100
  const starCount = profile?.totalXP ?? 0

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
    if (isTextAnswer(answer) && isTextAnswer(correct)) {
      // 서술형(60자 초과)은 자동 채점 불가 → 항상 오답으로 표시 후 정답 공개
      if (correct.text.length > 60) return false
      return normalizeTextAnswer(answer.text) === normalizeTextAnswer(correct.text)
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
          hintUsed: session.hintUsed || showHint,
          inputSequence: session.inputSequence,
          isRemind,
        },
      })
    }, 400)
  }

  function handleDrawSelfAssess(isCorrect: boolean, drawingData?: string) {
    if (isCorrect) {
      navigate('/result', {
        state: {
          problem,
          userAnswer: problem.answer,
          isCorrect: true,
          timeSpent: session.getTimeSpent(),
          hintUsed: session.hintUsed || showHint,
          inputSequence: [],
          drawingData,
          isRemind,
        },
      })
    } else {
      navigate(0)
    }
  }

  const progressHeader = (
    <div className="shrink-0" style={{ backgroundColor: '#0c0c1f', borderBottom: '1px solid #1c1c3a' }}>
      <div className="flex items-center justify-between px-4 h-12 gap-2">
        {/* 뒤로 */}
        <button
          onClick={() => navigate('/home')}
          className="shrink-0 text-xl leading-none"
          style={{ color: '#e5e3ff' }}
        >←</button>

        {/* 단원 / 문제 진행 */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold truncate"
             style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>
            {problem.unit} / 문제 {problemNum}/{DAILY_PROBLEM_GOAL}
          </p>
        </div>

        {/* 별 + 도구 버튼 */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold" style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}>
            ★ {formatNumber(starCount)}
          </span>
          {!isDraw && (
            <button
              onClick={() => setShowScratchpad(s => !s)}
              className="text-xs font-bold px-2 py-1 border transition-colors"
              style={showScratchpad
                ? { backgroundColor: '#23233f', borderColor: '#ffe792', color: '#ffe792' }
                : { backgroundColor: '#1d1d37', borderColor: '#23233f', color: '#aaa8c3' }
              }
            >✏️</button>
          )}
          <button
            onClick={() => {
              setShowHint(s => !s)
              if (!showHint) session.setHintUsed(true)
            }}
            className="relative text-xs font-bold px-2 py-1 border transition-colors"
            style={showHint
              ? { backgroundColor: '#23233f', borderColor: '#ffe792', color: '#ffe792' }
              : { backgroundColor: '#1d1d37', borderColor: isMage ? 'rgba(196,127,255,0.5)' : '#23233f', color: isMage ? '#c180ff' : '#81ecff' }
            }
          >
            💡
            {isMage && !showHint && (
              <span className="absolute -top-1.5 -right-1.5 text-[8px] font-black px-1 leading-tight"
                    style={{ backgroundColor: '#c180ff', color: '#fff' }}>
                FREE
              </span>
            )}
          </button>
        </div>
      </div>
      {/* 진행 바 */}
      <div style={{ height: '3px', backgroundColor: '#23233f' }}>
        <div className="h-full transition-all duration-500"
             style={{ width: `${progressPct}%`, backgroundColor: '#22c55e' }} />
      </div>
    </div>
  )

  const hint = showHint && (
    <div className="mx-4 mt-2 mb-2 px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2"
         style={{ backgroundColor: '#23233f', border: '1px solid #ffe792', color: '#e5e3ff' }}>
      <p className="font-bold text-yellow-400 mb-1">💡 힌트</p>
      {formatNumbersInString(filterHintText(problem.conceptExplanation))}
    </div>
  )

  const questionContent = (
    <div className="px-5 py-4 text-base font-medium leading-relaxed"
         style={{ color: '#e5e3ff' }}>
      {formatNumbersInString(problem.question)}
      {problem.questionImage && (
        <div className="mt-4 w-full flex items-center justify-center p-3 border">
          <img
            src={getAssetPath(problem.questionImage)}
            alt="문제 그림"
            style={{ maxWidth: '100%', maxHeight: '260px', width: 'auto', height: 'auto', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: '#0c0c1f' }}>
      {submitResult !== null && <SubmitFeedback isCorrect={submitResult} />}
      {progressHeader}

      {isDraw && isDrawAnswer(problem.answer) ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {questionContent}
            {hint}
          </div>
          <div className="flex-none h-[400px] px-4 pb-4">
            <DrawProblem
              referenceImage={getAssetPath(problem.answer.referenceImage)}
              onSelfAssess={handleDrawSelfAssess}
            />
          </div>
        </div>
      ) : (
        <>
          {/* 연습장 전체화면 오버레이 */}
          {showScratchpad && (
            <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0c0c1f' }}>
              <div className="flex items-center justify-between px-4 py-3"
                   style={{ backgroundColor: '#17172f', borderBottom: '1px solid #23233f' }}>
                <span className="text-base font-bold" style={{ color: '#ffe792' }}>✏️ 연습장</span>
                <button
                  onClick={() => setShowScratchpad(false)}
                  className="text-sm font-bold px-4 py-2"
                  style={{ backgroundColor: '#22c55e', color: '#fff' }}
                >
                  닫기
                </button>
              </div>

              {/* 연습장 상단에 문제 지문 표시 */}
              <div className="flex-none max-h-[30%] overflow-y-auto bg-black/10 border-b border-white/5">
                {questionContent}
              </div>

              <div className="flex-1 min-h-0 p-3">
                <Scratchpad onClear={handleScratchpadClear} />
              </div>
            </div>
          )}

          {/* 상단 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {questionContent}
            {hint}

            {/* 조건부 애니메이션 노출: 지문 이미지가 없고, 애니메이션 에셋이 있는 경우만 노출 */}
            {!problem.questionImage && problem.animationAsset && problem.animationAsset !== 'none' && (
              <div className="mx-4 mb-2 h-44 overflow-hidden"
                   style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                <div className="flex items-center justify-center w-full h-full">
                  <AnimationPlayer asset={problem.animationAsset} className="w-full h-full max-h-44" />
                </div>
              </div>
            )}

            {/* 키패드 없는 입력 타입: 질문 바로 아래 배치 (여백 방지) */}
            {session.answerType === 'multiple_choice' && (
              <div className="py-3">
                <MultipleChoiceInput
                  choices={problem.choices}
                  choiceImages={problem.choiceImages}
                  selected={session.selectedChoice}
                  onSelect={session.setSelectedChoice}
                />
              </div>
            )}
            {session.answerType === 'symbol' && (
              <div className="py-3">
                <SymbolInput
                  selected={session.selectedSymbol}
                  onSelect={session.setSelectedSymbol}
                />
              </div>
            )}
            {session.answerType === 'text' && (
              <TextInput
                value={session.textValue}
                onChange={session.setTextValue}
                isDescriptive={isTextAnswer(problem.answer) && problem.answer.text.length > 60}
              />
            )}
          </div>

          {/* 하단 고정 영역 */}
          <div className="shrink-0" style={{ borderTop: '1px solid #23233f', backgroundColor: '#17172f' }}>
            <div className="py-3">
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
                <IntegerInput value={session.intValue} unit={problem.answerUnit} />
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

            <div className="px-4 pt-2 pb-3">
              <button
                disabled={!session.isReady || submitResult !== null}
                onClick={handleSubmit}
                className="w-full min-h-[52px] text-xl font-bold transition-opacity disabled:opacity-40 active:opacity-80"
                style={{ backgroundColor: '#22c55e', color: '#fff' }}
              >
                정답 제출하기
              </button>
            </div>
          </div>
        </>
      )}
      <BottomNavBar />
    </div>
  )
}

export function ProblemRoute() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const problem = state?.problem as Problem | undefined
  const isRemind = state?.isRemind ?? false

  useEffect(() => {
    if (!problem) navigate('/home', { replace: true })
  }, [problem, navigate])

  if (!problem) return null

  return <ProblemScreen problem={problem} isRemind={isRemind} />
}
