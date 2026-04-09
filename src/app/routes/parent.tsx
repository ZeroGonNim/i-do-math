import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useDiary } from '@/features/diary/hooks/useDiary'
import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import { useLiveQuery } from 'dexie-react-hooks'
import { PinInputModal } from '@/shared/components/PinInputModal'
import { verifyPin, hashPin, generateSalt } from '@/shared/utils/pinHasher'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { formatNumber } from '@/shared/utils/format'
import { formatConceptName } from '@/shared/constants/problemConstants'

type View = 'lock' | 'setup' | 'dashboard'

export function ParentRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const days = useDiary(profile?.userId)
  const weakNotes = useLiveQuery(async () => {
    if (!profile) return []
    return wrongNoteRepo.getWeakConcepts(profile.userId)
  }, [profile?.userId], [])

  const SESSION_KEY = 'parentDashboardUnlocked'

  const [view, setView] = useState<View>(() => {
    if (profile?.parentalPinHash) {
      return sessionStorage.getItem(SESSION_KEY) === '1' ? 'dashboard' : 'lock'
    }
    return 'setup'
  })
  const [pinError, setPinError] = useState(false)
  const [setupStep, setSetupStep] = useState<'input' | 'confirm'>('input')
  const [firstPin, setFirstPin] = useState('')
  const [lockAttempt, setLockAttempt] = useState(0)

  if (!profile) return null

  const hasPinSet = Boolean(profile.parentalPinHash)

  if (view === 'lock' && hasPinSet) {
    return (
      <PinInputModal
        key={lockAttempt}
        headerTitle="부모님 PIN 입력"
        title="계속하려면 4자리 비밀번호를 입력하세요."
        showCancel
        onConfirm={async (pin) => {
          if (!profile.parentalPinSalt || !profile.parentalPinHash) {
            setPinError(true)
            setLockAttempt(n => n + 1)
            return
          }
          const ok = await verifyPin(pin, profile.parentalPinSalt, profile.parentalPinHash)
          if (ok) {
            setPinError(false)
            sessionStorage.setItem(SESSION_KEY, '1')
            setView('dashboard')
          } else {
            setPinError(true)
            setLockAttempt(n => n + 1)
          }
        }}
        onCancel={() => navigate('/home')}
      />
    )
  }

  if (view === 'setup') {
    if (setupStep === 'input') {
      return (
        <>
          {pinError && (
            <div className="fixed top-4 left-0 right-0 mx-4 p-3 text-sm text-center z-50"
                 style={{ backgroundColor: '#1d1d37', border: '1px solid #ff716c', color: '#ff716c' }}>
              PIN이 일치하지 않아요. 다시 시도해주세요.
            </div>
          )}
          <PinInputModal
            key="setup-input"
            headerTitle="부모님 PIN 설정"
            title="사용할 PIN 4자리를 설정해주세요"
            showBack
            onConfirm={(pin) => {
              setFirstPin(pin)
              setSetupStep('confirm')
              setPinError(false)
            }}
            onCancel={() => navigate('/home')}
          />
        </>
      )
    }
    return (
      <>
        {pinError && (
          <div className="fixed top-4 left-0 right-0 mx-4 p-3 text-sm text-center z-50"
               style={{ backgroundColor: '#1d1d37', border: '1px solid #ff716c', color: '#ff716c' }}>
            PIN이 일치하지 않아요. 다시 입력해주세요.
          </div>
        )}
        <PinInputModal
          key="setup-confirm"
          headerTitle="부모님 PIN 설정"
          title="PIN을 한 번 더 입력해주세요"
          showBack
          showCancel
          onConfirm={async (pin) => {
            if (pin !== firstPin) {
              setPinError(true)
              setSetupStep('input')
              setFirstPin('')
              return
            }
            try {
              const salt = generateSalt()
              const hash = await hashPin(pin, salt)
              await userProfileRepo.update({ parentalPinHash: hash, parentalPinSalt: salt })
              sessionStorage.setItem(SESSION_KEY, '1')
              setView('dashboard')
            } catch {
              setPinError(true)
              setSetupStep('input')
              setFirstPin('')
            }
          }}
          onCancel={() => { setSetupStep('input'); setFirstPin('') }}
        />
      </>
    )
  }

  const totalProblems = (days || []).reduce((s, d) => s + d.totalProblems, 0)
  const totalCorrect = (days || []).reduce((s, d) => s + d.correctCount, 0)
  const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0

  // Weekly accuracy by day-of-week (last 7 days)
  const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']
  const weeklyAccuracy = DAY_LABELS.map((label, i) => {
    const targetDow = (i + 1) % 7 // Mon=1..Sun=0
    const dayData = (days || []).find(d => {
      const dow = new Date(d.date).getDay()
      return dow === targetDow
    })
    const acc = dayData && dayData.totalProblems > 0
      ? Math.round((dayData.correctCount / dayData.totalProblems) * 100)
      : 0
    return { label, acc, isToday: new Date().getDay() === targetDow }
  })
  const avgAccuracy = accuracy

  // Star progress (next level threshold: simple rule)
  const starNextLevel = Math.ceil((profile.totalStars + 1) / 1000) * 1000
  const starProgress = starNextLevel > 0 ? (profile.totalStars % 1000) / 1000 : 0

  // Grade rank label
  const rankLabel = profile.level >= 20 ? '전설' : profile.level >= 10 ? '모험가' : '견습생'

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0c0c1f' }}>

      {/* Top App Bar */}
      <div
        className="shrink-0 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: 'rgba(12,12,31,0.6)', borderBottom: '1px solid #1c1c3a' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base" style={{ color: '#81ecff' }}>🎮</span>
          <span
            className="text-xl font-medium"
            style={{ color: '#81ecff', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}
          >
            부모님 대시보드
          </span>
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center text-lg overflow-hidden"
          style={{ backgroundColor: '#1d1d37', border: '1.5px solid #81ecff' }}
        >
          👤
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">

        {/* Student Card */}
        <div
          className="px-6 py-5"
          style={{ backgroundColor: '#17172f', borderBottom: '1px solid #000' }}
        >
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 flex items-center justify-center text-3xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(129,236,255,0.2)',
                  border: '1.5px solid #81ecff',
                }}
              >
                ⚔️
              </div>
              <div
                className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{ backgroundColor: '#ffe792', color: '#655400', fontFamily: 'var(--font-game)' }}
              >
                LV.{profile.level}
              </div>
            </div>
            {/* Info */}
            <div>
              <p
                className="text-2xl font-medium leading-[32px] tracking-[-0.6px]"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              >
                {profile.displayName}
              </p>
              <p
                className="text-sm font-medium mt-1"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
              >
                초등 {profile.grade}학년 • {rankLabel} 등급
              </p>
            </div>
          </div>

          {/* Star progress bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span
                className="text-xs font-medium tracking-[0.1em]"
                style={{ color: '#81ecff', fontFamily: 'var(--font-sans)' }}
              >
                별 현황
              </span>
              <span
                className="text-xs font-bold tracking-[0.1em]"
                style={{ color: '#81ecff', fontFamily: 'var(--font-game)' }}
              >
                {formatNumber(profile.totalStars % 1000)} / 1000
              </span>
            </div>
            <div
              className="w-full h-4 rounded-sm overflow-hidden"
              style={{ backgroundColor: '#000', border: '1px solid #23233f' }}
            >
              <div
                className="h-full"
                style={{
                  width: `${Math.round(starProgress * 100)}%`,
                  backgroundColor: '#81ecff',
                  boxShadow: '0 0 8px rgba(129,236,255,0.4)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Stars stat */}
        <div
          className="flex flex-col items-center justify-center py-7"
          style={{ backgroundColor: '#17172f', borderBottom: '1px solid #000' }}
        >
          <span className="text-3xl mb-1">⭐</span>
          <p className="text-3xl font-bold" style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}>
            {formatNumber(profile.totalStars)}
          </p>
          <p className="text-xs font-medium mt-1" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
            성별점
          </p>
        </div>

        {/* Streak stat */}
        <div
          className="flex flex-col items-center justify-center py-7"
          style={{ backgroundColor: '#17172f', borderBottom: '1px solid #000' }}
        >
          <span className="text-3xl mb-1">🔥</span>
          <p className="text-3xl font-bold" style={{ color: '#ff9f43', fontFamily: 'var(--font-game)' }}>
            {formatNumber(profile.currentStreak)}일
          </p>
          <p className="text-xs font-medium mt-1" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
            연속 학습
          </p>
        </div>

        <div className="px-5 pt-5 space-y-4">

          {/* Weekly Accuracy Chart */}
          <div
            className="px-6 py-5"
            style={{ backgroundColor: '#1d1d37', border: '1px solid #000' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-sm font-medium tracking-[0.1em]"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              >
                주간 정확도
              </p>
              <p
                className="text-xs font-bold"
                style={{ color: '#81ecff', fontFamily: 'var(--font-game)' }}
              >
                평균 {avgAccuracy}%
              </p>
            </div>
            <div className="flex items-end gap-1 h-20">
              {weeklyAccuracy.map(({ label, acc, isToday }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: '64px' }}>
                    <div
                      className="w-full"
                      style={{
                        height: `${Math.max(acc, 4)}%`,
                        backgroundColor: isToday ? '#81ecff' : '#23233f',
                        boxShadow: isToday ? '0 0 8px rgba(129,236,255,0.4)' : 'none',
                        minHeight: acc > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  <p
                    className="text-[10px] font-bold"
                    style={{
                      color: isToday ? '#81ecff' : '#aaa8c3',
                      fontFamily: 'var(--font-game)',
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Concept List */}
          {weakNotes && weakNotes.length > 0 && (
            <div
              className="px-6 py-5"
              style={{ backgroundColor: '#1d1d37', border: '1px solid #000' }}
            >
              <p
                className="text-sm font-bold tracking-[0.1em] mb-4"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              >
                집중 학습 필요
              </p>
              <div className="space-y-2">
                {weakNotes.slice(0, 5).map((note) => {
                  const borderColor = note.wrongCount >= 5 ? '#ff716c' : '#c180ff'
                  const levelLabel = note.wrongCount >= 5 ? `취약 lv.${Math.min(3, Math.floor(note.wrongCount / 3))}` : '취약 lv.1'
                  return (
                    <div
                      key={note.id}
                      className="flex items-center justify-between pl-4 pr-3 py-4"
                      style={{
                        backgroundColor: '#000',
                        borderLeft: `3px solid ${borderColor}`,
                      }}
                    >
                      <div>
                        <p
                          className="text-[10px] font-bold mb-1"
                          style={{ color: borderColor, fontFamily: 'var(--font-game)', letterSpacing: '-0.5px' }}
                        >
                          {levelLabel}
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
                        >
                          {formatConceptName(note.concept)}
                        </p>
                      </div>
                      <span
                        className="text-base font-bold"
                        style={{ color: '#aaa8c3' }}
                      >
                        ›
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div
            className="px-6 py-5"
            style={{ backgroundColor: '#17172f', border: '1px solid #000' }}
          >
            <p
              className="text-sm font-bold tracking-[0.1em] mb-4"
              style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
            >
              최근 퀘스트 기록
            </p>

            {(days || []).length === 0 ? (
              <p
                className="text-sm text-center py-4"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
              >
                아직 학습 기록이 없어요
              </p>
            ) : (
              <div className="space-y-px">
                {(days || []).slice(0, 5).map(day => {
                  const dayAcc = day.totalProblems > 0
                    ? Math.round((day.correctCount / day.totalProblems) * 100)
                    : 0
                  const primaryConcept = day.logs[0]?.concept ?? ''
                  const starColor = day.stars >= 80 ? '#81ecff' : '#ffe792'
                  return (
                    <div
                      key={day.date}
                      className="flex items-center gap-3 py-4"
                      style={{ borderBottom: '1px solid #23233f' }}
                    >
                      <div
                        className="w-12 h-12 rounded shrink-0 flex items-center justify-center text-xl"
                        style={{ backgroundColor: '#000' }}
                      >
                        📚
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium leading-[20px] truncate"
                          style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
                        >
                          {formatConceptName(primaryConcept)} 퀘스트
                        </p>
                        <p
                          className="text-[10px] font-bold mt-0.5"
                          style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
                        >
                          {day.date} • {day.totalProblems}문제
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className="text-sm font-bold leading-[20px]"
                          style={{ color: starColor, fontFamily: 'var(--font-game)' }}
                        >
                          +{day.stars} 별
                        </p>
                        <p
                          className="text-[10px] font-bold"
                          style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
                        >
                          정확도 {dayAcc}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <button
              className="w-full mt-3 py-3 text-[10px] font-medium tracking-[0.1em] transition-all active:scale-[0.98]"
              style={{
                backgroundColor: '#1d1d37',
                color: '#aaa8c3',
                border: '1px solid #23233f',
                fontFamily: 'var(--font-sans)',
              }}
              onClick={() => navigate('/diary')}
            >
              전체 기록 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
