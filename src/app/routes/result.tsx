import { useEffect, useRef, useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useResultFeedback } from '@/features/result/hooks/useResultFeedback'
import { selectRecommendedProblem } from '@/shared/utils/recommendEngine'
import { loadProblems } from '@/shared/services/problemLoader'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useTheme } from '@/shared/hooks/useTheme'
import { LevelUpModal } from '@/shared/components/LevelUpModal'
import { DifficultyUnlockModal } from '@/shared/components/DifficultyUnlockModal'
import { CorrectOverlay } from '@/features/result/components/CorrectOverlay'
import { WrongOverlay } from '@/features/result/components/WrongOverlay'
import { formatNumber } from '@/shared/utils/format'
import type { Problem, Answer } from '@/types/problem'
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
import {
  WarningIcon, BoxIcon, CoinIcon, BookIcon,
  HintIcon, StarIcon,
} from '@/shared/components/PixelIcons'
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'
import { ProblemReportModal } from '@/shared/components/ProblemReportModal'
import { problemReportRepo } from '@/shared/db/problemReportRepo'
import type { ReportType } from '@/types/problemReport'

function buildVerticalData(problem: Problem | undefined) {
  if (!problem || !problem.steps?.length) return null
  
  // 규칙 찾기나 문장제 문제에서는 자동 세로셈을 생성하지 않음 (논리 오류 방지)
  if (problem.unit === '규칙 찾기' || problem.type !== 'calculation') return null
  if (problem.question.includes('규칙') || problem.question.includes('각각')) return null

  const match = problem.question.match(/([\d,]+)\s*([×÷])\s*([\d,]+)/)
  if (!match) return null

  const expression = `${formatNumber(match[1])} ${match[2]} ${formatNumber(match[3])}`
  const lastParts = problem.steps[problem.steps.length - 1].expression.split('=').map(s => s.trim())
  const result = formatNumber(lastParts[lastParts.length - 1])

  const vsteps = problem.steps.slice(0, -1).map(s => {
    const parts = s.expression.split('=').map(p => p.trim())
    return { value: formatNumber(parts[parts.length - 1]), label: parts[0] }
  })

  return { expression, steps: vsteps.length ? vsteps : undefined, result }
}

function answerFontSize(str: string): string {
  const len = str.replace(/[^0-9a-zA-Zㄱ-ㅎ가-힣]/g, '').length
  if (len <= 5)  return '22px'
  if (len <= 8)  return '18px'
  if (len <= 11) return '15px'
  return '12px'
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
  const theme = useTheme()

  const [recommended, setRecommended] = useState<Problem | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showDifficultyUnlock, setShowDifficultyUnlock] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showBoxDrop, setShowBoxDrop] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportDone, setReportDone] = useState(false)
  
  // 결과 화면 상단 이미지 랜덤 선택 (한 번 정해지면 해당 화면에서 유지)
  const [randomIdx] = useState(() => Math.floor(Math.random() * 5) + 1)

  // state 데이터 안전하게 추출
  const problem = state?.problem as Problem | undefined
  const isCorrect = state?.isCorrect ?? false
  const userAnswer = state?.userAnswer as Answer | undefined
  const timeSpent = state?.timeSpent ?? 0
  const hintUsed = state?.hintUsed ?? false
  const inputSequence = state?.inputSequence ?? []
  const drawingData = state?.drawingData as string | undefined
  const isRemind = state?.isRemind ?? false
  const retryCount = state?.retryCount ?? 0

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
    retryCount,
  }

  const { leveledUp, newLevel, difficultyUnlocked, saveError, boxDropped, xpGained, starsGained } = useResultFeedback(feedbackArgs)

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
          difficultyMode: currentProfile.difficultyMode,
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

  async function handleReport(type: ReportType) {
    if (!problem) return
    await problemReportRepo.add({
      reportId: `${problem.id}-${Date.now()}`,
      problemId: problem.id,
      problemUnit: problem.unit,
      reportType: type,
      userAnswer: userAnswer ? formatAnswer(userAnswer) : '?',
      correctAnswer: problem?.answer ? formatAnswer(problem.answer) : '?',
      timestamp: Date.now(),
      status: 'pending',
    })
    setReportDone(true)
  }

  const handleNextProblem = () => {
    if (recommended) {
      navigate('/problem', { state: { problem: recommended }, replace: true })
    } else {
      navigate('/home', { replace: true })
    }
  }

  const isDraw = problem.answerType === 'draw'
  
  // 성취도 계산 (별점 및 문구)
  const performance = (() => {
    const isPerfect = retryCount === 0 && !hintUsed
    const streak = profile?.currentStreak ?? 0

    if (isPerfect && streak >= 3) return { stars: 5, label: '완벽한 연승!', color: '#ffe792' }
    if (isPerfect) return { stars: 4, label: '대단해요!', color: '#38bdf8' }
    if (retryCount === 0 && hintUsed || retryCount === 1) return { stars: 3, label: '좋은 시도예요!', color: '#8b5cf6' }
    return { stars: 2, label: '끈기 있는 승리!', color: '#ff716c' }
  })()
  
  // 난이도별 기본 별 계산 (기초:10, 실력:20, 심화:30 / 힌트 시 절반)
  const calculateDefaultStars = () => {
    if (!problem) return 10
    const base = problem.difficulty === 'challenge' ? 30 : problem.difficulty === 'applied' ? 20 : 10
    return (hintUsed || retryCount > 0) ? Math.floor(base / 2) : base
  }

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>
      {saveError && (
        <div className="fixed top-4 left-0 right-0 mx-4 z-50 px-4 py-3 text-sm text-center font-medium text-white shadow-lg flex items-center justify-center gap-1.5"
             style={{ backgroundColor: 'rgba(220,38,38,0.9)' }}>
          <WarningIcon color="#fff" size={14} /> 결과 저장에 실패했어요. 학습 기록이 누락될 수 있어요.
        </div>
      )}
      <AppHeader title="수학 퀘스트" onBack={() => navigate('/home')} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
        {showOverlay && isCorrect && (
          <CorrectOverlay
            stars={starsGained > 0 ? starsGained : calculateDefaultStars()}
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
            <div className="w-full max-w-sm p-8 text-center border-4 border-[#8b5cf6]"
                 style={{ backgroundColor: '#17172f', boxShadow: '0 6px 0 #000000, 0 0 20px rgba(139,92,246,0.3)' }}>
              <div className="flex items-center justify-center mb-3"><BoxIcon color="#8b5cf6" size={56} /></div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#e5e3ff' }}>박스 획득!</h2>
              <p className="text-sm mb-6" style={{ color: '#aaa8c3' }}>
                정답 보상으로 박스를 획득했어요!<br />지금 바로 열어볼까요?
              </p>
              <button
                onClick={() => navigate('/box-open', { replace: true })}
                className="w-full min-h-[52px] text-lg font-bold transition-opacity active:opacity-80 mb-3 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#8b5cf6', color: '#fff' }}
              >
                <BoxIcon color="#fff" size={20} /> 지금 열기
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
            {isDraw || problem.answerType === 'text' ? (
              /* ── 필기/그리기 전용 자가 진단 결과 ── */
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="px-4 py-1 animate-pulse" style={{ backgroundColor: theme.primary }}>
                    <span className="text-sm font-bold" style={{ color: '#000', fontFamily: 'var(--font-game)', letterSpacing: '1.4px' }}>퀘스트 완료</span>
                  </div>
                  <p className="text-4xl font-bold text-center" style={{ color: theme.primary, fontFamily: 'var(--font-sans)', letterSpacing: '-0.9px' }}>결과 비교</p>
                  <p className="text-lg text-center" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>{isDraw ? '두 그림을 비교해 보세요' : '내 답과 정답을 비교해 보세요'}</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold mb-2 text-[#aaa8c3]">내가 쓴 답</p>
                    <div className="w-full flex items-center justify-center overflow-hidden border-4 border-[#23233f]" style={{ height: '220px', backgroundColor: '#000' }}>
                      {drawingData ? <img src={drawingData} alt="내 필기" className="max-w-full max-h-full object-contain" /> : <span className="text-xs italic" style={{ color: '#64748b' }}>작성 내용 없음</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-2 text-[#ffe792]">모범 정답</p>
                    <div className="w-full flex items-center justify-center overflow-hidden bg-white border-4 border-[#23233f]" style={{ height: '220px' }}>
                      {isDraw && isDrawAnswer(problem.answer) ? (
                        <img src={problem.answer.referenceImage.startsWith('http') ? problem.answer.referenceImage : `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${problem.answer.referenceImage.replace(/^\//, '')}`} alt="정답 그림" className="max-w-full max-h-full object-contain" />
                      ) : isTextAnswer(problem.answer) ? (
                        <div className="p-6 text-center flex items-center justify-center h-full">
                          <p className="text-xl font-bold text-black leading-relaxed whitespace-pre-wrap">{problem.answer.text}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 px-6 py-6 border-4 border-[#23233f]" style={{ backgroundColor: '#17172f' }}>
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-3 bg-[#000] border-2 border-[#ffe792] flex-1 text-center">
                      <p className="text-[10px] text-[#64748b] mb-1">획득한 별</p>
                      <p className="text-sm font-bold text-[#ffe792]">+{formatNumber(starsGained || calculateDefaultStars())} ★</p>
                    </div>
                    <div className="p-3 bg-[#000] border-2 border-[#38bdf8] flex-1 text-center">
                      <p className="text-[10px] text-[#64748b] mb-1">경험치</p>
                      <p className="text-sm font-bold text-[#38bdf8]">+{formatNumber(xpGained > 0 ? xpGained : 10)} XP</p>
                    </div>
                  </div>
                  <p className="text-sm text-center leading-6 text-[#aaa8c3]">{problem.conceptExplanation}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="w-full h-16 font-bold text-xl transition-all active:scale-[0.98] border-4 border-[#ff9f43] text-[#ff9f43]" onClick={() => navigate('/problem', { state: { problem } })}>다시 써볼래</button>
                  <button className="w-full h-16 font-bold text-xl transition-all active:scale-[0.98]" style={{ backgroundColor: theme.primary, color: '#000' }} onClick={handleNextProblem}>맞게 썼어</button>
                </div>
              </div>
            ) : (
              /* ── 일반 문제 전용 정답 뷰 ── */
              <>
                <div className="text-center pt-6 pb-2 flex flex-col items-center">
                  <div className="mb-3"><DifficultyBadge difficulty={problem.difficulty} /></div>
                  <div className="w-32 h-32 mb-4 flex items-center justify-center border-4 border-[#ffe792] overflow-hidden" style={{ backgroundColor: '#1d1d37' }}>
                    <img src={`/images/thumbnail/Hero${randomIdx}.png`} alt="승리" className="w-full h-full object-cover animate-in fade-in zoom-in-90 duration-500" />
                  </div>
                  <h2 className="text-[40px] font-bold" style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-1.5px' }}>정답이에요!</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col px-4 py-4 gap-1 border-4 border-[#23233f]" style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                    <p className="text-xs font-bold flex items-center gap-1" style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}><StarIcon color="#ffe792" size={10} /> 별</p>
                    <p className="font-bold text-xl" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>+{formatNumber(starsGained || calculateDefaultStars())} ★</p>
                  </div>
                  <div className="flex flex-col px-4 py-4 gap-1 border-4 border-[#23233f]" style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                    <p className="text-xs font-bold flex items-center gap-1" style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}><CoinIcon color={theme.primary} size={10} /> 경험치</p>
                    <p className="font-bold text-xl" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>+{formatNumber(xpGained > 0 ? xpGained : 10)} XP</p>
                  </div>
                </div>

                <div className="flex flex-col items-center py-4 gap-2 border-4 border-[#23233f]" style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                  <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map(i => (<StarIcon key={i} color={i <= performance.stars ? '#ffe792' : '#23233f'} size={22} />))}</div>
                  <p className="text-sm font-bold" style={{ color: performance.color, fontFamily: 'var(--font-game)' }}>{performance.label}</p>
                </div>

                {(problem.steps?.length ?? 0) > 0 && (
                  <div className="px-4 py-3 border-4 border-[#23233f]" style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                    <p className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: theme.primary }}><BookIcon color={theme.primary} size={12} /> 풀이 과정</p>
                    <div className="space-y-3">
                      {problem.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="shrink-0 w-6 h-6 text-xs flex items-center justify-center font-bold" style={{ background: 'linear-gradient(135deg, #10b981, #38bdf8)', color: '#fff' }}>{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: '#aaa8c3' }}>{s.desc}</p>
                            <p className="font-bold text-xl mt-1" style={{ color: '#38bdf8' }}>{s.expression}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="px-4 py-3 border-4" style={{ backgroundColor: '#1d1d37', borderColor: 'rgba(255,209,102,0.35)', boxShadow: '0 4px 0 #000000' }}>
                  <p className="text-sm font-bold mb-1.5 flex items-center gap-1.5" style={{ color: '#ffe792' }}><HintIcon color="#ffe792" size={12} /> 핵심 개념</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#aaa8c3' }}>{problem.conceptExplanation}</p>
                </div>

                <button className="w-full min-h-[56px] text-lg font-bold transition-all active:scale-[0.98]" style={{ backgroundColor: theme.primary, color: '#000' }} onClick={handleNextProblem}>다음 문제 →</button>
              </>
            )}
          </>
        ) : (
          <>
            {/* 오답 헤더 */}
            <div className="flex flex-col items-center pt-6 pb-2 gap-3">
              <DifficultyBadge difficulty={problem.difficulty} />
              <div className="relative">
                <div
                  className="flex items-center justify-center border-4 border-[#ff716c] overflow-hidden"
                  style={{ width: '120px', height: '120px', backgroundColor: '#1d1d37', boxShadow: '0 0 20px rgba(255,113,108,0.3)' }}
                >
                  <img 
                    src={`/images/thumbnail/Monster${randomIdx}.png`} 
                    alt="강력한 몬스터" 
                    className="w-full h-full object-cover animate-in fade-in slide-in-from-bottom-4 duration-500"
                  />
                </div>
                <div
                  className="absolute -top-2 -right-2 px-2 py-1 z-10"
                  style={{ backgroundColor: '#ff4747', boxShadow: '0 2px 0 #000' }}
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
              <div className="flex flex-col px-4 py-4 gap-1 border-4 border-[#23233f]" style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                <p className="text-xs font-bold" style={{ color: '#ff716c', fontFamily: 'var(--font-game)' }}>내 답</p>
                <p className="font-bold leading-tight" style={{ color: '#ff716c', fontFamily: 'var(--font-game)', fontSize: answerFontSize(formatAnswer(userAnswer)), wordBreak: 'break-all' }}>
                  {formatAnswer(userAnswer)}
                </p>
              </div>
              <div className="flex flex-col px-4 py-4 gap-1 border-4 border-[#23233f]" style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                <p className="text-xs font-bold" style={{ color: '#38bdf8', fontFamily: 'var(--font-game)' }}>정답</p>
                <p className="font-bold leading-tight" style={{ color: '#38bdf8', fontFamily: 'var(--font-game)', fontSize: retryCount < 1 ? '22px' : answerFontSize(formatAnswer(problem.answer)), wordBreak: 'break-all' }}>
                  {retryCount < 1 ? '?' : formatAnswer(problem.answer)}
                </p>
              </div>
            </div>

            {/* 실수 유형 분석 */}
            {(() => {
              const mistakeType = classifyMistake(problem.type, problem.answer, userAnswer, timeSpent)
              const label = mistakeType ? MISTAKE_LABELS[mistakeType] : null
              return label ? (
                <div className="flex items-center justify-between px-4 py-3 border-4 border-[#23233f]" style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                  <p className="text-sm font-bold" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>실수 유형 분석</p>
                  <span className="px-3 py-1 text-xs font-bold" style={{ backgroundColor: '#8b5cf6', color: '#fff', fontFamily: 'var(--font-game)' }}>
                    {label}
                  </span>
                </div>
              ) : null
            })()}

            {/* 단계별 풀이 */}
            {(problem.steps?.length ?? 0) > 0 && (
              <div className="px-4 py-3 border-4 border-[#23233f]"
                   style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000000' }}>
                <p className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: '#38bdf8' }}><BookIcon color="#38bdf8" size={12} /> 풀이 과정 보기</p>
                {(() => {
                  const vd = buildVerticalData(problem)
                  return vd ? (
                    <VerticalArithmetic
                      expression={vd.expression}
                      steps={vd.steps}
                      result={retryCount < 1 ? '?' : vd.result}
                      className="mb-3"
                    />
                  ) : null
                })()}
                <div className="space-y-3">
                  {problem.steps.map((s, i) => {
                    const isLastStep = i === problem.steps.length - 1
                    let displayExpression = s.expression
                    let displayNarrative = s.narrative ?? ''
                    
                    // 1차 시도 실패 시 철저한 마스킹 처리
                    if (retryCount < 1) {
                      const actualAnswerStr = formatAnswer(problem.answer).replace(/,/g, '')
                      const actualAnswerNum = isIntegerAnswer(problem.answer) ? String(problem.answer.value) : ''
                      
                      // 1. 수식 마스킹: '=' 뒤의 정답 가리기
                      if (isLastStep && displayExpression.includes('=')) {
                        const parts = displayExpression.split('=')
                        displayExpression = parts[0] + '= ?'
                      }
                      
                      // 2. 텍스트/수식 내 정답 문자열 직접 마스킹 (역추적)
                      if (actualAnswerStr && actualAnswerStr !== '—') {
                        // 정답이 텍스트나 수식에 직접 포함되어 있다면 '?'로 치환
                        const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                        const re = new RegExp(escapeRegExp(actualAnswerStr), 'g')
                        displayExpression = displayExpression.replace(re, '?')
                        displayNarrative = displayNarrative.replace(re, '?')
                        
                        if (actualAnswerNum) {
                          const reNum = new RegExp(`\\b${actualAnswerNum}\\b`, 'g')
                          displayExpression = displayExpression.replace(reNum, '?')
                          displayNarrative = displayNarrative.replace(reNum, '?')
                        }
                      }

                      // 3. 문장제 결과 문구 보호 (정답, 답은, 결과는 등 뒤의 숫자 가림)
                      const phrases = ['정답은', '답은', '결과는', '값은']
                      phrases.forEach(phrase => {
                        if (displayNarrative.includes(phrase)) {
                          displayNarrative = displayNarrative.replace(new RegExp(`${phrase}\\s*\\d+`, 'g'), `${phrase} ?`)
                        }
                      })
                    }

                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 text-xs flex items-center justify-center font-bold"
                              style={{ backgroundColor: theme.primary, color: '#000' }}>
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: '#aaa8c3' }}>{s.desc}</p>
                          {displayNarrative && (
                            <p className="text-sm mt-0.5 px-2 py-1"
                               style={{ backgroundColor: '#23233f', color: '#aaa8c3', border: '1px solid #23233f' }}>
                              {displayNarrative}
                            </p>
                          )}
                          <p className="font-bold text-xl mt-1" style={{ color: theme.primary }}>{displayExpression}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {retryCount < 1 && (
                  <p className="text-xs mt-4 text-center font-bold" style={{ color: '#ff716c' }}>
                    풀이 과정을 잘 보고 다시 도전해봐!
                  </p>
                )}
              </div>
            )}

            {/* 오늘의 팁 */}
            {(() => {
              let displayTip = problem.conceptExplanation
              if (retryCount < 1) {
                const actualAnswerStr = formatAnswer(problem.answer).replace(/,/g, '')
                if (actualAnswerStr && actualAnswerStr !== '—') {
                  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                  const re = new RegExp(escapeRegExp(actualAnswerStr), 'g')
                  displayTip = displayTip.replace(re, '?')
                }
                const phrases = ['정답은', '답은', '결과는', '값은']
                phrases.forEach(phrase => {
                  if (displayTip.includes(phrase)) {
                    displayTip = displayTip.replace(new RegExp(`${phrase}\\s*\\d+`, 'g'), `${phrase} ?`)
                  }
                })
              }
              return (
                <div className="px-4 py-4 flex gap-3 items-start border-4"
                     style={{ backgroundColor: 'rgba(255,209,102,0.08)', borderColor: 'rgba(255,209,102,0.3)', boxShadow: '0 4px 0 #000000' }}>
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#ffe792' }}>
                    <HintIcon color="#5b4b00" size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}>오늘의 팁</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#aaa8c3' }}>{displayTip}</p>
                  </div>
                </div>
              )
            })()}


            <button
              className="w-full min-h-[56px] text-lg font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: '#ff9f43', color: '#fff', fontFamily: 'var(--font-sans)' }}
              onClick={() => navigate('/problem', { state: { problem, retryCount: retryCount + 1 } })}
            >
              {retryCount < 1 ? '다시 도전하기!' : '한 번 더 도전!'}
            </button>

            {/* 문제 오류 신고 */}
            {!reportDone ? (
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full py-2 text-xs text-center transition-opacity active:opacity-60"
                style={{ color: '#46465c' }}
              >
                이 문제에 오류가 있나요? 신고하기
              </button>
            ) : (
              <p className="w-full py-2 text-xs text-center" style={{ color: '#10b981' }}>
                신고가 접수되었어요. 감사해요!
              </p>
            )}
          </>
        )}
      </div>
      {showReportModal && (
        <ProblemReportModal
          onSubmit={async (type) => {
            await handleReport(type)
            setShowReportModal(false)
          }}
          onClose={() => setShowReportModal(false)}
        />
      )}
      <BottomNavBar />
    </div>
  )
}
