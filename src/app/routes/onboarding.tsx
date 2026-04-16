import { useEffect, useState, useRef } from 'react'
import type React from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { CharacterSelectCard, AVATARS } from '@/shared/components/CharacterSelectCard'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { PersonIcon, SwordIcon, LeafIcon, TreeIcon, AppleIcon, DiamondIcon, RocketIcon } from '@/shared/components/PixelIcons'

const AVAILABLE_GRADES = new Set([4, 5])

const STEP_LABELS = ['영웅 만들기', '학년 설정', '동료 선택']
const STEP_NUMBERS = ['01단계', '02단계', '03단계']

export function OnboardingRoute() {
  const navigate = useNavigate()
  const [showError, setShowError] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleGradeClick(g: number) {
    if (!AVAILABLE_GRADES.has(g)) {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setShowToast(true)
      toastTimer.current = setTimeout(() => setShowToast(false), 2000)
      return
    }
    setGrade(g)
  }
  const { step, setStep, name, setName, grade, setGrade, avatarId, setAvatarId, complete } =
    useOnboarding()

  useEffect(() => {
    userProfileRepo.get().then(profile => {
      if (profile) navigate('/home', { replace: true })
    })
  }, [navigate])

  async function handleComplete() {
    try {
      await complete()
    } catch {
      setShowError(true)
    }
  }

  const selectedAvatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0]
  const progressPct = ((step + 1) / 3) * 100

  return (
    <div
      className="flex h-dvh flex-col"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Top App Bar */}
      <div
        className="shrink-0 flex items-center px-6 h-16"
        style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1c1c3a' }}
      >
        <div className="flex items-center gap-2">
          <PersonIcon color="#38bdf8" size={18} />
          <span
            className="text-xl font-medium"
            style={{ color: '#38bdf8', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}
          >
            수학 퀘스트
          </span>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="shrink-0 px-6 pt-5 pb-3">
        <div
          className="w-full h-4 rounded-sm overflow-hidden"
          style={{ backgroundColor: '#23233f', border: '1px solid #64748b' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #00d4ec, #38bdf8)',
              boxShadow: '0 0 8px rgba(56,189,248,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <span
            className="text-sm font-medium"
            style={{ color: '#8b5cf6', fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}
          >
            {STEP_NUMBERS[step]}
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: '#38bdf8', fontFamily: 'var(--font-sans)' }}
          >
            {STEP_LABELS[step]}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6">

        {/* ── Step 0: 이름 입력 ── */}
        {step === 0 && (
          <div className="flex flex-col gap-6 pt-8 pb-6">
            <div className="text-center">
              <h1
                className="text-[36px] font-medium leading-[45px] tracking-[-0.9px]"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              >
                이름이 뭐야?
              </h1>
              <p
                className="mt-3 text-lg font-medium leading-[28px]"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
              >
                새로운 모험을 시작할 영웅의<br />이름을 알려 줘!
              </p>
            </div>

            <div>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: '#8b5cf6', fontFamily: 'var(--font-sans)' }}
              >
                영웅 이름
              </p>
              <div className="relative">
                <input
                  className="w-full px-7 text-2xl font-medium focus:outline-none transition-all tracking-[0.1em]"
                  style={{
                    height: '86px',
                    backgroundColor: '#000',
                    border: '1px solid #23233f',
                    borderRadius: '4px',
                    color: '#e5e3ff',
                    fontFamily: 'var(--font-sans)',
                  }}
                  placeholder="이름을 입력하세요..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={10}
                  onFocus={e => {
                    e.target.style.borderColor = '#38bdf8'
                    e.target.style.boxShadow = '0 0 0 1px #38bdf8'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#23233f'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 w-full h-1"
                  style={{ backgroundColor: '#23233f' }}
                />
              </div>
            </div>

            {/* Character Preview Card */}
            <div
              className="p-5 flex items-center gap-5 border-4 border-[#38bdf8]"
              style={{ backgroundColor: '#111127', boxShadow: '0 4px 0 #000000, 0 0 16px rgba(56,189,248,0.3)' }}
            >
              <div
                className="w-16 h-16 flex items-center justify-center shrink-0 overflow-hidden border-4 border-[#38bdf8]"
                style={{ backgroundColor: '#1d1d37', boxShadow: '0 2px 0 #000000' }}
              >
                {selectedAvatar.imagePath
                  ? <img src={selectedAvatar.imagePath} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                  : <SwordIcon color="#38bdf8" size={36} />
                }
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: '#ffe792', fontFamily: 'var(--font-sans)' }}
                >
                  미리보기
                </p>
                <p
                  className="text-xl font-bold leading-[28px] tracking-[0.5px]"
                  style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
                >
                  LV.1 {name.trim() || '견습생'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: 학년 선택 ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6 pt-6 pb-6">
            <div className="text-center">
              <h1
                className="text-[36px] font-medium leading-[45px] tracking-[-0.9px]"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              >
                몇 학년이야?
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { g: 1, icon: <LeafIcon color="currentColor" size={32} /> },
                { g: 2, icon: <LeafIcon color="currentColor" size={32} /> },
                { g: 3, icon: <LeafIcon color="currentColor" size={32} /> },
                { g: 4, icon: <TreeIcon color="currentColor" size={32} /> },
                { g: 5, icon: <AppleIcon color="currentColor" size={32} /> },
                { g: 6, icon: <DiamondIcon color="currentColor" size={32} /> },
              ] as { g: number; icon: React.ReactNode }[]).map(({ g, icon }) => {
                const available = AVAILABLE_GRADES.has(g)
                const selected = grade === g
                return (
                  <button
                    key={g}
                    className="relative flex flex-col items-center justify-center gap-2 py-6 text-xl font-bold transition-all border-4"
                    style={
                      !available
                        ? {
                            backgroundColor: '#111127',
                            color: '#3a3a5c',
                            borderColor: '#1c1c3a',
                            fontFamily: 'var(--font-game)',
                            cursor: 'pointer',
                          }
                        : selected
                        ? {
                            backgroundColor: '#38bdf8',
                            color: '#0f172a',
                            borderColor: '#38bdf8',
                            boxShadow: '0 4px 0 #000000, 0 0 16px rgba(56,189,248,0.5)',
                            fontFamily: 'var(--font-game)',
                          }
                        : {
                            backgroundColor: '#1d1d37',
                            color: '#e5e3ff',
                            borderColor: '#23233f',
                            fontFamily: 'var(--font-game)',
                          }
                    }
                    onClick={() => handleGradeClick(g)}
                  >
                    <span className="flex items-center justify-center">{icon}</span>
                    {g}학년
                    {!available && (
                      <span
                        className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5"
                        style={{ backgroundColor: '#23233f', color: '#64748b', borderRadius: '2px' }}
                      >
                        준비중
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <p
              className="text-sm text-center font-medium"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
            >
              선택한 학년의 모험이 시작됩니다
            </p>
          </div>
        )}

        {/* ── Step 2: 캐릭터 선택 ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5 pt-8 pb-6">
            <div className="text-center">
              <h1
                className="text-[36px] font-medium leading-[45px] tracking-[-0.9px]"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
              >
                함께할 친구를 골라봐!
              </h1>
              <p
                className="mt-3 text-sm font-medium"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
              >
                지금은 전사만 선택 가능해요. 별을 모아 해금해봐!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {AVATARS.map(a => (
                <CharacterSelectCard
                  key={a.id}
                  avatar={a}
                  selected={avatarId === a.id}
                  onSelect={setAvatarId}
                  locked={a.starCost > 0}
                  isDefault={a.id === 'warrior'}
                />
              ))}
            </div>

            <div
              className="p-4 flex items-center gap-4 border-4"
              style={{
                backgroundColor: '#111127',
                borderColor: selectedAvatar.accentColor ?? '#38bdf8',
                boxShadow: `0 4px 0 #000000, 0 0 16px ${selectedAvatar.accentColor ? selectedAvatar.accentColor.replace(')', ', 0.3)') : 'rgba(56,189,248,0.3)'}`,
              }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden border-4"
                style={{
                  backgroundColor: '#1d1d37',
                  borderColor: selectedAvatar.accentColor ?? '#38bdf8',
                  boxShadow: '0 2px 0 #000000',
                }}
              >
                {selectedAvatar.imagePath
                  ? <img src={selectedAvatar.imagePath} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                  : <SwordIcon color={selectedAvatar.accentColor ?? '#38bdf8'} size={28} />
                }
              </div>
              <div>
                <p
                  className="text-xs font-bold mb-0.5"
                  style={{ color: selectedAvatar.accentColor ?? '#38bdf8' }}
                >
                  {selectedAvatar.name}의 특수 능력
                </p>
                <p className="text-sm leading-snug" style={{ color: '#aaa8c3' }}>
                  {selectedAvatar.specialAbility}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-6 py-5">
        {step < 2 && (
          <button
            className="w-full text-2xl font-medium transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              height: '68px',
              backgroundColor: '#38bdf8',
              color: '#003840',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.05em',
            }}
            disabled={step === 0 && name.trim().length === 0}
            onClick={() => setStep((step + 1) as 0 | 1 | 2)}
          >
            {step === 1 ? '다음 단계로 이동 →' : '다음 →'}
          </button>
        )}
        {step === 2 && (
          <button
            className="w-full text-2xl font-medium transition-all active:scale-[0.98]"
            style={{
              height: '68px',
              backgroundColor: '#38bdf8',
              color: '#003840',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.05em',
            }}
            onClick={handleComplete}
          >
            <span className="flex items-center justify-center gap-2">시작하기! <RocketIcon color="#003840" size={24} /></span>
          </button>
        )}
      </div>

      {showError && (
        <ConfirmModal
          title="오류 발생"
          message="시작하는 중에 문제가 생겼어. 다시 한번 눌러봐!"
          onConfirm={() => setShowError(false)}
        />
      )}

      {showToast && (
        <div
          className="fixed bottom-28 left-1/2 -translate-x-1/2 px-5 py-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap"
          style={{
            backgroundColor: '#23233f',
            color: '#aaa8c3',
            border: '1px solid #3a3a5c',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 50,
          }}
        >
          🔒 아직 준비중입니다
        </div>
      )}
    </div>
  )
}
