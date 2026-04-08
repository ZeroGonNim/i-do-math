import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useDiary } from '@/features/diary/hooks/useDiary'
import { AppHeader } from '@/shared/components/AppHeader'
import { formatNumber } from '@/shared/utils/format'
import { MISTAKE_LABELS, formatConceptName } from '@/shared/constants/problemConstants'
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'

export function DiaryRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const days = useDiary(profile?.userId)

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <AppHeader title="수학 일기" onBack={() => navigate('/home')} />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(!days || days.length === 0) ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <div className="text-7xl mb-1">📖</div>
            <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              아직 기록이 없어요.<br />문제를 풀면 일기가 생겨요!
            </p>
            <button
              className="mt-4 min-h-[48px] px-8 rounded-xl font-bold transition-all active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#071a14' }}
              onClick={() => navigate('/home')}
            >
              문제 풀러 가기
            </button>
          </div>
        ) : (
          days.map(day => (
            <div key={day.date} className="rounded-xl overflow-hidden"
                 style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              {/* 카드 헤더 */}
              <div className="flex items-center justify-between px-4 py-3"
                   style={{ background: 'linear-gradient(135deg, var(--color-bg-raised) 0%, var(--color-bg-card) 100%)', borderBottom: '1px solid var(--color-border-dim)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{day.date}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(255,209,102,0.12)', color: 'var(--color-yellow)', border: '1px solid rgba(255,209,102,0.2)' }}>
                    ⭐ {formatNumber(day.stars)}
                  </span>
                </div>
              </div>
              <div className="px-4 pt-3 pb-1">
              <div className="flex gap-2 text-xs mb-3">
                <span className="px-2 py-0.5 rounded-md font-bold"
                      style={{ backgroundColor: 'rgba(158,155,192,0.1)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-dim)' }}>
                  총 {formatNumber(day.totalProblems)}문제
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold"
                      style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--color-green)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  ✓ {formatNumber(day.correctCount)}
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold"
                      style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: 'var(--color-red)', border: '1px solid rgba(255,107,107,0.2)' }}>
                  ✗ {formatNumber(day.totalProblems - day.correctCount)}
                </span>
              </div>
              <div className="space-y-1.5 pb-3">
                {day.logs.slice(0, 10).map((log, idx) => (
                  <div key={log.logId} className="flex flex-col gap-1">
                    {idx > 0 && <div className="h-px" style={{ backgroundColor: 'var(--color-border-dim)' }} />}
                    <div className="flex items-center gap-2 text-sm py-0.5">
                      <span className="shrink-0 text-base">{log.isCorrect ? '✅' : '❌'}</span>
                      <DifficultyBadge difficulty={log.difficulty} showLabel={false} className="scale-90" />
                      <span className="truncate flex-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatConceptName(log.concept)}
                      </span>
                      {log.drawingData && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                              style={{ backgroundColor: 'rgba(125,232,255,0.1)', color: 'var(--color-cyan)', border: '1px solid rgba(125,232,255,0.2)' }}>
                          🖼️
                        </span>
                      )}
                      {!log.isCorrect && log.mistakeType && (
                        <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: 'var(--color-red)', border: '1px solid rgba(255,107,107,0.2)' }}>
                          {MISTAKE_LABELS[log.mistakeType] || log.mistakeType}
                        </span>
                      )}
                    </div>
                    {log.drawingData && (
                      <div className="ml-7 w-24 aspect-video rounded border overflow-hidden"
                           style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <img src={log.drawingData} alt="사용자 그림" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
                {day.logs.length > 10 && (
                  <p className="text-xs text-right pt-1" style={{ color: 'var(--color-text-muted)' }}>
                    +{formatNumber(day.logs.length - 10)}개 더
                  </p>
                )}
              </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
