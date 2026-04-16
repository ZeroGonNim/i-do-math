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
import { formatConceptName } from '@/shared/constants/problemConstants'
import { GamepadIcon, TrashIcon, LockIcon } from '@/shared/components/PixelIcons'
import { AVATARS } from '@/types/avatar'
import { isIntegerAnswer, isFractionAnswer, type Answer, type Problem } from '@/types/problem'
import { loadProblems } from '@/shared/services/problemLoader'

const AVAILABLE_GRADES = new Set([4, 5, 6])

function formatAnswer(answer?: Answer): string {
  if (!answer) return '—'
  if (isIntegerAnswer(answer)) return String(answer.value)
  if (isFractionAnswer(answer)) return `${answer.numerator}/${answer.denominator}`
  return '...'
}

export function ParentRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const theme = useTheme()
  const [activeSemester, setActiveSemester] = useState<0 | 1 | 2>(0)
  const [showDifficultyTooltip, setShowDifficultyTooltip] = useState(false)
  const [selectedWeakConcept, setSelectedWeakConcept] = useState<string | null>(null)
  
  // New States for System Management
  const [showPinResetModal, setShowPinResetModal] = useState(false)
  const [pinPhase, setPinPhase] = useState<'new' | 'confirm'>('new')
  const [newPin, setNewPin] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showGradeConfirm, setShowGradeConfirm] = useState(false)
  const [pendingGrade, setPendingGrade] = useState<number | null>(null)
  const [showGradeToast, setShowGradeToast] = useState(false)
  const gradeToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleGradeClick(g: number) {
    if (!AVAILABLE_GRADES.has(g)) {
      if (gradeToastTimer.current) clearTimeout(gradeToastTimer.current)
      setShowGradeToast(true)
      gradeToastTimer.current = setTimeout(() => setShowGradeToast(false), 2000)
      return
    }
    setPendingGrade(g)
    setShowGradeConfirm(true)
  }

  const days = useDiary(profile?.userId)
  
  const filteredDays = useMemo(() => {
    if (!days) return []
    if (activeSemester === 0) return days
    return days.map(day => ({
      ...day,
      logs: (day.logs || []).filter(l => l.semester === activeSemester)
    })).filter(day => (day.logs || []).length > 0)
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
        if (matched) {
          return { ...note, questionText: matched.question, correctAnswer: matched.answer }
        }
      }
      return note
    })
  }, [profile?.userId, selectedWeakConcept, allProblems], [])

  const SESSION_KEY = 'parentDashboardUnlocked'
  const [view, setView] = useState<'loading' | 'lock' | 'setup' | 'dashboard'>('loading')
  const [, setPinError] = useState(false)
  const [setupStep, setSetupStep] = useState<'input' | 'confirm'>('input')
  const [firstPin, setFirstPin] = useState('')
  const [lockAttempt, setLockAttempt] = useState(0)

  useEffect(() => {
    if (profile) {
      if (!profile.parentalPinHash) {
        setView('setup')
      } else if (!sessionStorage.getItem(SESSION_KEY)) {
        setView('lock')
      } else {
        setView('dashboard')
      }
    }
  }, [profile?.userId, profile?.parentalPinHash])

  const stats = useMemo(() => {
    const allLogs = (filteredDays || []).flatMap(d => d.logs || [])
    const tProblems = allLogs.length
    const tCorrect = allLogs.filter(l => l.isCorrect).length
    const acc = tProblems > 0 ? Math.round((tCorrect / tProblems) * 100) : 0
    const oneShotCount = allLogs.filter(l => l.isCorrect && (l.retryCount === 0 || l.retryCount === undefined)).length
    const retryCountNum = allLogs.filter(l => l.isCorrect && typeof l.retryCount === 'number' && l.retryCount > 0).length
    const failedCount = allLogs.filter(l => !l.isCorrect).length
    const rStats = tProblems === 0 ? { oneShot: 0, retry: 0, failed: 0 } : {
      oneShot: Math.round((oneShotCount / tProblems) * 100),
      retry: Math.round((retryCountNum / tProblems) * 100),
      failed: Math.round((failedCount / tProblems) * 100),
    }

    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const monthDay = `${d.getMonth() + 1}.${d.getDate()}`
      const dayLabel = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
      const dayData = (filteredDays || []).find(fd => fd.date === dateStr)
      const dayLogs = dayData?.logs || []
      const dayAcc = dayLogs.length > 0 ? Math.round((dayLogs.filter(l => l.isCorrect).length / dayLogs.length) * 100) : 0
      return { label: dayLabel, dateText: monthDay, acc: dayAcc, isToday: i === 6 }
    })
    return { totalProblems: tProblems, totalCorrect: tCorrect, accuracy: acc, retryStats: rStats, weeklyAccuracy: weeklyData }
  }, [filteredDays])

  async function performResetData() {
    await db.learningLogs.clear()
    await db.wrongNotes.clear()
    await db.templateCounters.clear()
    await userProfileRepo.update({
      totalStars: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      missionProblemsSolved: 0,
      missionWrongReviewed: false,
    })
    setShowResetConfirm(false)
    navigate('/home')
  }

  async function performGradeChange(g: number) {
    await db.learningLogs.clear()
    await db.wrongNotes.clear()
    await db.templateCounters.clear()
    await userProfileRepo.update({ 
      grade: g,
      missionProblemsSolved: 0,
      missionWrongReviewed: false
    })
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
          if (ok) {
            sessionStorage.setItem(SESSION_KEY, '1')
            setView('dashboard')
          } else {
            setPinError(true)
            setLockAttempt(n => n + 1)
          }
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
            setFirstPin(pin)
            setSetupStep('confirm')
            setPinError(false)
          } else {
            if (pin !== firstPin) {
              setPinError(true)
              setSetupStep('input')
              setFirstPin('')
              return
            }
            const salt = generateSalt()
            const hash = await hashPin(pin, salt)
            await userProfileRepo.update({ parentalPinHash: hash, parentalPinSalt: salt })
            sessionStorage.setItem(SESSION_KEY, '1')
            setView('dashboard')
          }
        }}
        onCancel={() => {
          if (setupStep === 'confirm') {
            setSetupStep('input')
            setFirstPin('')
          } else {
            navigate(-1)
          }
        }}
      />
    )
  }

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>
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
        <div className="flex p-4 gap-2">
          {([ { id: 0, label: '전체' }, { id: 1, label: '1학기' }, { id: 2, label: '2학기' } ] as const).map(item => (
            <button key={item.id} onClick={() => setActiveSemester(item.id)} className="flex-1 py-2 text-xs font-bold border-2"
                    style={{ backgroundColor: activeSemester === item.id ? theme.primary : '#17172f', color: activeSemester === item.id ? '#000' : '#64748b', borderColor: activeSemester === item.id ? theme.primary : '#23233f' }}>
              {item.label}
            </button>
          ))}
        </div>

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

        {/* 학년 및 난이도 설정 */}
        <div className="px-6 py-8 space-y-8" style={{ backgroundColor: '#17172f', borderBottom: '1px solid #1c1c3a' }}>
          {/* 학년 선택 */}
          <div>
            <p className="text-xs font-bold mb-4" style={{ color: theme.primary }}>아이 학년 설정</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(g => {
                const available = AVAILABLE_GRADES.has(g)
                const selected = profile.grade === g
                return (
                  <button
                    key={g}
                    onClick={() => handleGradeClick(g)}
                    className="relative py-3 text-sm font-bold border-2 transition-all"
                    style={
                      !available
                        ? { backgroundColor: '#111127', color: '#3a3a5c', borderColor: '#1c1c3a' }
                        : selected
                        ? { backgroundColor: theme.primary, color: '#000', borderColor: theme.primary }
                        : { backgroundColor: '#1d1d37', color: theme.primary, borderColor: '#23233f' }
                    }
                  >
                    {g}학년
                    {!available && (
                      <span
                        className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 py-px"
                        style={{ backgroundColor: '#23233f', color: '#64748b', borderRadius: '2px' }}
                      >
                        준비중
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] mt-3 text-[#ff716c]">⚠️ 학년 변경 시 현재 학년의 기록은 초기화됩니다.</p>
          </div>

          {/* 난이도 설정 */}
          <div>
            <div className="flex items-center gap-2 mb-4 relative">
              <p className="text-xs font-bold" style={{ color: theme.primary }}>미션 난이도 설정</p>
              <button onClick={() => setShowDifficultyTooltip(!showDifficultyTooltip)} className="w-4 h-4 rounded-full border border-[#64748b] text-[10px] text-[#64748b]">?</button>
              {showDifficultyTooltip && (
                <div className="absolute top-8 left-0 z-20 w-64 p-3 border-2 border-[#23233f] bg-[#1d1d37]">
                  <p className="text-[11px] font-bold mb-1" style={{ color: theme.primary }}>✨ 자동 성장 모드: 시스템이 최적의 난이도를 조절합니다.</p>
                  <p className="text-[11px] font-bold mt-2" style={{ color: '#fff' }}>🔒 수동 고정 모드: 선택한 난이도만 노출됩니다.</p>
                </div>
              )}
            </div>
            <button onClick={async () => await userProfileRepo.update({ difficultyMode: 'auto' })}
                    className="w-full py-3 mb-3 text-sm font-bold border-2"
                    style={{ backgroundColor: profile.difficultyMode === 'auto' ? theme.primary : 'transparent', color: profile.difficultyMode === 'auto' ? '#000' : theme.primary, borderColor: theme.primary }}>
              {profile.difficultyMode === 'auto' ? '✨ 자동 성장 모드 작동 중' : '자동 성장 모드로 전환하기'}
            </button>
            <div className="flex gap-2">
              {(['basic', 'applied', 'challenge'] as const).map(d => (
                <button key={d} onClick={async () => await userProfileRepo.update({ unlockedDifficulty: d, difficultyMode: 'manual' })}
                        className="flex-1 py-2.5 text-xs font-bold border-2"
                        style={{ backgroundColor: profile.difficultyMode === 'manual' && profile.unlockedDifficulty === d ? '#fff' : 'transparent', color: profile.difficultyMode === 'manual' && profile.unlockedDifficulty === d ? '#000' : '#64748b', borderColor: '#23233f' }}>
                  {d === 'basic' ? '기초' : d === 'applied' ? '실력' : '심화'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 space-y-5">
          {/* 주간 정확도 패턴 */}
          <div className="px-6 py-6 border" style={{ backgroundColor: '#1d1d37', borderColor: '#23233f' }}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-bold text-[#e5e3ff]">주간 정확도 패턴</p>
              <p className="text-xs font-bold" style={{ color: theme.primary }}>평균 {stats.accuracy}%</p>
            </div>
            <div className="flex items-end gap-2 h-24">
              {stats.weeklyAccuracy.map(w => (
                <div key={w.dateText} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end h-16 mb-2">
                    <div style={{ height: `${Math.max(w.acc, 6)}%`, backgroundColor: w.acc > 0 ? (w.isToday ? theme.primary : '#3b426e') : '#23233f', border: w.acc > 0 ? (w.isToday ? '2px solid #fff' : 'none') : '1px dashed #333' }} className="w-full" />
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: w.isToday ? '#fff' : '#64748b' }}>{w.label}</p>
                  <p className="text-[8px]" style={{ color: '#64748b' }}>{w.dateText}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 시스템 관리 */}
          <div className="px-6 py-6 space-y-4" style={{ backgroundColor: '#17172f', border: '1px solid #1c1c3a' }}>
            <p className="text-xs font-bold text-[#64748b]">시스템 관리</p>
            <button onClick={() => setShowPinResetModal(true)} className="w-full py-3 flex items-center justify-center gap-2 border-2 border-[#23233f] text-[#e5e3ff] text-sm font-bold">
              <LockIcon color={theme.primary} size={16} /> 부모님 PIN 재설정
            </button>
            <button onClick={() => setShowResetConfirm(true)} className="w-full py-3 flex items-center justify-center gap-2 bg-[#ff716c20] border-2 border-[#ff716c40] text-[#ff716c] text-sm font-bold">
              <TrashIcon color="#ff716c" size={16} /> 데이터 전체 초기화
            </button>
          </div>
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
            if (pinPhase === 'new') { setNewPin(pin); setPinPhase('confirm'); }
            else {
              if (pin !== newPin) { alert('PIN이 일치하지 않습니다.'); setPinPhase('new'); return; }
              const salt = generateSalt(); const hash = await hashPin(pin, salt);
              await userProfileRepo.update({ parentalPinHash: hash, parentalPinSalt: salt });
              setShowPinResetModal(false); setPinPhase('new');
            }
          }}
          onCancel={() => { setShowPinResetModal(false); setPinPhase('new'); }}
        />
      )}
      {showGradeConfirm && pendingGrade && (
        <ConfirmModal title="학년을 변경할까요?" message={`${pendingGrade}학년으로 변경하면 현재의 모든 기록이 삭제됩니다.`} confirmText="변경하기" onConfirm={() => performGradeChange(pendingGrade)} onCancel={() => setShowGradeConfirm(false)} variant="danger" />
      )}
      {showGradeToast && (
        <div
          className="fixed bottom-10 left-1/2 -translate-x-1/2 px-5 py-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap"
          style={{ backgroundColor: '#23233f', color: '#aaa8c3', border: '1px solid #3a3a5c', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 50 }}
        >
          🔒 아직 준비중입니다
        </div>
      )}
      {showResetConfirm && (
        <ConfirmModal title="전체 초기화할까요?" message="모든 데이터가 영구적으로 삭제됩니다." confirmText="전체 삭제" onConfirm={performResetData} onCancel={() => setShowResetConfirm(false)} variant="danger" />
      )}
      {selectedWeakConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0c0c1f] border-4 border-[#23233f] overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
            <div className="px-5 py-4 border-b border-[#23233f] flex items-center justify-between bg-[#17172f]">
              <span className="text-lg font-bold" style={{ color: theme.primary }}>{formatConceptName(selectedWeakConcept)} 분석</span>
              <button onClick={() => setSelectedWeakConcept(null)} className="text-[#64748b] font-bold">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedWeakDetails?.map(note => (
                <div key={note.id} className="p-4 border-2 border-[#23233f] bg-[#17172f]">
                  <p className="text-sm text-[#e5e3ff] mb-2">{note.questionText}</p>
                  <div className="flex gap-2 text-[11px]">
                    <div className="flex-1 p-2 bg-[#000] border border-[#ff716c]/30">
                      <p className="text-[#ff716c]">내 답: {formatAnswer(note.lastWrongAnswer)}</p>
                    </div>
                    <div className="flex-1 p-2 bg-[#000] border border-[#10b981]/30">
                      <p className="text-[#10b981]">정답: {formatAnswer(note.correctAnswer)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-[#23233f]">
              <button onClick={() => setSelectedWeakConcept(null)} className="w-full py-3 text-[#64748b] bg-[#17172f]">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
