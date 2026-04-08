import { useEffect, useState } from 'react'
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
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'
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

  const { leveledUp, newLevel, difficultyUnlocked, saveError, boxDropped, xpGained } = useResultFeedback(feedbackArgs)

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
    <div className="flex h-dvh flex-col" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {saveError && (
        <div className="fixed top-4 left-0 right-0 mx-4 z-50 rounded-xl px-4 py-3 text-sm text-center font-medium text-white shadow-lg"
             style={{ backgroundColor: 'rgba(220,38,38,0.9)' }}>
          ⚠️ 결과 저장에 실패했어요. 학습 기록이 누락될 수 있어요.
        </div>
      )}
      <AppHeader title={isCorrect ? '정답 결과' : '오답 결과'} onBack={() => navigate('/home')} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
        {showOverlay && isCorrect && (
          <CorrectOverlay
            stars={hintUsed ? 5 : 10}
            onDone={() => {
              setShowOverlay(false)
              if (leveledUp) setShowLevelUp(true)
              else if (difficultyUnlocked) setShowDifficultyUnlock(true)
              else if (boxDropped) setShowBoxDrop(true)
            }}
          />
        )}
        {showOverlay && !isCorrect && (
          <WrongOverlay
            userNumerator={isIntegerAnswer(userAnswer) ? userAnswer.value : isFractionAnswer(userAnswer) ? userAnswer.numerator : undefined}
            userDenominator={isFractionAnswer(userAnswer) ? userAnswer.denominator : undefined}
            onDone={() => setShowOverlay(false)}
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
            <div className="w-full max-w-sm rounded-3xl p-8 text-center"
                 style={{ backgroundColor: 'var(--color-bg-raised)', border: '1px solid var(--color-purple)' }}>
              <div className="text-6xl mb-3">📦</div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>박스 획득!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                정답 보상으로 박스를 획득했어요!<br />지금 바로 열어볼까요?
              </p>
              <button
                onClick={() => navigate('/box-open', { replace: true })}
                className="w-full min-h-[52px] rounded-xl text-lg font-bold transition-opacity active:opacity-80 mb-3"
                style={{ backgroundColor: 'var(--color-purple)', color: '#fff' }}
              >
                📦 지금 열기
              </button>
              <button
                onClick={() => setShowBoxDrop(false)}
                className="w-full text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                나중에 열기
              </button>
            </div>
          </div>
        )}

        {isCorrect ? (
          <>
            {/* 정답 헤더 */}
            <div className="text-center pt-4 pb-4 rounded-2xl"
                 style={{ background: 'linear-gradient(160deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <div className="text-6xl mb-2">🎉</div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>참 잘했어요!</h2>
                <DifficultyBadge difficulty={problem.difficulty} />
              </div>
              <div className="flex items-center justify-center gap-3 mt-1">
                <p className="font-bold" style={{ color: 'var(--color-yellow)' }}>
                  +{formatNumber(hintUsed ? 5 : 10)}⭐
                </p>
                {xpGained > 0 && (
                  <p className="font-bold animate-slide-up" style={{ color: 'var(--color-green)', fontFamily: 'var(--font-game)' }}>
                    +{xpGained} XP
                  </p>
                )}
              </div>
            </div>

            {/* 정답 확인 (그리기/일반 구분) */}
            {isDraw ? (
              <div className="rounded-xl px-4 py-4"
                   style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-green)', boxShadow: '0 0 16px rgba(34,197,94,0.12), var(--shadow-card)' }}>
                <p className="text-sm font-bold mb-3 text-center" style={{ color: 'var(--color-green)' }}>✅ 정답 비교</p>
                <div className="grid grid-cols-2 gap-3 min-h-[180px]">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">내가 그린 그림</span>
                    <div className="w-full aspect-square rounded-lg border border-gray-200 bg-amber-50 overflow-hidden flex items-center justify-center p-1">
                      {drawingData ? (
                        <img src={drawingData} alt="내 그림" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-xs text-gray-300 italic">그림 없음</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-green-500">바른 답</span>
                    <div className="w-full aspect-square rounded-lg border-2 border-green-200 bg-white overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={isDrawAnswer(problem.answer) ? (problem.answer.referenceImage.startsWith('http') ? problem.answer.referenceImage : `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${problem.answer.referenceImage.replace(/^\//, '')}`) : ''}
                        alt="정답 그림"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl px-4 py-4"
                   style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid rgba(34,197,94,0.4)', boxShadow: '0 0 16px rgba(34,197,94,0.1), var(--shadow-card)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-green)' }}>✅ 바른 답</p>
                <p className="text-3xl font-bold text-center" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-game)' }}>
                  {formatAnswer(problem.answer)}
                </p>
              </div>
            )}

            {/* 단계별 풀이 */}
            {(problem.steps?.length ?? 0) > 0 && (
              <div className="rounded-xl px-4 py-3"
                   style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
                <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-cyan)' }}>📚 단계별 풀이</p>
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
                      <span className="shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                            style={{ background: 'linear-gradient(135deg, var(--color-btn-primary), var(--color-cyan))', color: '#fff' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{s.desc}</p>
                        {s.narrative && (
                          <p className="text-sm mt-0.5 rounded-lg px-2 py-1"
                             style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                            {formatNumbersInString(s.narrative)}
                          </p>
                        )}
                        <p className="font-bold text-xl mt-1" style={{ color: 'var(--color-cyan)' }}>{formatNumbersInString(s.expression)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 개념 정리 */}
            <div className="rounded-xl px-4 py-3"
                 style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid rgba(255,209,102,0.35)', boxShadow: '0 0 12px rgba(255,209,102,0.08), var(--shadow-card)' }}>
              <p className="text-sm font-bold mb-1.5" style={{ color: 'var(--color-yellow)' }}>💡 핵심 개념</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{formatNumbersInString(problem.conceptExplanation)}</p>
            </div>

            <button
              className="btn-glow-green w-full min-h-[52px] rounded-xl text-lg font-bold transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#071a14' }}
              onClick={handleNextProblem}
            >
              다음 문제  →
            </button>
          </>
        ) : (
          <>
            {/* 오답 헤더 */}
            <div className="text-center pt-4 pb-4 rounded-2xl"
                 style={{ background: 'linear-gradient(160deg, rgba(255,107,107,0.1) 0%, rgba(255,107,107,0.03) 100%)', border: '1px solid rgba(255,107,107,0.2)' }}>
              <div className="text-6xl mb-2">🤔</div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>아쉬워요, 다시 도전해봐요!</h2>
            </div>

            {/* 내 답 vs 정답 비교 */}
            <div className="rounded-xl px-4 py-4"
                 style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <p className="text-xs font-bold mb-3" style={{ color: 'var(--color-text-muted)' }}>답 비교</p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 text-center rounded-xl py-3"
                     style={{ backgroundColor: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
                  <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--color-red)' }}>내 답</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-red)', fontFamily: 'var(--font-game)' }}>
                    {formatAnswer(userAnswer)}
                  </p>
                </div>
                <div className="text-xl shrink-0" style={{ color: 'var(--color-text-muted)' }}>→</div>
                <div className="flex-1 text-center rounded-xl py-3"
                     style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--color-green)' }}>바른 답</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-green)', fontFamily: 'var(--font-game)' }}>
                    {formatAnswer(problem.answer)}
                  </p>
                </div>
              </div>
            </div>

            {/* 개념 정리 */}
            <div className="rounded-xl px-4 py-3"
                 style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid rgba(255,209,102,0.35)', boxShadow: '0 0 12px rgba(255,209,102,0.08), var(--shadow-card)' }}>
              <p className="text-sm font-bold mb-1.5" style={{ color: 'var(--color-yellow)' }}>💡 이렇게 생각해봐요</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{formatNumbersInString(problem.conceptExplanation)}</p>
            </div>

            {/* 단계별 풀이 */}
            {(problem.steps?.length ?? 0) > 0 && (
              <div className="rounded-xl px-4 py-3"
                   style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-cyan)' }}>📚 올바른 풀이 과정</p>
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
                      <span className="shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                            style={{ background: 'linear-gradient(135deg, var(--color-btn-primary), var(--color-cyan))', color: '#fff' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{s.desc}</p>
                        {s.narrative && (
                          <p className="text-sm mt-0.5 rounded-lg px-2 py-1"
                             style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                            {formatNumbersInString(s.narrative)}
                          </p>
                        )}
                        <p className="font-bold text-xl mt-1" style={{ color: 'var(--color-cyan)' }}>{formatNumbersInString(s.expression)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                className="flex-1 min-h-[52px] rounded-xl text-base font-bold transition-all active:scale-[0.97]"
                style={{ backgroundColor: 'var(--color-bg-raised)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                onClick={() => navigate('/problem', { state: { problem } })}
              >
                🔁 다시 풀기
              </button>
              <button
                className="flex-1 min-h-[52px] rounded-xl text-base font-bold transition-all active:scale-[0.97]"
                style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                onClick={handleNextProblem}
              >
                건너뛰기  →
              </button>
            </div>

            {recommended && (
              <button
                className="btn-glow-green w-full min-h-[52px] rounded-xl text-base font-bold transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#071a14' }}
                onClick={() => navigate('/problem', { state: { problem: recommended } })}
              >
                🎯 비슷한 문제 풀어보기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
