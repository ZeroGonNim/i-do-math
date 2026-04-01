import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import type { CharacterId } from '@/types/user'

const CHARACTERS: Array<{ id: CharacterId; label: string; emoji: string }> = [
  { id: 'char-01', label: '호기심 토끼', emoji: '🐰' },
  { id: 'char-02', label: '용감한 곰', emoji: '🐻' },
  { id: 'char-03', label: '똑똑한 부엉이', emoji: '🦉' },
  { id: 'char-04', label: '씩씩한 사자', emoji: '🦁' },
]

export function OnboardingRoute() {
  const { step, setStep, name, setName, grade, setGrade, characterId, setCharacterId, complete } =
    useOnboarding()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 bg-indigo-50">
      {step === 0 && (
        <>
          <h1 className="text-2xl font-bold text-gray-800">이름이 뭐야? 👋</h1>
          <input
            className="w-full max-w-xs rounded-xl border-2 border-indigo-300 p-4 text-xl text-center focus:outline-none focus:border-indigo-500 bg-white"
            placeholder="이름을 입력해줘"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={10}
          />
          <button
            className="min-h-[48px] w-full max-w-xs rounded-2xl bg-indigo-500 text-white text-xl font-bold disabled:opacity-40 transition-opacity"
            disabled={name.trim().length === 0}
            onClick={() => setStep(1)}
          >
            다음 →
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold text-gray-800">몇 학년이야? 🎒</h1>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button
                key={g}
                className={`min-h-[48px] rounded-2xl text-xl font-bold border-2 px-4 transition-colors ${
                  grade === g
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
                onClick={() => setGrade(g)}
              >
                {g}학년
              </button>
            ))}
          </div>
          <button
            className="min-h-[48px] w-full max-w-xs rounded-2xl bg-indigo-500 text-white text-xl font-bold"
            onClick={() => setStep(2)}
          >
            다음 →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold text-gray-800">함께할 친구를 골라봐! 🌟</h1>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {CHARACTERS.map(c => (
              <button
                key={c.id}
                className={`min-h-[48px] rounded-2xl border-2 p-4 text-center transition-colors ${
                  characterId === c.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setCharacterId(c.id)}
              >
                <div className="text-4xl">{c.emoji}</div>
                <div className="mt-1 font-bold text-gray-700">{c.label}</div>
              </button>
            ))}
          </div>
          <button
            className="min-h-[48px] w-full max-w-xs rounded-2xl bg-green-500 text-white text-xl font-bold"
            onClick={complete}
          >
            🟢 시작하기!
          </button>
        </>
      )}
    </div>
  )
}
