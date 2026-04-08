import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { CharacterSelectCard, CHARACTERS } from '@/shared/components/CharacterSelectCard'
import { userProfileRepo } from '@/shared/db/userProfileRepo'

export function OnboardingRoute() {
  const navigate = useNavigate()
  const { step, setStep, name, setName, grade, setGrade, characterId, setCharacterId, complete } =
    useOnboarding()

  useEffect(() => {
    userProfileRepo.get().then(profile => {
      if (profile) navigate('/home', { replace: true })
    })
  }, [navigate])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-10"
         style={{ backgroundColor: 'var(--color-bg-base)' }}>

      {/* 스텝 인디케이터 */}
      <div className="flex gap-2 items-center">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
               style={{
                 width: i === step ? '28px' : '8px',
                 backgroundColor: i <= step ? 'var(--color-cyan)' : 'var(--color-border)',
                 boxShadow: i === step ? 'var(--shadow-glow-cyan)' : 'none',
               }} />
        ))}
      </div>

      {step === 0 && (
        <>
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>
            이름이 뭐야? 👋
          </h1>
          <input
            className="w-full max-w-xs rounded-xl p-4 text-xl text-center focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '2px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              boxShadow: 'var(--shadow-card)',
            }}
            placeholder="이름을 입력해줘"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={10}
            onFocus={e => {
              e.target.style.borderColor = 'var(--color-cyan)'
              e.target.style.boxShadow = 'var(--shadow-glow-cyan)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--color-border)'
              e.target.style.boxShadow = 'var(--shadow-card)'
            }}
          />
          <button
            className="min-h-[52px] w-full max-w-xs rounded-xl text-lg font-bold disabled:opacity-40 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#071a14' }}
            disabled={name.trim().length === 0}
            onClick={() => setStep(1)}
          >
            다음  →
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>
            몇 학년이야? 🎒
          </h1>
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button
                key={g}
                className="min-h-[56px] rounded-xl text-lg font-bold transition-all active:scale-[0.96]"
                style={grade === g
                  ? {
                      background: 'linear-gradient(135deg, var(--color-cyan), #50d8f0)',
                      color: '#0D0D0D',
                      border: '2px solid var(--color-cyan)',
                      boxShadow: 'var(--shadow-glow-cyan)',
                    }
                  : {
                      backgroundColor: 'var(--color-bg-raised)',
                      color: 'var(--color-text-primary)',
                      border: '2px solid var(--color-border)',
                    }
                }
                onClick={() => setGrade(g)}
              >
                {g}학년
              </button>
            ))}
          </div>
          <button
            className="min-h-[52px] w-full max-w-xs rounded-xl text-lg font-bold transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#071a14' }}
            onClick={() => setStep(2)}
          >
            다음  →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>
            함께할 친구를 골라봐! 🌟
          </h1>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {CHARACTERS.map(c => (
              <CharacterSelectCard
                key={c.id}
                char={c}
                selected={characterId === c.id}
                onSelect={setCharacterId}
              />
            ))}
          </div>
          <button
            className="btn-glow-green min-h-[52px] w-full max-w-xs rounded-xl text-lg font-bold disabled:opacity-40 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#071a14' }}
            disabled={!characterId}
            onClick={complete}
          >
            시작하기!  →
          </button>
        </>
      )}
    </div>
  )
}
