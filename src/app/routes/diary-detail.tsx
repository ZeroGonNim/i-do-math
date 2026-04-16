import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '@/shared/components/AppHeader'
import { useTheme } from '@/shared/hooks/useTheme'
import { formatConceptName } from '@/shared/constants/problemConstants'
import { loadProblems } from '@/shared/services/problemLoader'
import type { LearningLog } from '@/types/learningLog'
import type { Problem } from '@/types/problem'
import { TrophyIcon, BookIcon, MuscleIcon } from '@/shared/components/PixelIcons'
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'

interface DiaryDay {
  date: string
  logs: LearningLog[]
  totalProblems: number
  correctCount: number
  stars: number
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  return `${month}월 ${day}일 (${weekDays[d.getDay()]})`
}

function formatSeconds(sec: number): string {
  if (sec < 60) return `${sec}초`
  return `${Math.floor(sec / 60)}분 ${sec % 60}초`
}

function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60)
  if (m >= 60) return `${(m / 60).toFixed(1)}h`
  return `${m}m`
}

export function DiaryDetailRoute() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { date } = useParams<{ date: string }>()
  const location = useLocation()
  const day = location.state?.day as DiaryDay | undefined

  const [problemMap, setProblemMap] = useState<Map<string, Problem>>(new Map())

  // 문제 텍스트 로드 (캐시 활용)
  useEffect(() => {
    loadProblems()
      .then(data => {
        const map = new Map<string, Problem>()
        for (const p of data.problems) map.set(p.id, p)
        setProblemMap(map)
      })
      .catch(() => { /* 로드 실패 시 빈 map 유지 */ })
  }, [])

  if (!day) {
    // state 없이 직접 접근한 경우 일기 목록으로 되돌림
    navigate('/diary', { replace: true })
    return null
  }

  const totalTimeSec = day.logs.reduce((s, l) => s + (l.timeSpent ?? 0), 0)
  const accuracy = day.totalProblems > 0
    ? Math.round((day.correctCount / day.totalProblems) * 100)
    : 0

  // 개념별 그룹화 (등장 순서 유지)
  const conceptGroups: Map<string, LearningLog[]> = new Map()
  for (const log of [...day.logs].sort((a, b) => a.timestamp - b.timestamp)) {
    const arr = conceptGroups.get(log.concept) ?? []
    arr.push(log)
    conceptGroups.set(log.concept, arr)
  }

  const dateLabel = date ? formatDateLabel(date) : day.date

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>
      <AppHeader title={dateLabel} onBack={() => navigate('/diary')} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-24 space-y-4">

          {/* 요약 바 */}
          <div
            className="grid grid-cols-3"
            style={{ gap: '1px', backgroundColor: '#000', border: '1px solid #000' }}
          >
            {[
              { label: '문제 수', value: `${day.totalProblems}문제`, color: theme.primary },
              { label: '정답률', value: `${accuracy}%`, color: '#ffe792' },
              { label: '학습 시간', value: totalTimeSec > 0 ? formatMinutes(totalTimeSec) : '—', color: '#8b5cf6' },
            ].map(stat => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center py-4"
                style={{ backgroundColor: '#17172f' }}
              >
                <p className="text-[10px] font-bold mb-1" style={{ color: stat.color, fontFamily: 'var(--font-game)' }}>
                  {stat.label}
                </p>
                <p className="text-lg font-bold" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* 개념별 문제 그룹 */}
          {[...conceptGroups.entries()].map(([concept, logs]) => {
            const correct = logs.filter(l => l.isCorrect).length
            const hasWrong = correct < logs.length
            const groupColor = correct === logs.length ? theme.primary : hasWrong ? '#ff716c' : '#aaa8c3'

            return (
              <div
                key={concept}
                className="overflow-hidden"
                style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}
              >
                {/* 개념 헤더 */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid #23233f', borderLeft: `3px solid ${groupColor}` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
                      {formatConceptName(concept)}
                    </p>
                    <DifficultyBadge difficulty={logs[0].difficulty} showLabel={false} />
                  </div>
                  <p className="text-xs font-bold shrink-0 ml-2" style={{ color: groupColor, fontFamily: 'var(--font-game)' }}>
                    {correct}/{logs.length} 정답
                  </p>
                </div>

                {/* 개별 문제 로그 */}
                {logs.map((log, idx) => {
                  const problem = problemMap.get(log.problemId)
                  const questionText = problem?.question ?? null

                  return (
                    <div
                      key={log.logId}
                      className="flex items-start gap-3 px-4 py-3"
                      style={{
                        borderBottom: idx < logs.length - 1 ? '1px solid #23233f' : 'none',
                        backgroundColor: log.isCorrect ? 'transparent' : 'rgba(255,113,108,0.05)',
                      }}
                    >
                      {/* 정오답 아이콘 */}
                      <div
                        className="shrink-0 flex items-center justify-center mt-0.5"
                        style={{
                          width: '22px',
                          height: '22px',
                          backgroundColor: log.isCorrect ? `${theme.primary}25` : 'rgba(255,113,108,0.2)',
                          border: `1.5px solid ${log.isCorrect ? theme.primary : '#ff716c'}`,
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: log.isCorrect ? theme.primary : '#ff716c', lineHeight: 1 }}
                        >
                          {log.isCorrect ? '✓' : '✗'}
                        </span>
                      </div>

                      {/* 문제 내용 */}
                      <div className="flex-1 min-w-0">
                        {questionText ? (
                          <p
                            className="text-sm leading-snug"
                            style={{
                              color: log.isCorrect ? '#e5e3ff' : '#ffb3b0',
                              fontFamily: 'var(--font-sans)',
                              wordBreak: 'keep-all',
                            }}
                          >
                            {questionText.length > 60 ? questionText.slice(0, 60) + '…' : questionText}
                          </p>
                        ) : (
                          <p className="text-sm" style={{ color: '#64748b', fontFamily: 'var(--font-sans)' }}>
                            문제 #{idx + 1}
                          </p>
                        )}

                        {/* 메타 정보 */}
                        <div className="flex items-center gap-2 mt-1">
                          {log.timeSpent > 0 && (
                            <span className="text-[10px]" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>
                              {formatSeconds(log.timeSpent)}
                            </span>
                          )}
                          {log.hintUsed && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5"
                              style={{ backgroundColor: 'rgba(255,231,146,0.15)', color: '#ffe792', border: '1px solid rgba(255,231,146,0.3)', fontFamily: 'var(--font-game)' }}
                            >
                              힌트
                            </span>
                          )}
                          {log.retryCount > 0 && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5"
                              style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)', fontFamily: 'var(--font-game)' }}
                            >
                              {log.retryCount}회 재시도
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* 총평 카드 */}
          <div className="px-5 py-4" style={{ backgroundColor: '#111127', border: '1px solid #23233f' }}>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
                {accuracy >= 80
                  ? <TrophyIcon color="#ffe792" size={28} />
                  : accuracy >= 50
                    ? <BookIcon color={theme.primary} size={28} />
                    : <MuscleIcon color="#aaa8c3" size={28} />}
              </span>
              <div>
                <p className="text-sm font-bold" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
                  {accuracy >= 80 ? '훌륭한 하루!' : accuracy >= 50 ? '잘 하고 있어요!' : '더 열심히 도전!'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>
                  {day.totalProblems}문제 중 {day.correctCount}문제 정답 · +{day.stars}별 획득
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
