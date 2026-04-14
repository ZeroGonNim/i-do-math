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
import { MultiBlankInput } from '@/features/problem/components/MultiBlankInput'
import { DrawProblem } from '@/features/problem/components/DrawProblem'
import { Scratchpad } from '@/features/problem/components/Scratchpad'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { isFractionEqual } from '@/shared/utils/fractionUtils'
import { formatNumber } from '@/shared/utils/format'
import { filterHintText } from '@/shared/utils/hintFilter'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useTheme } from '@/shared/hooks/useTheme'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'
import { PencilIcon, HintIcon } from '@/shared/components/PixelIcons'
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'

const NO_KEYPAD_TYPES = new Set(['multiple_choice', 'symbol', 'draw', 'text'])

function getAssetPath(path: string | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.BASE_URL || ''
  const cleanPath = path.replace(/^\//, '')
  return `${baseUrl.replace(/\/$/, '')}/${cleanPath}`
}

export function ProblemScreen({ problem, isRemind }: { problem: Problem; isRemind: boolean }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const session = useProblemSession(problem)
  const [submitResult, setSubmitResult] = useState<boolean | null>(null)
  const [showScratchpad, setShowScratchpad] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  
  const retryCount = state?.retryCount ?? 0
  const handleScratchpadClear = useCallback(() => {}, [])

  const profile = useUserProfile()
  const theme = useTheme()
  
  const currentAnswerType = session.answerType || 'integer'
  const isHandwriting = currentAnswerType === 'text' || currentAnswerType === 'draw'
  const showKeypad = !NO_KEYPAD_TYPES.has(currentAnswerType)

  const missionProgress = profile ? getMissionProgress(profile) : null
  const problemNum = Math.min((missionProgress?.problemsSolved ?? 0) + 1, DAILY_PROBLEM_GOAL)
  const progressPct = (problemNum / DAILY_PROBLEM_GOAL) * 100
  const starCount = profile?.totalXP ?? 0

  function checkCorrect(): boolean {
    const answer = session.getAnswer()
    const correct = problem.answer
    if (!answer) return false
    if (isIntegerAnswer(answer) && isIntegerAnswer(correct)) return answer.value === correct.value
    if (isFractionAnswer(answer) && isFractionAnswer(correct)) return isFractionEqual(answer, correct)
    if (isMultipleChoiceAnswer(answer) && isMultipleChoiceAnswer(correct)) return answer.choice === correct.choice
    if (isSymbolAnswer(answer) && isSymbolAnswer(correct)) return answer.symbol === correct.symbol
    if (isMultiBlankAnswer(answer) && isMultiBlankAnswer(correct)) {
      return answer.values.length === correct.values.length && answer.values.every((v, i) => v === correct.values[i])
    }
    return false
  }

  function handleSubmit() {
    const isCorrect = checkCorrect()
    setSubmitResult(isCorrect)
    setTimeout(() => {
      navigate('/result', {
        state: { problem, userAnswer: session.getAnswer(), isCorrect, timeSpent: session.getTimeSpent(), hintUsed: session.hintUsed || showHint, inputSequence: session.inputSequence, isRemind, retryCount },
      })
    }, 400)
  }

  function handleHandwritingAssess(isCorrect: boolean, drawingData?: string) {
    navigate('/result', {
      state: { 
        problem, 
        userAnswer: isTextAnswer(problem.answer) ? problem.answer : (isCorrect ? problem.answer : { referenceImage: '' }), 
        isCorrect, 
        timeSpent: session.getTimeSpent(), 
        hintUsed: session.hintUsed || showHint, 
        inputSequence: [], 
        drawingData, 
        isRemind, 
        retryCount 
      },
    })
  }

  const progressHeader = (
    <div className="shrink-0">
      <div className="flex items-center justify-between px-5 h-16 gap-2" style={{ backgroundColor: 'rgba(12,12,31,0.6)', borderBottom: '1px solid #1c1c3a', boxShadow: '0 4px 0 rgba(6,6,20,1)', backdropFilter: 'blur(24px)', zIndex: 20 }}>
        <button onClick={() => navigate('/home')} className="shrink-0 w-8 h-8 flex items-center justify-center transition-all active:opacity-60 active:scale-95 text-base font-bold" style={{ color: '#aaa8c3', backgroundColor: '#17172f' }}>‹</button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p className="text-sm font-bold truncate" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>{problem.unit} / 문제 {problemNum}/{DAILY_PROBLEM_GOAL}</p>
          <DifficultyBadge difficulty={problem.difficulty} showLabel={false} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold" style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}>★ {formatNumber(starCount)}</span>
          {!isHandwriting && (
            <button onClick={() => setShowScratchpad(s => !s)} className="flex flex-col items-center gap-0.5 text-xs font-bold px-2 py-1 border transition-colors" style={showScratchpad ? { backgroundColor: '#23233f', borderColor: '#ffe792', color: '#ffe792' } : { backgroundColor: '#1d1d37', borderColor: '#23233f', color: '#aaa8c3' }}>
              <PencilIcon color={showScratchpad ? '#ffe792' : '#aaa8c3'} size={14} />
              <span className="text-[8px] leading-none">연습장</span>
            </button>
          )}
          <button onClick={() => { setShowHint(s => !s); if (!showHint) session.setHintUsed(true); }} className="flex flex-col items-center gap-0.5 text-xs font-bold px-2 py-1 border transition-colors" style={showHint ? { backgroundColor: '#23233f', borderColor: '#ffe792', color: '#ffe792' } : { backgroundColor: '#1d1d37', borderColor: '#23233f', color: theme.primary }}>
            <HintIcon color={showHint ? '#ffe792' : theme.primary} size={14} />
            <span className="text-[8px] leading-none">힌트</span>
          </button>
        </div>
      </div>
      <div style={{ height: '3px', backgroundColor: '#23233f' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: theme.primary, boxShadow: `0 0 10px ${theme.primary}80` }} />
      </div>
    </div>
  )

  const questionContent = (
    <div className="px-5 py-4 text-base font-medium leading-relaxed" style={{ color: '#e5e3ff', whiteSpace: 'pre-wrap' }}>
      {problem.question}
      {problem.questionImage && (
        <button
          className="mt-3 w-full relative flex items-center justify-center overflow-hidden active:opacity-80 transition-opacity"
          style={{ backgroundColor: '#ffffff', border: '2px solid #23233f', borderRadius: '12px', boxShadow: '0 4px 0 #000000', maxHeight: '160px' }}
          onClick={() => setShowImageModal(true)}
        >
          <img
            key={problem.questionImage}
            src={getAssetPath(problem.questionImage)}
            alt="문제 그림"
            className="animate-in fade-in duration-500"
            style={{ maxWidth: '100%', maxHeight: '156px', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
          />
          <div className="absolute top-1.5 right-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: '6px' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="4" cy="4" r="3" stroke="white" strokeWidth="1.2"/><line x1="6.5" y1="6.5" x2="9" y2="9" stroke="white" strokeWidth="1.2" strokeLinecap="round"/><line x1="4" y1="2.5" x2="4" y2="5.5" stroke="white" strokeWidth="1" strokeLinecap="round"/><line x1="2.5" y1="4" x2="5.5" y2="4" stroke="white" strokeWidth="1" strokeLinecap="round"/></svg>
            확대
          </div>
        </button>
      )}
    </div>
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      {progressHeader}

      <div className="flex-1 flex flex-col overflow-hidden">
        {isHandwriting ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-h-0">
              {questionContent}
              <div className="px-5 py-2">
                <p className="text-xs font-bold text-yellow-400 mb-2">아래 빈 칸에 풀이 과정과 답을 써 보세요!</p>
              </div>
              {showHint && <HintBox text={problem.conceptExplanation} />}
            </div>
            <div className="shrink-0 h-[420px] px-4 pb-4">
              <DrawProblem
                referenceImage={isDrawAnswer(problem.answer) ? getAssetPath(problem.answer.referenceImage) : ''}
                onSelfAssess={handleHandwritingAssess}
              />
            </div>
          </div>
        ) : (
          <>
            {/* 질문 패널: 항상 flex-1, 스크롤 가능 */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {questionContent}
              {showHint && <HintBox text={problem.conceptExplanation} />}
              {currentAnswerType === 'multiple_choice' && (
                <div className="py-3"><MultipleChoiceInput choices={problem.choices} choiceImages={problem.choiceImages} selected={session.selectedChoice} onSelect={session.setSelectedChoice} /></div>
              )}
              {currentAnswerType === 'symbol' && (
                <div className="py-3"><SymbolInput selected={session.selectedSymbol} onSelect={session.setSelectedSymbol} /></div>
              )}
            </div>

            {/* 입력/키패드 패널: 항상 자연 높이, 화면 하단 고정 */}
            <div
              className="shrink-0 border-t-4 border-[#23233f] flex flex-col"
              style={{ backgroundColor: '#111127' }}
            >
              <div style={{ backgroundColor: '#17172f' }}>
                {!NO_KEYPAD_TYPES.has(currentAnswerType) && (
                  <div className="px-4 py-4" style={{ backgroundColor: '#17172f' }}>
                    {currentAnswerType === 'multi_blank' && (
                      <MultiBlankInput values={session.blankValues} labels={isMultiBlankAnswer(problem.answer) ? problem.answer.labels : undefined} activeIndex={session.activeBlankIndex} onFocus={session.setActiveBlankIndex} />
                    )}
                    {currentAnswerType === 'integer' && (
                      <IntegerInput value={session.intValue} unit={problem.answerUnit} />
                    )}
                    {currentAnswerType === 'fraction' && (
                      <FractionInput numerator={session.numerator} denominator={session.denominator} activeField={session.activeField} onFieldSelect={session.setActiveField} />
                    )}
                  </div>
                )}
                {showKeypad && (
                  <CustomKeypad onKey={session.handleKeyPress} mode={currentAnswerType} />
                )}
              </div>

              {/* 제출 버튼 */}
              <div className="shrink-0 px-4 pt-2 pb-3" style={{ backgroundColor: '#17172f' }}>
                <button
                  disabled={!session.isReady || submitResult !== null}
                  onClick={handleSubmit}
                  className="w-full min-h-[52px] text-xl font-bold transition-all disabled:opacity-40 active:scale-[0.98]"
                  style={{ backgroundColor: theme.primary, color: '#000', boxShadow: `0 4px 0 rgba(0,0,0,0.4)` }}
                >
                  정답 제출하기
                </button>
              </div>
            </div>

            {/* 이미지 전체화면 모달 */}
            {showImageModal && problem.questionImage && (
              <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-200"
                style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
                onClick={() => setShowImageModal(false)}
              >
                <img
                  src={getAssetPath(problem.questionImage)}
                  alt="문제 그림 확대"
                  style={{ maxWidth: '95vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }}
                />
                <p className="mt-4 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>화면을 탭하면 닫힙니다</p>
                <button
                  className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', color: '#fff' }}
                  onClick={() => setShowImageModal(false)}
                >✕</button>
              </div>
            )}
          </>
        )}
      </div>

      {showScratchpad && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0f172a' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#17172f', borderBottom: '1px solid #23233f' }}>
            <span className="text-base font-bold flex items-center gap-1.5" style={{ color: '#ffe792' }}><PencilIcon color="#ffe792" size={14} /> 연습장</span>
            <button onClick={() => setShowScratchpad(false)} className="text-sm font-bold px-4 py-2" style={{ backgroundColor: '#10b981', color: '#fff' }}>닫기</button>
          </div>
          <div className="flex-none max-h-[30%] overflow-y-auto bg-black/10 border-b border-white/5">{questionContent}</div>
          <div className="flex-1 min-h-0 p-3"><Scratchpad onClear={handleScratchpadClear} /></div>
        </div>
      )}
      
      <BottomNavBar />
    </div>
  )
}

function HintBox({ text }: { text: string }) {
  return (
    <div className="mx-4 mt-2 mb-4 px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2"
         style={{ backgroundColor: '#23233f', border: '1px solid #ffe792', color: '#e5e3ff' }}>
      <p className="font-bold text-yellow-400 mb-1 flex items-center gap-1"><HintIcon color="#ffe792" size={12} /> 힌트</p>
      {filterHintText(text)}
    </div>
  )
}

export function ProblemRoute() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const problem = state?.problem as Problem | undefined
  const isRemind = state?.isRemind ?? false
  useEffect(() => { if (!problem) navigate('/home', { replace: true }) }, [problem, navigate])
  if (!problem) return null
  return <ProblemScreen problem={problem} isRemind={isRemind} />
}
