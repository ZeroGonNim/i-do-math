import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useRemindList } from '@/features/remind/hooks/useRemindList'
import { loadProblems } from '@/shared/services/problemLoader'
import { MISTAKE_LABELS, formatConceptName } from '@/shared/constants/problemConstants'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { AppHeader } from '@/shared/components/AppHeader'
import { formatNumber } from '@/shared/utils/format'
import type { WrongNote } from '@/types/wrongNote'

export function RemindRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const remindDays = useRemindList(profile?.userId)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  async function handleStartReview(note: WrongNote) {
    try {
      const data = await loadProblems()
      const problem = data.problems.find(p => p.concept === note.concept)
      if (problem) {
        navigate('/problem', { state: { problem, isRemind: true } })
      } else {
        showToast('문제를 찾을 수 없어요.')
      }
    } catch {
      showToast('데이터를 불러오지 못했습니다.')
    }
  }

  if (!profile) return null

  const totalWeakCount = (remindDays || []).reduce((sum, day) => sum + day.notes.length, 0)

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {toastMsg && (
        <div className="fixed top-4 left-0 right-0 mx-4 z-50 rounded-xl px-4 py-3 text-sm text-center font-medium text-white shadow-lg"
             style={{ backgroundColor: 'rgba(33,33,33,0.92)' }}>
          {toastMsg}
        </div>
      )}
      <AppHeader title="오답 복습" onBack={() => navigate('/home')} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {totalWeakCount === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <div className="text-7xl mb-1">🎉</div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              모든 오답 정복!
            </h2>
            <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              지금은 복습할 문제가 없어요.<br />정말 대단한 실력이에요!
            </p>
            <button
              className="mt-4 px-8 min-h-[48px] rounded-xl font-bold transition-all active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#071a14' }}
              onClick={() => navigate('/home')}
            >
              새로운 문제 풀기
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* 요약 카드 */}
            <div className="rounded-2xl p-5"
                 style={{
                   background: 'linear-gradient(135deg, rgba(196,127,255,0.25) 0%, rgba(196,127,255,0.12) 100%)',
                   border: '1px solid rgba(196,127,255,0.35)',
                   boxShadow: '0 0 20px rgba(196,127,255,0.12), var(--shadow-card)',
                 }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'rgba(196,127,255,0.7)' }}>도전 과제</p>
              <h2 className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                약점 개념{' '}
                <span style={{ color: 'var(--color-yellow)', fontFamily: 'var(--font-game)' }}>
                  {formatNumber(totalWeakCount)}
                </span>
                개를<br />정복해볼까요?
              </h2>
            </div>

            {/* 날짜별 오답 리스트 */}
            {remindDays.map(day => (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>📅 {day.date}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-dim)' }} />
                </div>
                <div className="space-y-2">
                  {day.notes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => handleStartReview(note)}
                      className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all active:scale-[0.98]"
                      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate mb-1" style={{ color: 'var(--color-text-primary)' }}>
                          {formatConceptName(note.concept)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: 'rgba(255,107,107,0.12)', color: 'var(--color-red)', border: '1px solid rgba(255,107,107,0.2)' }}>
                            {(note.mistakeType && MISTAKE_LABELS[note.mistakeType]) || '복습 필요'}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            {formatNumber(note.wrongCount)}회 틀림
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-lg"
                           style={{ backgroundColor: 'rgba(196,127,255,0.1)', border: '1px solid rgba(196,127,255,0.15)' }}>
                        🎯
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  )
}
