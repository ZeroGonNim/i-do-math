import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { NoteIcon, TargetIcon, RetryIcon, FlameIcon, ChartIcon } from '@/shared/components/PixelIcons'
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'
import { useLiveQuery } from 'dexie-react-hooks'
import { MainTabHeader } from '@/shared/components/MainTabHeader'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useTheme } from '@/shared/hooks/useTheme'
import { db } from '@/shared/db/db'
import { formatNumber } from '@/shared/utils/format'
import { formatConceptName } from '@/shared/constants/problemConstants'
import type { LearningLog } from '@/types/learningLog'
import type { WrongNote } from '@/types/wrongNote'

export function StatsRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const theme = useTheme()
  const [activeSemester, setActiveSemester] = useState<0 | 1 | 2>(0) // 0: 전체, 1: 1학기, 2: 2학기

  const logs = useLiveQuery<LearningLog[]>(
    () => profile?.userId
      ? db.learningLogs.where('userId').equals(profile.userId).toArray()
      : Promise.resolve([]),
    [profile?.userId]
  )

  const wrongNotes = useLiveQuery<WrongNote[]>(
    () => profile?.userId
      ? db.wrongNotes.where('userId').equals(profile.userId).toArray()
      : Promise.resolve([]),
    [profile?.userId]
  )

  if (!profile) return null

  // 학기 필터링된 로그 데이터
  const filteredLogs = (logs ?? []).filter(l => 
    activeSemester === 0 || l.semester === activeSemester
  )

  const safeLog: LearningLog[] = filteredLogs
  const safeWrong: WrongNote[] = wrongNotes ?? []

  const total = safeLog.length
  const correct = safeLog.filter(l => l.isCorrect).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const wrongCount = safeWrong.filter(w => w.isWeak).length

  const conceptMap = new Map<string, { correct: number; total: number }>()
  for (const log of safeLog) {
    const prev = conceptMap.get(log.concept) ?? { correct: 0, total: 0 }
    conceptMap.set(log.concept, {
      correct: prev.correct + (log.isCorrect ? 1 : 0),
      total: prev.total + 1,
    })
  }
  const conceptStats = [...conceptMap.entries()]
    .map(([name, s]) => ({ name, ...s, rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>
      <MainTabHeader title="통계" />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-4">
        {/* 🛡️ 부모님 대시보드 진입 버튼 (신규) */}
        <button
          onClick={() => navigate('/parent')}
          className="w-full flex items-center justify-between px-5 py-4 border-2 active:scale-[0.98] transition-all"
          style={{ 
            backgroundColor: 'rgba(16,185,129,0.05)', 
            borderColor: `${theme.primary}40`,
            boxShadow: `0 4px 0 rgba(0,0,0,0.3)`
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}>
                부모님 대시보드
              </p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: '#64748b' }}>
                상세 분석 · 난이도 설정 · 시스템 관리
              </p>
            </div>
          </div>
          <span className="text-lg font-bold" style={{ color: theme.primary }}>›</span>
        </button>

        {/* 학기 필터 바 */}
        <div className="flex gap-2 mb-1">
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

        {/* 핵심 지표 — 3열 bento */}
        <div className="grid grid-cols-3 gap-2">
          {([
            { label: '총 문제', value: formatNumber(total), color: theme.primary, icon: <NoteIcon color={theme.primary} size={18} /> },
            { label: '정답률', value: `${accuracy}%`, color: '#ffe792', icon: <TargetIcon color="#ffe792" size={18} /> },
            { label: '오답 복습', value: formatNumber(wrongCount), color: '#ff716c', icon: <RetryIcon color="#ff716c" size={18} /> },
          ] as { label: string; value: string; color: string; icon: ReactNode }[]).map(item => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 py-4"
              style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
            >
              <span className="flex items-center justify-center">{item.icon}</span>
              <p
                className="text-lg font-bold leading-none"
                style={{ color: item.color, fontFamily: 'var(--font-game)' }}
              >
                {item.value}
              </p>
              <p
                className="text-[10px] font-bold"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* 스트릭 카드 */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
        >
          <div className="flex items-center gap-3">
            <FlameIcon color="#ff716c" size={24} />
            <div>
              <p
                className="text-[10px] font-bold mb-1"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
              >
                현재 연속 학습
              </p>
              <p
                className="text-2xl font-bold leading-none"
                style={{ color: '#ff716c', fontFamily: 'var(--font-game)' }}
              >
                {formatNumber(profile.currentStreak)}일
              </p>
            </div>
          </div>
          <div
            className="flex flex-col items-end"
            style={{ borderLeft: '1px solid #23233f', paddingLeft: '20px' }}
          >
            <p
              className="text-[10px] font-bold mb-1"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
            >
              최고 기록
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}
            >
              {formatNumber(profile.longestStreak)}일
            </p>
          </div>
        </div>

        {/* 난이도별 현황 */}
        {total > 0 && (() => {
          const difficulties = [
            { key: 'basic',     label: '기초', color: '#10b981' },
            { key: 'applied',   label: '실력', color: '#38bdf8' },
            { key: 'challenge', label: '심화', color: '#8b5cf6' },
          ]
          const hasAny = difficulties.some(d => safeLog.some(l => l.difficulty === d.key))
          if (!hasAny) return null
          return (
            <div style={{ backgroundColor: '#1d1d37', border: '1px solid #000' }}>
              <div className="flex items-center px-5 py-3" style={{ borderBottom: '1px solid #000' }}>
                <div className="w-1 h-4 mr-3" style={{ backgroundColor: theme.primary }} />
                <p className="text-sm font-bold" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
                  난이도별 현황
                </p>
              </div>
              <div className="px-5 py-4 space-y-4">
                {difficulties.map(({ key, color }) => {
                  const dLogs = safeLog.filter(l => l.difficulty === key)
                  if (dLogs.length === 0) return null
                  const dCorrect = dLogs.filter(l => l.isCorrect).length
                  const dRate = Math.round((dCorrect / dLogs.length) * 100)
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <DifficultyBadge difficulty={key as 'basic' | 'applied' | 'challenge'} />
                          <p className="text-xs font-medium" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>
                            {dLogs.length}문제
                          </p>
                        </div>
                        <p className="text-xs font-bold" style={{ color, fontFamily: 'var(--font-game)' }}>
                          {dRate}% ({dCorrect}/{dLogs.length})
                        </p>
                      </div>
                      <div className="w-full h-2 overflow-hidden" style={{ backgroundColor: '#000' }}>
                        <div className="h-full transition-all" style={{ width: `${dRate}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* 개념별 정답률 */}
        {conceptStats.length > 0 && (
          <div style={{ backgroundColor: '#1d1d37', border: '1px solid #000' }}>
            {/* 헤더 */}
            <div
              className="flex items-center px-5 py-3"
              style={{ borderBottom: '1px solid #000' }}
            >
              <div className="w-1 h-4 mr-3" style={{ backgroundColor: theme.primary }} />
              <p
                className="text-sm font-bold"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
              >
                개념별 정답률
              </p>
            </div>
            <div className="px-5 py-4 space-y-4">
              {conceptStats.map(c => {
                const barColor = c.rate >= 80 ? '#38bdf8' : c.rate >= 50 ? '#ffe792' : '#ff716c'
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', maxWidth: '55%' }}
                      >
                        {formatConceptName(c.name)}
                      </p>
                      <p
                        className="text-xs font-bold"
                        style={{ color: barColor, fontFamily: 'var(--font-game)' }}
                      >
                        {c.rate}% ({c.total}회)
                      </p>
                    </div>
                    <div
                      className="w-full h-2 overflow-hidden"
                      style={{ backgroundColor: '#000' }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{ width: `${c.rate}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 gap-5">
            <div className="flex items-center justify-center mb-1"><ChartIcon color="#64748b" size={64} /></div>
            <p
              className="text-center text-base leading-7"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
            >
              아직 학습 기록이 없어요.<br />문제를 풀면 통계가 나타나요!
            </p>
            <button
              className="flex items-center justify-center font-medium text-xl transition-all active:scale-[0.97]"
              style={{
                width: '240px',
                height: '60px',
                backgroundColor: theme.primary,
                color: '#000',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '-0.5px',
              }}
              onClick={() => navigate('/home')}
            >
              문제 풀러 가기
            </button>
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  )
}
