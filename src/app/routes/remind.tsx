import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useRemindList } from '@/features/remind/hooks/useRemindList'
import { loadProblems } from '@/shared/services/problemLoader'
import { MISTAKE_LABELS, formatConceptName } from '@/shared/constants/problemConstants'
import { AppHeader } from '@/shared/components/AppHeader'
import { formatNumber } from '@/shared/utils/format'
import type { WrongNote } from '@/types/wrongNote'
import type { Problem, Difficulty } from '@/types/problem'

function DifficultyDots({ difficulty }: { difficulty: Difficulty }) {
  const count = difficulty === 'basic' ? 1 : difficulty === 'applied' ? 2 : 3
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: i <= count ? '#c180ff' : '#23233f',
          }}
        />
      ))}
    </div>
  )
}

export function RemindRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const remindDays = useRemindList(profile?.userId)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [allProblems, setAllProblems] = useState<Problem[]>([])

  useEffect(() => {
    loadProblems().then(data => setAllProblems(data.problems))
  }, [])

  const conceptMap = useMemo(() => {
    const map = new Map<string, Problem>()
    allProblems.forEach(p => {
      if (!map.has(p.concept)) map.set(p.concept, p)
    })
    return map
  }, [allProblems])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  async function handleStartReview(note: WrongNote) {
    try {
      const data = await loadProblems()
      const grade = profile?.grade ?? 4
      const candidates = data.problems.filter(
        p => p.concept === note.concept && p.grade === grade
      )
      const problem = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : data.problems.find(p => p.concept === note.concept)
      if (problem) {
        navigate('/problem', { state: { problem, isRemind: true } })
      } else {
        showToast('문제를 찾을 수 없어요.')
      }
    } catch {
      showToast('데이터를 불러오지 못했습니다.')
    }
  }

  async function handleStartAll() {
    const allNotes = (remindDays || []).flatMap(d => d.notes)
    if (allNotes.length > 0) {
      await handleStartReview(allNotes[0])
    }
  }

  if (!profile) return null

  const allNotes = (remindDays || []).flatMap(d => d.notes)
  const totalWeakCount = allNotes.length

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0c0c1f' }}>
      {toastMsg && (
        <div className="fixed top-4 left-0 right-0 mx-4 z-50 px-4 py-3 text-sm text-center font-medium text-white shadow-lg"
             style={{ backgroundColor: 'rgba(33,33,33,0.92)' }}>
          {toastMsg}
        </div>
      )}
      <AppHeader title="오답 복습" onBack={() => navigate('/home')} />

      <div className="flex-1 overflow-y-auto p-4 pb-28">
        {totalWeakCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div
              className="relative flex flex-col items-center px-8 pt-10 pb-10 gap-5"
              style={{ backgroundColor: '#fcf8ff', width: '100%', maxWidth: '342px' }}
            >
              <div className="absolute top-3 left-3 w-3 h-3" style={{ backgroundColor: '#ffe792' }} />
              <div className="absolute top-3 right-3 w-3 h-3" style={{ backgroundColor: '#81ecff' }} />
              <div className="flex items-center justify-center"
                   style={{ width: '102px', height: '100px', backgroundColor: '#6f00be' }}>
                <span style={{ fontSize: '52px', lineHeight: 1 }}>🎉</span>
              </div>
              <p className="text-3xl text-center font-bold"
                 style={{ color: '#1c1c3a', fontFamily: 'var(--font-sans)', letterSpacing: '-0.75px', lineHeight: '38px' }}>
                오답복습 완료!
              </p>
              <p className="text-base text-center leading-7"
                 style={{ color: '#4a4a6a', fontFamily: 'var(--font-sans)' }}>
                틀린 문제가 없어요!<br />계속 잘하고 있어요.<br />새 문제에 도전해보세요!
              </p>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center justify-center gap-2 font-medium text-xl transition-all active:scale-[0.97]"
                style={{ width: '270px', height: '68px', backgroundColor: '#000', color: '#fff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}
              >
                🏠 홈으로
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 취약 개념 발견 배너 */}
            <div className="px-4 py-4"
                 style={{ backgroundColor: '#c180ff', border: '2px solid #9d5fe8' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-game)' }}>
                ⚠️ 주의
              </p>
              <p className="text-xl font-bold" style={{ color: '#fff', fontFamily: 'var(--font-game)' }}>
                취약 개념 발견!
              </p>
            </div>

            {/* 아직 못 이긴 몬스터들 */}
            <div>
              <p className="text-sm font-bold mb-3" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>
                아직 못 이긴 몬스터들{' '}
                <span style={{ color: '#ffe792' }}>{formatNumber(totalWeakCount)}개</span>
              </p>

              <div className="space-y-3">
                {allNotes.map(note => {
                  const representative = conceptMap.get(note.concept)
                  const unitLabel = representative?.unit ?? note.concept
                  const questionPreview = representative?.question ?? formatConceptName(note.concept)
                  const difficulty = representative?.difficulty ?? 'basic'
                  const mistakeLabel = (note.mistakeType && MISTAKE_LABELS[note.mistakeType]) || '복습 필요'

                  return (
                    <div
                      key={note.id}
                      className="flex flex-col"
                      style={{ backgroundColor: '#1d1d37', border: '1px solid #23233f' }}
                    >
                      {/* 상단: 단원 태그 + 실수 유형 + 난이도 */}
                      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5"
                              style={{ backgroundColor: '#23233f', color: '#81ecff', fontFamily: 'var(--font-game)' }}>
                          {unitLabel}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5"
                              style={{ backgroundColor: 'rgba(255,107,107,0.15)', color: '#ff716c', border: '1px solid rgba(255,107,107,0.2)' }}>
                          {mistakeLabel}
                        </span>
                        <div className="ml-auto">
                          <DifficultyDots difficulty={difficulty} />
                        </div>
                      </div>

                      {/* 문제 지문 박스 */}
                      <div className="mx-3 mb-3 px-3 py-2"
                           style={{ backgroundColor: '#23233f', border: '1px solid #2e2e50' }}>
                        <p className="text-sm leading-relaxed line-clamp-2"
                           style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}>
                          {questionPreview}
                        </p>
                      </div>

                      {/* 재도전 버튼 */}
                      <button
                        onClick={() => handleStartReview(note)}
                        className="flex items-center justify-center gap-2 text-sm font-bold transition-all active:opacity-80"
                        style={{ height: '44px', backgroundColor: '#c180ff', color: '#fff', fontFamily: 'var(--font-game)' }}
                      >
                        ▶ 재도전
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 전체 복습 시작 CTA */}
      {totalWeakCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4"
             style={{ backgroundColor: '#0c0c1f', borderTop: '1px solid #23233f' }}>
          <button
            onClick={handleStartAll}
            className="w-full min-h-[56px] text-xl font-bold transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#c180ff', color: '#fff', fontFamily: 'var(--font-game)' }}
          >
            ⚔ 전체 복습 시작!
          </button>
        </div>
      )}
    </div>
  )
}
