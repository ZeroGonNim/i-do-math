import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useTheme } from '@/shared/hooks/useTheme'
import { useDiary } from '@/features/diary/hooks/useDiary'
import { useLiveQuery } from 'dexie-react-hooks'
import { PinInputModal } from '@/shared/components/PinInputModal'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { verifyPin, hashPin, generateSalt } from '@/shared/utils/pinHasher'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { db } from '@/shared/db/db'
import { formatNumber } from '@/shared/utils/format'
import { GamepadIcon, TrashIcon, LockIcon } from '@/shared/components/PixelIcons'
import { AVATARS } from '@/types/avatar'
import type { Problem } from '@/types/problem'
import { loadProblems } from '@/shared/services/problemLoader'
import { useDashboardData } from '@/features/parent/hooks/useDashboardData'
import { ParentSettings } from '@/features/parent/components/ParentSettings'
import { DashboardCharts } from '@/features/parent/components/DashboardCharts'
import { WeakConceptModal } from '@/features/parent/components/WeakConceptModal'

export function ParentRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const theme = useTheme()
  const [activeSemester, setActiveSemester] = useState<0 | 1 | 2>(0)
  const [selectedWeakConcept, setSelectedWeakConcept] = useState<string | null>(null)

  // PIN reset modal
  const [showPinResetModal, setShowPinResetModal] = useState(false)
  const [pinPhase, setPinPhase] = useState<'new' | 'confirm'>('new')
  const [newPin, setNewPin] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showGradeConfirm, setShowGradeConfirm] = useState(false)
  const [pendingGrade, setPendingGrade] = useState<number | null>(null)
  const [showGradeToast, setShowGradeToast] = useState(false)
  const gradeToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // PIN lock view state
  const SESSION_KEY = 'parentDashboardUnlocked'
  const [view, setView] = useState<'loading' | 'lock' | 'setup' | 'dashboard'>('loading')
  const [, setPinError] = useState(false)
  const [setupStep, setSetupStep] = useState<'input' | 'confirm'>('input')
  const [firstPin, setFirstPin] = useState('')
  const [lockAttempt, setLockAttempt] = useState(0)

  useEffect(() => {
    if (profile) {
      if (!profile.parentalPinHash) setView('setup')
      else if (!sessionStorage.getItem(SESSION_KEY)) setView('lock')
      else setView('dashboard')
    }
  }, [profile?.userId, profile?.parentalPinHash])

  const days = useDiary(profile?.userId)
  const filteredDays = useMemo(() => {
    if (!days) return []
    if (activeSemester === 0) return days
    return days
      .map(day => ({ ...day, logs: (day.logs || []).filter(l => l.semester === activeSemester) }))
      .filter(day => (day.logs || []).length > 0)
  }, [days, activeSemester])

  const [allProblems, setAllProblems] = useState<Problem[]>([])
  useEffect(() => {
    loadProblems().then(data => setAllProblems(data.problems)).catch(err => console.error('문제 로드 실패:', err))
  }, [])

  const selectedWeakDetails = useLiveQuery(async () => {
    if (!profile || !selectedWeakConcept) return []
    const rawNotes = await db.wrongNotes
      .where('userId').equals(profile.userId)
      .filter(n => n.concept === selectedWeakConcept)
      .toArray()
    const notes = rawNotes.sort((a, b) => (b.lastAttemptAt || 0) - (a.lastAttemptAt || 0))
    return notes.map(note => {
      if (!note.questionText || !note.correctAnswer) {
        const matched = allProblems.find(p => p.concept === note.concept)
        if (matched) return { ...note, questionText: matched.question, correctAnswer: matched.answer }
      }
      return note
    })
  }, [profile?.userId, selectedWeakConcept, allProblems], [])

  const dashboardData = useDashboardData(profile?.userId)

  const stats = useMemo(() => {
    const allLogs = (filteredDays || []).flatMap(d => d.logs || [])
    const tProblems = allLogs.length
    const tCorrect = allLogs.filter(l => l.isCorrect).length
    const acc = tProblems > 0 ? Math.round((tCorrect / tProblems) * 100) : 0
    return { totalProblems: tProblems, totalCorrect: tCorrect, accuracy: acc }
  }, [filteredDays])

  function handleGradeClick(g: number) {
    const AVAILABLE_GRADES = new Set([4, 5, 6])
    if (!AVAILABLE_GRADES.has(g)) {
      if (gradeToastTimer.current) clearTimeout(gradeToastTimer.current)
      setShowGradeToast(true)
      gradeToastTimer.current = setTimeout(() => setShowGradeToast(false), 2000)
      return
    }
    setPendingGrade(g)
    setShowGradeConfirm(true)
  }

  async function performResetData() {
    await db.learningLogs.clear()
    await db.wrongNotes.clear()
    await db.templateCounters.clear()
    await userProfileRepo.update({ totalStars: 0, currentStreak: 0, longestStreak: 0, level: 1, missionProblemsSolved: 0, missionWrongReviewed: false })
    setShowResetConfirm(false)
    navigate('/home')
  }

  async function performGradeChange(g: number) {
    await db.learningLogs.clear()
    await db.wrongNotes.clear()
    await db.templateCounters.clear()
    await userProfileRepo.update({ grade: g, missionProblemsSolved: 0, missionWrongReviewed: false })
    setPendingGrade(null)
    setShowGradeConfirm(false)
    navigate('/home')
  }

  if (!profile || view === 'loading') {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#0f172a]">
        <div className="text-[#64748b] text-sm animate-pulse">정보를 불러오는 중...</div>
      </div>
    )
  }

  const avatar = AVATARS.find(a => a.id === (profile.avatarId ?? 'warrior')) ?? AVATARS[0]

  if (view === 'lock') {
    return (
      <PinInputModal
        key={lockAttempt}
        headerTitle="부모님 PIN 입력"
        title="계속하려면 4자리 비밀번호를 입력하세요."
        showBack={true}
        showCancel={true}
        onConfirm={async (pin) => {
          if (!profile.parentalPinSalt || !profile.parentalPinHash) return
          const ok = await verifyPin(pin, profile.parentalPinSalt, profile.parentalPinHash)
          if (ok) { sessionStorage.setItem(SESSION_KEY, '1'); setView('dashboard') }
          else { setPinError(true); setLockAttempt(n => n + 1) }
        }}
        onCancel={() => navigate(-1)}
      />
    )
  }

  if (view === 'setup') {
    return (
      <PinInputModal
        key={setupStep === 'input' ? 'setup-input' : 'setup-confirm'}
        headerTitle="부모님 PIN 설정"
        title={setupStep === 'input' ? "사용할 PIN 4자리를 설정해주세요" : "PIN을 한 번 더 입력해주세요"}
        showBack={true}
        showCancel={setupStep === 'input'}
        onConfirm={async (pin) => {
          if (setupStep === 'input') {
            setFirstPin(pin); setSetupStep('confirm'); setPinError(false)
          } else {
            if (pin !== firstPin) { setPinError(true); setSetupStep('input'); setFirstPin(''); return }
            const salt = generateSalt()
            const hash = await hashPin(pin, salt)
            await userProfileRepo.update({ parentalPinHash: hash, parentalPinSalt: salt })
            sessionStorage.setItem(SESSION_KEY, '1')
            setView('dashboard')
          }
        }}
        onCancel={() => {
          if (setupStep === 'confirm') { setSetupStep('input'); setFirstPin('') }
          else navigate(-1)
        }}
      />
    )
  }

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-16"
           style={{ backgroundColor: 'rgba(12,12,31,0.6)', borderBottom: '1px solid #1c1c3a', backdropFilter: 'blur(24px)', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center" style={{ color: '#64748b', backgroundColor: '#17172f' }}>‹</button>
        <div className="flex items-center gap-2">
          <GamepadIcon color={theme.primary} size={18} />
          <span className="text-xl font-medium" style={{ color: theme.primary }}>부모님 대시보드</span>
        </div>
        <div className="w-10 h-10 border-2" style={{ borderColor: theme.primary }}>
          <img src={avatar.imagePath} alt="아바타" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* 학기 탭 */}
        <div className="flex p-4 gap-2">
          {([{ id: 0, label: '전체' }, { id: 1, label: '1학기' }, { id: 2, label: '2학기' }] as const).map(item => (
            <button key={item.id} onClick={() => setActiveSemester(item.id)} className="flex-1 py-2 text-xs font-bold border-2"
                    style={{ backgroundColor: activeSemester === item.id ? theme.primary : '#17172f', color: activeSemester === item.id ? '#000' : '#64748b', borderColor: activeSemester === item.id ? theme.primary : '#23233f' }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* 프로필 + 통계 요약 */}
        <div className="px-6 py-6" style={{ backgroundColor: '#17172f', borderBottom: '1px solid #1c1c3a' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 border-2" style={{ borderColor: theme.primary }}>
              <img src={avatar.imagePath} alt="아바타" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: '#e5e3ff' }}>{profile.displayName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#23233f] text-[#64748b]">LV.{profile.level}</span>
              </div>
              <p className="text-xs font-medium text-[#64748b] mt-0.5">{profile.grade}학년 모험가</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#0c0c1f] border border-[#23233f]"><p className="text-[10px] font-bold text-[#64748b] mb-1">총 학습</p><p className="text-lg font-bold text-[#e5e3ff]">{formatNumber(stats.totalProblems)}개</p></div>
            <div className="p-3 bg-[#0c0c1f] border border-[#23233f]"><p className="text-[10px] font-bold text-[#64748b] mb-1">정답률</p><p className="text-lg font-bold" style={{ color: theme.primary }}>{stats.accuracy}%</p></div>
            <div className="p-3 bg-[#0c0c1f] border border-[#23233f]"><p className="text-[10px] font-bold text-[#64748b] mb-1">보유 별</p><p className="text-lg font-bold text-[#ffe792]">{formatNumber(profile.totalStars)}개</p></div>
          </div>
        </div>

        {/* 학년·난이도 설정 */}
        <ParentSettings
          profile={profile}
          primaryColor={theme.primary}
          onGradeClick={handleGradeClick}
        />

        {/* 차트 섹션 */}
        <DashboardCharts
          unitStats={dashboardData.unitStats}
          retryStats={dashboardData.retryStats}
          trendStats={dashboardData.trendStats}
          weakConcepts={dashboardData.weakConcepts}
          primaryColor={theme.primary}
          onConceptSelect={setSelectedWeakConcept}
        />

        {/* 시스템 관리 */}
        <div className="mx-5 mb-5 px-6 py-6 space-y-4" style={{ backgroundColor: '#17172f', border: '1px solid #1c1c3a' }}>
          <p className="text-xs font-bold text-[#64748b]">시스템 관리</p>
          <button onClick={() => setShowPinResetModal(true)} className="w-full py-3 flex items-center justify-center gap-2 border-2 border-[#23233f] text-[#e5e3ff] text-sm font-bold">
            <LockIcon color={theme.primary} size={16} /> 부모님 PIN 재설정
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="w-full py-3 flex items-center justify-center gap-2 bg-[#ff716c20] border-2 border-[#ff716c40] text-[#ff716c] text-sm font-bold">
            <TrashIcon color="#ff716c" size={16} /> 데이터 전체 초기화
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPinResetModal && (
        <PinInputModal
          key={pinPhase}
          headerTitle="PIN 재설정"
          title={pinPhase === 'new' ? "새로운 PIN 4자리를 입력하세요" : "한 번 더 입력하여 확인하세요"}
          showBack={true}
          showCancel={true}
          onConfirm={async (pin) => {
            if (pinPhase === 'new') { setNewPin(pin); setPinPhase('confirm') }
            else {
              if (pin !== newPin) { alert('PIN이 일치하지 않습니다.'); setPinPhase('new'); return }
              const salt = generateSalt()
              const hash = await hashPin(pin, salt)
              await userProfileRepo.update({ parentalPinHash: hash, parentalPinSalt: salt })
              setShowPinResetModal(false); setPinPhase('new')
            }
          }}
          onCancel={() => { setShowPinResetModal(false); setPinPhase('new') }}
        />
      )}
      {showGradeConfirm && pendingGrade && (
        <ConfirmModal title="학년을 변경할까요?" message={`${pendingGrade}학년으로 변경하면 현재의 모든 기록이 삭제됩니다.`} confirmText="변경하기" onConfirm={() => performGradeChange(pendingGrade)} onCancel={() => setShowGradeConfirm(false)} variant="danger" />
      )}
      {showGradeToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-5 py-3 text-sm font-bold whitespace-nowrap"
             style={{ backgroundColor: '#23233f', color: '#aaa8c3', border: '1px solid #3a3a5c', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 50 }}>
          🔒 아직 준비중입니다
        </div>
      )}
      {showResetConfirm && (
        <ConfirmModal title="전체 초기화할까요?" message="모든 데이터가 영구적으로 삭제됩니다." confirmText="전체 삭제" onConfirm={performResetData} onCancel={() => setShowResetConfirm(false)} variant="danger" />
      )}
      {selectedWeakConcept && selectedWeakDetails && (
        <WeakConceptModal
          concept={selectedWeakConcept}
          notes={selectedWeakDetails}
          primaryColor={theme.primary}
          onClose={() => setSelectedWeakConcept(null)}
        />
      )}
    </div>
  )
}
