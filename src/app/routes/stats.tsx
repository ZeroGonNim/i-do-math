import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { AppHeader } from '@/shared/components/AppHeader'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { db } from '@/shared/db/db'
import { formatNumber } from '@/shared/utils/format'
import type { LearningLog } from '@/types/learningLog'
import type { WrongNote } from '@/types/wrongNote'

export function StatsRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()

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

  const safeLog: LearningLog[] = logs ?? []
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
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0c0c1f' }}>
      <AppHeader title="통계" onBack={() => navigate('/home')} />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-3">

        {/* 핵심 지표 — 3열 bento */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '총 문제', value: formatNumber(total), color: '#81ecff', icon: '📝' },
            { label: '정답률', value: `${accuracy}%`, color: '#ffe792', icon: '🎯' },
            { label: '오답 복습', value: formatNumber(wrongCount), color: '#ff716c', icon: '🔁' },
          ].map(item => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 py-4"
              style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
            >
              <span className="text-xl">{item.icon}</span>
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
            <span className="text-2xl">🔥</span>
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

        {/* 개념별 정답률 */}
        {conceptStats.length > 0 && (
          <div style={{ backgroundColor: '#1d1d37', border: '1px solid #000' }}>
            {/* 헤더 */}
            <div
              className="flex items-center px-5 py-3"
              style={{ borderBottom: '1px solid #000' }}
            >
              <div className="w-1 h-4 mr-3" style={{ backgroundColor: '#81ecff' }} />
              <p
                className="text-sm font-bold"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
              >
                개념별 정답률
              </p>
            </div>
            <div className="px-5 py-4 space-y-4">
              {conceptStats.map(c => {
                const barColor = c.rate >= 80 ? '#81ecff' : c.rate >= 50 ? '#ffe792' : '#ff716c'
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', maxWidth: '55%' }}
                      >
                        {c.name}
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
            <div className="text-7xl mb-1">📊</div>
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
                backgroundColor: '#81ecff',
                color: '#003840',
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
