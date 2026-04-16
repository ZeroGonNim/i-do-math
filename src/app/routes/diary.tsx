import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useTheme } from '@/shared/hooks/useTheme'
import { useDiary } from '@/features/diary/hooks/useDiary'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { MainTabHeader } from '@/shared/components/MainTabHeader'
import { formatConceptName } from '@/shared/constants/problemConstants'
import { BookIcon, LockIcon, PlayIcon, HintIcon, TrophyIcon } from '@/shared/components/PixelIcons'
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'

function getCurrentMonthLabel() {
  const d = new Date()
  return `${d.getMonth() + 1}월 학습 기록`
}

function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60)
  if (m >= 60) return `${(m / 60).toFixed(1)}h`
  return `${m}m`
}

export function DiaryRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const theme = useTheme()
  const [activeSemester, setActiveSemester] = useState<0 | 1 | 2>(0) // 0: 전체, 1: 1학기, 2: 2학기

  const days = useDiary(profile?.userId)

  // 학기 필터링된 일기 데이터
  const filteredDays = useMemo(() => {
    if (!days) return []
    if (activeSemester === 0) return days
    return days.map(day => ({
      ...day,
      logs: day.logs.filter(l => l.semester === activeSemester)
    })).filter(day => day.logs.length > 0)
  }, [days, activeSemester])

  // Monthly stats
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthDays = filteredDays.filter(d => d.date.startsWith(thisMonth))

  const totalProblems = monthDays.reduce((s, d) => s + d.logs.length, 0)
  const totalCorrect = monthDays.reduce((s, d) => s + d.logs.filter(l => l.isCorrect).length, 0)
  const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0
  const totalStars = monthDays.reduce((s, d) => s + d.stars, 0)
  const totalTimeSec = monthDays.reduce(
    (s, d) => s + d.logs.reduce((ls, l) => ls + (l.timeSpent ?? 0), 0),
    0,
  )

  // 난이도 분포 (이번 달)
  const diffBreakdown = { basic: 0, applied: 0, challenge: 0 }
  for (const day of monthDays) {
    for (const log of day.logs) {
      if (log.difficulty === 'basic') diffBreakdown.basic++
      else if (log.difficulty === 'applied') diffBreakdown.applied++
      else if (log.difficulty === 'challenge') diffBreakdown.challenge++
    }
  }

  const isEmpty = !days || days.length === 0
  const [showAll, setShowAll] = useState(false)
  // 최종 노출 데이터
  const hasOtherMonths = filteredDays.length > monthDays.length
  const displayedDays = showAll ? filteredDays : monthDays

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>

      <MainTabHeader title="수학 일기" />

      <div className="flex-1 overflow-y-auto">
        {/* 학기 필터 바 */}
        {!isEmpty && (
          <div className="flex px-5 pt-4 gap-2">
            {([
              { id: 0, label: '전체' },
              { id: 1, label: '1학기' },
              { id: 2, label: '2학기' }
            ] as const).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSemester(item.id)}
                className="flex-1 py-2 text-[10px] font-bold border-2 transition-all"
                style={{
                  backgroundColor: activeSemester === item.id ? theme.primary : '#17172f',
                  color: activeSemester === item.id ? '#000' : '#64748b',
                  borderColor: activeSemester === item.id ? theme.primary : '#23233f',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="px-5 pt-5 pb-24 space-y-5">

          {/* Dashboard Header */}
          <div>
            <h1
              className="text-[30px] font-bold leading-[36px] tracking-[-1.5px]"
              style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}
            >
              수학 일기
            </h1>
            <p
              className="text-sm font-medium mt-1"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
            >
              {getCurrentMonthLabel()}
            </p>
          </div>

          {/* Stats Overview Bento */}
          {!isEmpty && (
            <div className="space-y-2">
              {/* Main card: accuracy + progress bar */}
              <div
                className="px-6 py-5"
                style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
              >
                <p
                  className="text-xs font-bold mb-3"
                  style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}
                >
                  이번 달 현황
                </p>
                <div className="flex items-baseline gap-3 mb-3">
                  <span
                    className="text-[48px] font-bold leading-[48px]"
                    style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
                  >
                    {accuracy}%
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}
                  >
                    전체 정확도
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-4 rounded-sm overflow-hidden" style={{ backgroundColor: '#000' }}>
                  <div
                    className="h-full rounded-sm transition-all"
                    style={{
                      width: `${accuracy}%`,
                      backgroundColor: theme.primary,
                      boxShadow: `0 0 8px ${theme.primary}60`,
                    }}
                  />
                </div>
              </div>

              {/* Side cards: 학습시간 + 획득별 */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="px-4 py-4"
                  style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
                >
                  <p
                    className="text-[10px] font-bold mb-2"
                    style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}
                  >
                    학습 시간
                  </p>
                  <p
                    className="text-xl font-bold leading-[28px]"
                    style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
                  >
                    {totalTimeSec > 0 ? formatMinutes(totalTimeSec) : '—'}
                  </p>
                </div>
                <div
                  className="px-4 py-4"
                  style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
                >
                  <p
                    className="text-[10px] font-bold mb-2"
                    style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}
                  >
                    획득한 별
                  </p>
                  <p
                    className="text-xl font-bold leading-[28px]"
                    style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
                  >
                    {totalStars.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 난이도 분포 */}
              {(diffBreakdown.basic + diffBreakdown.applied + diffBreakdown.challenge) > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'basic',     count: diffBreakdown.basic },
                    { key: 'applied',   count: diffBreakdown.applied },
                    { key: 'challenge', count: diffBreakdown.challenge },
                  ] as { key: 'basic' | 'applied' | 'challenge'; count: number }[]).map(d => (
                    <div
                      key={d.key}
                      className="px-4 py-3 flex flex-col gap-1.5"
                      style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
                    >
                      <DifficultyBadge difficulty={d.key} />
                      <p
                        className="text-base font-bold leading-none"
                        style={{ color: d.count > 0 ? '#e5e3ff' : '#64748b', fontFamily: 'var(--font-game)' }}
                      >
                        {d.count}문제
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center pt-10 gap-6 pb-4">
              {/* Pixel book icon with lock */}
              <div className="relative flex items-center justify-center">
                <div
                  className="flex items-center justify-center"
                  style={{ width: '108px', height: '108px', backgroundColor: '#17172f', border: '2px solid #23233f' }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ width: '80px', height: '80px', backgroundColor: '#7c3aed' }}
                  >
                    <BookIcon color="#c4b5fd" size={52} />
                  </div>
                </div>
                <div
                  className="absolute -top-2 -right-2 flex items-center justify-center"
                  style={{ width: '36px', height: '36px', backgroundColor: '#ffe792' }}
                >
                  <LockIcon color="#000" size={18} />
                </div>
              </div>

              {/* Title */}
              <p
                className="text-[32px] font-bold text-center leading-tight"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.8px' }}
              >
                아직 기록이 없어요
              </p>

              {/* Description */}
              <p
                className="text-base text-center leading-7"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
              >
                문제를 풀면 멋진{' '}
                <span style={{ color: theme.primary }}>수학 일기</span>가{' '}
                자동으로 생겨요!
              </p>

              {/* CTA */}
              <button
                className="w-full flex items-center justify-center gap-2 text-xl font-bold transition-all active:scale-[0.97]"
                style={{
                  height: '68px',
                  backgroundColor: theme.primary,
                  color: '#000',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '-0.5px',
                }}
                onClick={() => navigate('/home')}
              >
                <PlayIcon color="#000" size={16} /> 문제 풀러 가기
              </button>

              {/* 학습 팁 */}
              <div
                className="w-full px-4 py-4 flex gap-4"
                style={{
                  backgroundColor: '#111127',
                  borderLeft: `3px solid ${theme.primary}`,
                  border: '1px solid #23233f',
                  borderLeftWidth: '3px',
                  borderLeftColor: theme.primary,
                }}
              >
                <div>
                  <p
                    className="text-xs font-bold mb-1 flex items-center gap-1"
                    style={{ color: theme.primary, fontFamily: 'var(--font-sans)' }}
                  >
                    <HintIcon color={theme.primary} size={10} /> 학습 팁
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
                  >
                    일기를 쓰면 레벨업 경험치(XP)를 2배로 받을 수 있어요!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Daily Logs Header */}
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-bold"
                  style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
                >
                  {showAll ? '전체 기록' : `${now.getMonth() + 1}월 기록`}
                </h2>
                {hasOtherMonths && (
                  <button
                    onClick={() => setShowAll(prev => !prev)}
                    className="text-xs font-bold active:opacity-60 transition-opacity"
                    style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}
                  >
                    {showAll ? '접기' : '전체 보기'}
                  </button>
                )}
              </div>

              {/* Day Cards */}
              {displayedDays.map((day, dayIdx) => {
                const dayAccuracy = day.totalProblems > 0
                  ? Math.round((day.correctCount / day.totalProblems) * 100)
                  : 0
                const dayTimeSec = day.logs.reduce((s, l) => s + (l.timeSpent ?? 0), 0)
                const isNew = dayIdx === 0

                // Concept groups within this day
                const conceptMap = new Map<string, { correct: number; total: number }>()
                for (const log of day.logs) {
                  const p = conceptMap.get(log.concept) ?? { correct: 0, total: 0 }
                  conceptMap.set(log.concept, {
                    correct: p.correct + (log.isCorrect ? 1 : 0),
                    total: p.total + 1,
                  })
                }

                // Tags
                const weakConcepts = [...conceptMap.entries()]
                  .filter(([, s]) => s.total >= 1 && s.correct < s.total)
                  .map(([c]) => c)
                  .slice(0, 2)
                const perfectConcepts = [...conceptMap.entries()]
                  .filter(([, s]) => s.total >= 2 && s.correct === s.total)
                  .map(([c]) => c)
                  .slice(0, 2)

                // Primary concept for card title
                const primaryConcept = [...conceptMap.entries()].sort(
                  ([, a], [, b]) => b.total - a.total,
                )[0]?.[0] ?? ''

                // Primary difficulty
                const diffMap: Record<string, number> = {}
                for (const log of day.logs) {
                  diffMap[log.difficulty] = (diffMap[log.difficulty] ?? 0) + 1
                }
                const primaryDiff = Object.entries(diffMap).sort(([,a],[,b]) => b - a)[0]?.[0] ?? 'basic'
                {/* ... (removed unused DIFF_CONFIG) */}
                // const diffCfg = DIFF_CONFIG[primaryDiff as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG.basic
                return (
                  <button
                    key={day.date}
                    className="w-full overflow-hidden text-left active:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#1d1d37', border: '1px solid #000' }}
                    onClick={() => navigate(`/diary/${day.date}`, { state: { day } })}
                  >
                    {/* Card header */}
                    <div className="relative px-5 pt-5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className="text-[10px] font-bold"
                          style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
                        >
                          {day.date}
                        </p>
                        <DifficultyBadge difficulty={primaryDiff as 'basic' | 'applied' | 'challenge'} />
                      </div>
                      <p
                        className="text-xl font-bold leading-[28px] tracking-[-0.5px]"
                        style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
                      >
                        {formatConceptName(primaryConcept)}
                      </p>
                      {isNew && (
                        <div
                          className="absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold"
                          style={{ backgroundColor: '#ffe792', color: '#000' }}
                        >
                          신규
                        </div>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 mx-5 mb-3 overflow-hidden" style={{ gap: '1px', backgroundColor: '#000' }}>
                      {[
                        { label: '정확도', value: `${dayAccuracy}%`, color: '#38bdf8' },
                        { label: '시간', value: formatMinutes(dayTimeSec), color: '#8b5cf6' },
                        { label: '별', value: `+${day.stars}`, color: '#ffe792' },
                      ].map(stat => (
                        <div
                          key={stat.label}
                          className="flex flex-col items-center justify-center py-3"
                          style={{ backgroundColor: '#000' }}
                        >
                          <p
                            className="text-[10px] font-bold mb-1"
                            style={{ color: stat.color, fontFamily: 'var(--font-game)' }}
                          >
                            {stat.label}
                          </p>
                          <p
                            className="text-lg font-bold leading-[28px]"
                            style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
                          >
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    {(weakConcepts.length > 0 || perfectConcepts.length > 0) && (
                      <div className="px-5 pb-4 space-y-2">
                        {weakConcepts.length > 0 && (
                          <div>
                            <p
                              className="text-[10px] font-bold mb-1"
                              style={{ color: '#ff716c', fontFamily: 'var(--font-game)' }}
                            >
                              취약점 발견
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {weakConcepts.map(c => (
                                <span
                                  key={c}
                                  className="text-[10px] font-bold px-2.5 py-1 rounded"
                                  style={{
                                    backgroundColor: 'rgba(159,5,25,0.2)',
                                    color: '#ff716c',
                                    border: '1px solid rgba(255,113,108,0.3)',
                                    fontFamily: 'var(--font-game)',
                                  }}
                                >
                                  {formatConceptName(c)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {perfectConcepts.length > 0 && (
                          <div>
                            <p
                              className="text-[10px] font-bold mb-1"
                              style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}
                            >
                              완벽 습득
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {perfectConcepts.map(c => (
                                <span
                                  key={c}
                                  className="text-[10px] font-bold px-2.5 py-1 rounded"
                                  style={{
                                    backgroundColor: `${theme.primary}15`,
                                    color: theme.primary,
                                    border: `1px solid ${theme.primary}40`,
                                    fontFamily: 'var(--font-game)',
                                  }}
                                >
                                  {formatConceptName(c)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}

              {/* Rewards Section */}
              {totalStars > 0 && (
                <div
                  className="p-5"
                  style={{ backgroundColor: '#111127', border: '1px solid #000' }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#1d1d37', border: '1.5px solid #ffe792' }}
                    >
                      <TrophyIcon color="#ffe792" size={32} />
                    </div>
                    <div>
                      <h3
                        className="text-base font-bold mb-1"
                        style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}
                      >
                        완전 정복!
                      </h3>
                      <p
                        className="text-xs font-bold tracking-[-0.6px]"
                        style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
                      >
                        이번 달 {totalStars.toLocaleString()}별을 획득했어요!
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-full h-11 font-bold text-sm tracking-[1px] transition-all active:scale-[0.97]"
                    style={{
                      backgroundColor: '#ffe792',
                      color: '#655400',
                      fontFamily: 'var(--font-sans)',
                    }}
                    onClick={() => navigate('/settings')}
                  >
                    보상 사용하기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  )
}
