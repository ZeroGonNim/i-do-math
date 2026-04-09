import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { CharacterSelectCard, AVATARS } from '@/shared/components/CharacterSelectCard'
import { userProfileRepo } from '@/shared/db/userProfileRepo'

const STEP_LABELS = ['영웅 만들기', '학년 설정', '동료 선택']
const STEP_NUMBERS = ['01단계', '02단계', '03단계']

export function OnboardingRoute() {
  const navigate = useNavigate()
  const { step, setStep, name, setName, grade, setGrade, avatarId, setAvatarId, complete } =
    useOnboarding()

  useEffect(() => {
    userProfileRepo.get().then(profile => {
      if (profile) navigate('/home', { replace: true })
    })
  }, [navigate])

  const selectedAvatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0]
  const progressPct = ((step + 1) / 3) * 100

  return (
    <div
      className="flex h-dvh flex-col"
      style={{ backgroundColor: '#0c0c1f' }}
    >
      {/* Top App Bar */}
      <div
        className="shrink-0 flex items-center px-6 h-16"
        style={{ backgroundColor: '#0c0c1f', borderBottom: '1px solid #1c1c3a' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base" style={{ color: '#81ecff' }}>👤</span>
          <span
            className="text-xl font-medium"
            style={{ color: '#81ecff', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}
          >
            수학 퀘스트
          </span>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="shrink-0 px-6 pt-5 pb-3">
        <div
          className="w-full h-4 rounded-sm overflow-hidden"
          style={{ backgroundColor: '#23233f', border: '1px solid #46465c' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #00d4ec, #81ecff)',
              boxShadow: '0 0 8px rgba(129,236,255,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <span
            className="text-sm font-medium"
            style={{ color: '#c180ff', fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}
          >
            {STEP_NUMBERS[step]}
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: '#81ecff', fontFamily: 'var(--font-sans)' }}
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
                이름이 뭐야? 👋
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
                style={{ color: '#c180ff', fontFamily: 'var(--font-sans)' }}
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
                    e.target.style.borderColor = '#81ecff'
                    e.target.style.boxShadow = '0 0 0 1px #81ecff'
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
              className="p-5 flex items-center gap-5"
              style={{ backgroundColor: '#111127', border: '1.5px solid #81ecff' }}
            >
              <div
                className="w-16 h-16 flex items-center justify-center shrink-0 overflow-hidden"
                style={{ backgroundColor: '#1d1d37', border: '1.5px solid #81ecff' }}
              >
                {selectedAvatar.imagePath
                  ? <img src={selectedAvatar.imagePath} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                  : <span className="text-3xl">⚔️</span>
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
              {[
                { g: 1, emoji: '🌱' },
                { g: 2, emoji: '🌿' },
                { g: 3, emoji: '🍀' },
                { g: 4, emoji: '🌳' },
                { g: 5, emoji: '🍎' },
                { g: 6, emoji: '💎' },
              ].map(({ g, emoji }) => (
                <button
                  key={g}
                  className="flex flex-col items-center justify-center gap-2 py-6 text-xl font-bold transition-all active:scale-[0.96]"
                  style={grade === g
                    ? {
                        backgroundColor: '#81ecff',
                        color: '#0c0c1f',
                        border: '2px solid #81ecff',
                        boxShadow: '0 0 16px rgba(129,236,255,0.5)',
                        fontFamily: 'var(--font-game)',
                      }
                    : {
                        backgroundColor: '#1d1d37',
                        color: '#e5e3ff',
                        border: '2px solid #23233f',
                        fontFamily: 'var(--font-game)',
                      }
                  }
                  onClick={() => setGrade(g)}
                >
                  <span style={{ fontSize: '32px', lineHeight: 1 }}>{emoji}</span>
                  {g}학년
                </button>
              ))}
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
                함께할 친구를 골라봐! 🌟
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
              className="p-4 flex items-center gap-4"
              style={{
                backgroundColor: '#111127',
                border: `1.5px solid ${selectedAvatar.accentColor ?? '#81ecff'}`,
              }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  backgroundColor: '#1d1d37',
                  border: `2px solid ${selectedAvatar.accentColor ?? '#81ecff'}`,
                }}
              >
                {selectedAvatar.imagePath
                  ? <img src={selectedAvatar.imagePath} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl">⚔️</span>
                }
              </div>
              <div>
                <p
                  className="text-xs font-bold mb-0.5"
                  style={{ color: selectedAvatar.accentColor ?? '#81ecff' }}
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
              backgroundColor: '#81ecff',
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
              backgroundColor: '#81ecff',
              color: '#003840',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.05em',
            }}
            onClick={complete}
          >
            시작하기! 🚀
          </button>
        )}
      </div>
    </div>
  )
}
