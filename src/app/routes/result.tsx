import { useEffect, useRef, useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useResultFeedback } from '@/features/result/hooks/useResultFeedback'
import { selectRecommendedProblem } from '@/shared/utils/recommendEngine'
import { loadProblems } from '@/shared/services/problemLoader'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { LevelUpModal } from '@/shared/components/LevelUpModal'
import { DifficultyUnlockModal } from '@/shared/components/DifficultyUnlockModal'
import { CorrectOverlay } from '@/features/result/components/CorrectOverlay'
import { WrongOverlay } from '@/features/result/components/WrongOverlay'
import { formatNumber, formatNumbersInString } from '@/shared/utils/format'
import type { Problem, Answer, ProblemStep } from '@/types/problem'
import {
  isIntegerAnswer,
  isFractionAnswer,
  isMultipleChoiceAnswer,
  isSymbolAnswer,
  isMultiBlankAnswer,
  isDrawAnswer,
  isTextAnswer,
} from '@/types/problem'
import { VerticalArithmetic } from '@/features/problem/components/VerticalArithmetic'
import { AppHeader } from '@/shared/components/AppHeader'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { MISTAKE_LABELS } from '@/shared/constants/problemConstants'
import { classifyMistake } from '@/shared/utils/mistakeClassifier'

function buildVerticalData(question: string, steps: ProblemStep[] | undefined) {
  if (!steps?.length) return null
  const match = question.match(/([\d,]+)\s*([×÷])\s*([\d,]+)/)
  if (!match) return null

  const expression = `${formatNumber(match[1])} ${match[2]} ${formatNumber(match[3])}`
  const lastParts = steps[steps.length - 1].expression.split('=').map(s => s.trim())
  const result = formatNumber(lastParts[lastParts.length - 1])

  const vsteps = steps.slice(0, -1).map(s => {
    const parts = s.expression.split('=').map(p => p.trim())
    return { value: formatNumber(parts[parts.length - 1]), label: parts[0] }
  })

  return { expression, steps: vsteps.length ? vsteps : undefined, result }
}

function formatAnswer(answer: Answer): string {
  if (isIntegerAnswer(answer)) return formatNumber(answer.value)
  if (isFractionAnswer(answer)) return `${formatNumber(answer.numerator)}/${formatNumber(answer.denominator)}`
  if (isMultipleChoiceAnswer(answer)) return `${formatNumber(answer.choice)}번`
  if (isSymbolAnswer(answer)) return answer.symbol
  if (isMultiBlankAnswer(answer)) return answer.values.map(v => typeof v === 'number' ? formatNumber(v) : v).join(', ')
  if (isTextAnswer(answer)) return answer.text
  return '—'
}

export function ResultRoute() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const profile = useUserProfile()

  const [recommended, setRecommended] = useState<Problem | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showDifficultyUnlock, setShowDifficultyUnlock] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showBoxDrop, setShowBoxDrop] = useState(false)

  // state 데이터 안전하게 추출
  const problem = state?.problem as Problem | undefined
  const isCorrect = state?.isCorrect ?? false
  const userAnswer = state?.userAnswer as Answer | undefined
  const timeSpent = state?.timeSpent ?? 0
  const hintUsed = state?.hintUsed ?? false
  const inputSequence = state?.inputSequence ?? []
  const drawingData = state?.drawingData as string | undefined
  const isRemind = state?.isRemind ?? false

  // Hook 호출 (항상 동일한 순서 보장) — problem/userAnswer가 없을 때 fallback 처리
  const PLACEHOLDER_PROBLEM = problem ?? ({} as Problem)
  const PLACEHOLDER_ANSWER = userAnswer ?? ({ value: 0 } as Answer)
  const feedbackArgs = {
    problem: PLACEHOLDER_PROBLEM,
    userAnswer: PLACEHOLDER_ANSWER,
    isCorrect: problem && userAnswer ? isCorrect : false,
    timeSpent,
    hintUsed,
    inputSequence,
    isRemind,
    drawingData: problem && userAnswer ? drawingData : undefined,
  }

  const { leveledUp, newLevel, difficultyUnlocked, saveError, boxDropped, xpGained, starsGained, xpMultiplierApplied } = useResultFeedback(feedbackArgs)

  // overlay 종료 후 보여줄 모달을 결정하는 최신 값을 ref로 유지
  // (state 변경마다 onDone 레퍼런스가 바뀌어 애니메이션이 재시작되는 문제 방지)
  const postOverlayStateRef = useRef({ leveledUp, difficultyUnlocked, boxDropped })
  useEffect(() => {
    postOverlayStateRef.current = { leveledUp, difficultyUnlocked, boxDropped }
  }, [leveledUp, difficultyUnlocked, boxDropped])

  const handleOverlayDone = useCallback(() => {
    setShowOverlay(false)
    const { leveledUp: lu, difficultyUnlocked: du, boxDropped: bd } = postOverlayStateRef.current
    if (lu) setShowLevelUp(true)
    else if (du) setShowDifficultyUnlock(true)
    else if (bd) setShowBoxDrop(true)
  }, []) // 의도적으로 빈 deps — ref를 통해 최신값 읽음

  useEffect(() => {
    if (!state?.problem || state.isCorrect === undefined) {
      navigate('/home', { replace: true })
    }
  }, [state, navigate])

  useEffect(() => {
    if (!profile || !problem) return
    const currentProblem = problem
    const currentProfile = profile
    async function loadRecommend() {
      try {
        const data = await loadProblems()
        // 기억력 대폭 강화: 최근 100개의 문제를 기억하여 중복 배제
        const recentIds = await learningLogRepo.getRecentProblemIds(currentProfile.userId, 100)
        const recentTimes = await learningLogRepo.getRecentTimeSpent(currentProfile.userId, 20)
        const avgTimeSpent = recentTimes.length > 0
          ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length
          : undefined
        const rec = selectRecommendedProblem({
          unit: currentProblem.unit,
          concept: currentProblem.concept,
          currentDifficulty: currentProblem.difficulty,
          currentId: currentProblem.id,
          isCorrect,
          recentIds,
          pool: data.problems,
          avgTimeSpent,
          timeSpent,
        })

        setRecommended(rec)
      } catch {
        // 추천 문제 로드 실패 시 추천 버튼만 숨김
      }
    }
    loadRecommend()
  }, [isCorrect, problem, profile, timeSpent])

  if (!state?.problem || state.isCorrect === undefined || !problem || !userAnswer) {
    return null
  }

  const handleNextProblem = () => {
    if (recommended) {
      navigate('/problem', { state: { problem: recommended }, replace: true })
    } else {
      navigate('/home', { replace: true })
    }
  }

  const isDraw = problem.answerType === 'draw'

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0c0c1f' }}>
      {saveError && (
        <div className="fixed top-4 left-0 right-0 mx-4 z-50 px-4 py-3 text-sm text-center font-medium text-white shadow-lg"
             style={{ backgroundColor: 'rgba(220,38,38,0.9)' }}>
          ⚠️ 결과 저장에 실패했어요. 학습 기록이 누락될 수 있어요.
        </div>
      )}
      <AppHeader title="수학 퀘스트" onBack={() => navigate('/home')} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
        {showOverlay && isCorrect && (
          <CorrectOverlay
            stars={starsGained > 0 ? starsGained : (hintUsed ? 5 : 10)}
            onDone={handleOverlayDone}
          />
        )}
        {showOverlay && !isCorrect && (
          <WrongOverlay
            userNumerator={isIntegerAnswer(userAnswer) ? userAnswer.value : isFractionAnswer(userAnswer) ? userAnswer.numerator : undefined}
            userDenominator={isFractionAnswer(userAnswer) ? userAnswer.denominator : undefined}
            onDone={handleOverlayDone}
          />
        )}
        {!showOverlay && showLevelUp && newLevel && (
          <LevelUpModal
            newLevel={newLevel}
            hasBox={newLevel % 5 === 0}
            onOpenBox={() => navigate('/box-open?from=levelup', { replace: true })}
            onClose={() => {
              setShowLevelUp(false)
              if (difficultyUnlocked) setShowDifficultyUnlock(true)
              else if (boxDropped) setShowBoxDrop(true)
            }}
          />
        )}
        {!showOverlay && !showLevelUp && showDifficultyUnlock && (
          <DifficultyUnlockModal onClose={() => {
            setShowDifficultyUnlock(false)
            if (boxDropped) setShowBoxDrop(true)
          }} />
        )}
        {!showOverlay && !showLevelUp && !showDifficultyUnlock && showBoxDrop && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
               style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <div className="w-full max-w-sm p-8 text-center"
                 style={{ backgroundColor: '#17172f', border: '1px solid #c180ff' }}>
              <div className="text-6xl mb-3">📦</div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#e5e3ff' }}>박스 획득!</h2>
              <p className="text-sm mb-6" style={{ color: '#aaa8c3' }}>
                정답 보상으로 박스를 획득했어요!<br />지금 바로 열어볼까요?
              </p>
              <button
                onClick={() => navigate('/box-open', { replace: true })}
                className="w-full min-h-[52px] text-lg font-bold transition-opacity active:opacity-80 mb-3"
                style={{ backgroundColor: '#c180ff', color: '#fff' }}
              >
                📦 지금 열기
              </button>
              <button
                onClick={() => setShowBoxDrop(false)}
                className="w-full text-sm"
                style={{ color: '#aaa8c3' }}
              >
                나중에 열기
              </button>
            </div>
          </div>
        )}

        {isCorrect ? (
          <>
            {/* 정답 헤더 */}
            <div className="text-center pt-6 pb-2">
              <div className="text-6xl mb-4">🎊</div>
              <h2
                className="text-[40px] font-bold leading-none"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-1.5px' }}
              >
                정답이에요!
              </h2>
            </div>

            {/* 보상 카드 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col px-4 py-4 gap-1" style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                <p className="text-xs font-bold" style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}>⚡ 별</p>
                <p className="text-xl font-bold whitespace-nowrap" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
                  +{formatNumber(starsGained || (hintUsed ? 5 : 10))} ★
                </p>
              </div>
              <div className="flex flex-col px-4 py-4 gap-1" style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                <p className="text-xs font-bold" style={{ color: '#22c55e', fontFamily: 'var(--font-game)' }}>💰 경험치</p>
                <p className="text-xl font-bold whitespace-nowrap" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
                  +{formatNumber(xpGained > 0 ? xpGained : 10)} XP{xpMultiplierApplied ? ' ×2' : ''}
                </p>
              </div>
            </div>

            {/* 별점 */}
            <div className="flex flex-col items-center py-4 gap-2" style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-2xl" style={{ color: '#ffe792' }}>★</span>
                ))}
              </div>
              <p className="text-sm font-bold" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>완벽한 승리!</p>
            </div>

            {/* 정답 확인 (그리기/일반 구분) */}
            {isDraw ? (
              <div className="flex flex-col gap-4">
                {/* Quest complete badge + heading */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div
                    className="px-4 py-1"
                    style={{ backgroundColor: '#6f00be' }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: '#e5c6ff', fontFamily: 'var(--font-game)', letterSpacing: '1.4px' }}
                    >
                      퀘스트 완료
                    </span>
                  </div>
                  <p
                    className="text-4xl font-bold text-center"
                    style={{ color: '#81ecff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.9px' }}
                  >
                    결과 비교
                  </p>
                  <p
                    className="text-lg text-center"
                    style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
                  >
                    두 그림을 비교해 보세요
                  </p>
                </div>

                {/* Drawing panels */}
                <div className="flex flex-col gap-3">
                  {/* 내 그림 */}
                  <div className="flex flex-col gap-2">
                    <p
                      className="text-base font-medium"
                      style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
                    >
                      내 그림
                    </p>
                    <div
                      className="w-full flex items-center justify-center overflow-hidden"
                      style={{
                        height: '280px',
                        backgroundColor: '#000',
                        border: '1px solid #23233f',
                      }}
                    >
                      {drawingData ? (
                        <img src={drawingData} alt="내 그림" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-xs italic" style={{ color: '#46465c' }}>그림 없음</span>
                      )}
                    </div>
                  </div>

                  {/* 정답 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <p
                        className="text-base font-medium"
                        style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
                      >
                        정답
                      </p>
                      <div
                        className="px-3 py-0.5"
                        style={{ backgroundColor: '#ffd709' }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: '#5b4b00', fontFamily: 'var(--font-game)' }}
                        >
                          완벽 일치!
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-full flex items-center justify-center overflow-hidden bg-white"
                      style={{
                        height: '280px',
                        border: '1px solid #23233f',
                      }}
                    >
                      <img
                        src={isDrawAnswer(problem.answer) ? (problem.answer.referenceImage.startsWith('http') ? problem.answer.referenceImage : `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${problem.answer.referenceImage.replace(/^\//, '')}`) : ''}
                        alt="정답 그림"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback card */}
                <div
                  className="flex flex-col items-center gap-4 px-6 py-6"
                  style={{ backgroundColor: '#1d1d37' }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ width: '80px', height: '80px', backgroundColor: '#81ecff' }}
                  >
                    <svg width="40" height="32" viewBox="0 0 64 52" fill="none">
                      <path d="M4 26L22 44L60 6" stroke="#005762" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" />
                    </svg>
                  </div>
                  <p
                    className="text-2xl font-bold text-center"
                    style={{ color: '#00e3fd', fontFamily: 'var(--font-sans)', letterSpacing: '-0.6px' }}
                  >
                    멋진 시각적 논리예요!
                  </p>
                  <p
                    className="text-sm text-center leading-6"
                    style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
                  >
                    {problem.conceptExplanation}
                  </p>
                </div>

                {/* Action buttons */}
                <button
                  className="flex items-center justify-center font-medium text-xl transition-all active:scale-[0.97]"
                  style={{
                    width: '100%',
                    height: '68px',
                    backgroundColor: 'transparent',
                    border: '2px solid #81ecff',
                    color: '#81ecff',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '-0.5px',
                  }}
                  onClick={() => navigate('/problem', { state: { problem } })}
                >
                  다시 그려볼래
                </button>
                <button
                  className="flex items-center justify-center font-medium text-xl transition-all active:scale-[0.97]"
                  style={{
                    width: '100%',
                    height: '68px',
                    backgroundColor: '#81ecff',
                    color: '#005762',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '-0.5px',
                  }}
                  onClick={handleNextProblem}
                >
                  맞게 그렸어
                </button>
              </div>
            ) : null}

            {/* 단계별 풀이 */}
            {(problem.steps?.length ?? 0) > 0 && (
              <div className="px-4 py-3"
                   style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                <p className="text-sm font-bold mb-3" style={{ color: '#81ecff' }}>📚 풀이 과정</p>
                {(() => {
                  const vd = buildVerticalData(problem.question, problem.steps)
                  return vd ? (
                    <VerticalArithmetic
                      expression={vd.expression}
                      steps={vd.steps}
                      result={vd.result}
                      className="mb-3"
                    />
                  ) : null
                })()}
                <div className="space-y-3">
                  {problem.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 text-xs flex items-center justify-center font-bold"
                            style={{ background: 'linear-gradient(135deg, #22c55e, #81ecff)', color: '#fff' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: '#aaa8c3' }}>{s.desc}</p>
                        {s.narrative && (
                          <p className="text-sm mt-0.5 px-2 py-1"
                             style={{ backgroundColor: '#23233f', color: '#aaa8c3', border: '1px solid #23233f' }}>
                            {formatNumbersInString(s.narrative)}
                          </p>
                        )}
                        <p className="font-bold text-xl mt-1" style={{ color: '#81ecff' }}>{formatNumbersInString(s.expression)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 개념 정리 */}
            <div className="px-4 py-3"
                 style={{ backgroundColor: '#1d1d37', border: '1px solid rgba(255,209,102,0.35)', boxShadow: '0 0 12px rgba(255,209,102,0.08), ' }}>
              <p className="text-sm font-bold mb-1.5" style={{ color: '#ffe792' }}>💡 핵심 개념</p>
              <p className="text-sm leading-relaxed" style={{ color: '#aaa8c3' }}>{formatNumbersInString(problem.conceptExplanation)}</p>
            </div>

            {/* 정답 버튼 */}
            <button
              className="w-full min-h-[56px] text-lg font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'transparent', border: '2px solid #23233f', color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              onClick={() => navigate('/home')}
            >
              🏠 홈으로
            </button>
            <button
              className="w-full min-h-[56px] text-lg font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: '#c180ff', color: '#fff', fontFamily: 'var(--font-sans)' }}
              onClick={handleNextProblem}
            >
              다음 문제 →
            </button>
          </>
        ) : (
          <>
            {/* 오답 헤더 */}
            <div className="flex flex-col items-center pt-6 pb-2 gap-3">
              <div className="relative">
                <div
                  className="flex items-center justify-center"
                  style={{ width: '102px', height: '102px', backgroundColor: '#ff716c' }}
                >
                  <span style={{ fontSize: '52px', lineHeight: 1 }}>💀</span>
                </div>
                <div
                  className="absolute -top-2 -right-2 px-2 py-1"
                  style={{ backgroundColor: '#ff4747' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#fff', fontFamily: 'var(--font-game)' }}>아쉽!</span>
                </div>
              </div>
              <h2
                className="text-[40px] font-bold leading-none"
                style={{ color: '#ff716c', fontFamily: 'var(--font-sans)', letterSpacing: '-1.5px' }}
              >
                아쉬워요!
              </h2>
              <p className="text-base text-center" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
                몬스터의 체력이 조금 남았습니다!
              </p>
            </div>

            {/* 내 답 vs 정답 비교 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col px-4 py-4 gap-1" style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                <p className="text-xs font-bold" style={{ color: '#ff716c', fontFamily: 'var(--font-game)' }}>내 답</p>
                <p className="text-2xl font-bold" style={{ color: '#ff716c', fontFamily: 'var(--font-game)' }}>
                  {formatAnswer(userAnswer)}
                </p>
              </div>
              <div className="flex flex-col px-4 py-4 gap-1" style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                <p className="text-xs font-bold" style={{ color: '#81ecff', fontFamily: 'var(--font-game)' }}>정답</p>
                <p className="text-2xl font-bold" style={{ color: '#81ecff', fontFamily: 'var(--font-game)' }}>
                  {formatAnswer(problem.answer)}
                </p>
              </div>
            </div>

            {/* 실수 유형 분석 */}
            {(() => {
              const mistakeType = classifyMistake(problem.type, problem.answer, userAnswer, timeSpent)
              const label = mistakeType ? MISTAKE_LABELS[mistakeType] : null
              return label ? (
                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                  <p className="text-sm font-bold" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>실수 유형 분석</p>
                  <span className="px-3 py-1 text-xs font-bold" style={{ backgroundColor: '#c180ff', color: '#fff', fontFamily: 'var(--font-game)' }}>
                    {label}
                  </span>
                </div>
              ) : null
            })()}

            {/* 단계별 풀이 */}
            {(problem.steps?.length ?? 0) > 0 && (
              <div className="px-4 py-3"
                   style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}>
                <p className="text-sm font-bold mb-3" style={{ color: '#81ecff' }}>📚 풀이 과정 보기</p>
                {(() => {
                  const vd = buildVerticalData(problem.question, problem.steps)
                  return vd ? (
                    <VerticalArithmetic
                      expression={vd.expression}
                      steps={vd.steps}
                      result={vd.result}
                      className="mb-3"
                    />
                  ) : null
                })()}
                <div className="space-y-3">
                  {problem.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 text-xs flex items-center justify-center font-bold"
                            style={{ backgroundColor: '#ff716c', color: '#fff' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: '#aaa8c3' }}>{s.desc}</p>
                        {s.narrative && (
                          <p className="text-sm mt-0.5 px-2 py-1"
                             style={{ backgroundColor: '#23233f', color: '#aaa8c3', border: '1px solid #23233f' }}>
                            {formatNumbersInString(s.narrative)}
                          </p>
                        )}
                        <p className="font-bold text-xl mt-1" style={{ color: '#81ecff' }}>{formatNumbersInString(s.expression)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 오늘의 팁 */}
            <div className="px-4 py-4 flex gap-3 items-start"
                 style={{ backgroundColor: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.3)' }}>
              <div className="shrink-0 w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#ffe792' }}>
                <span style={{ fontSize: '14px', lineHeight: 1 }}>💡</span>
              </div>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}>오늘의 팁</p>
                <p className="text-sm leading-relaxed" style={{ color: '#aaa8c3' }}>{formatNumbersInString(problem.conceptExplanation)}</p>
              </div>
            </div>

            {/* 오답 버튼 */}
            <button
              className="w-full min-h-[56px] text-lg font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'transparent', border: '2px solid #23233f', color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              onClick={() => navigate('/home')}
            >
              🏠 홈으로
            </button>
            <button
              className="w-full min-h-[56px] text-lg font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: '#ff9f43', color: '#fff', fontFamily: 'var(--font-sans)' }}
              onClick={() => navigate('/problem', { state: { problem } })}
            >
              다시 도전하기!
            </button>
          </>
        )}
      </div>
      <BottomNavBar />
    </div>
  )
}
