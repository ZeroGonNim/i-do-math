import type { CharacterId } from '@/types/user'

interface CharacterDef {
  id: CharacterId
  emoji: string
  name: string
  color: string      // bg color when selected
  ringColor: string  // border ring color
}

export const CHARACTERS: CharacterDef[] = [
  { id: 'char-01', emoji: '🦊', name: '여우',    color: 'bg-orange-100', ringColor: 'ring-orange-400' },
  { id: 'char-02', emoji: '🐼', name: '판다',    color: 'bg-gray-100',   ringColor: 'ring-gray-500'   },
  { id: 'char-03', emoji: '🦁', name: '사자',    color: 'bg-yellow-100', ringColor: 'ring-yellow-500' },
  { id: 'char-04', emoji: '🐬', name: '돌고래',  color: 'bg-blue-100',   ringColor: 'ring-blue-400'   },
]

interface Props {
  char: CharacterDef
  selected: boolean
  onSelect: (id: CharacterId) => void
}

export function CharacterSelectCard({ char, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(char.id)}
      className={`
        relative flex flex-col items-center py-4 rounded-2xl border-2 transition-all duration-200
        ${selected
          ? `${char.color} border-transparent ring-4 ${char.ringColor} scale-105 shadow-lg`
          : 'bg-gray-50 border-gray-100 hover:scale-102'
        }
      `}
      style={selected ? { animation: 'charSelect 0.35s cubic-bezier(0.34,1.56,0.64,1)' } : undefined}
    >
      {/* 선택 완료 뱃지 */}
      {selected && (
        <span
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow"
          style={{ animation: 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.15s both' }}
        >
          ✓
        </span>
      )}

      <span
        className="text-4xl transition-transform duration-200"
        style={selected ? { animation: 'emojiWiggle 0.4s ease 0.1s' } : undefined}
      >
        {char.emoji}
      </span>
      <span className={`text-sm font-bold mt-2 ${selected ? 'text-gray-800' : 'text-gray-500'}`}>
        {char.name}
      </span>

      <style>{`
        @keyframes charSelect {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          70%  { transform: scale(1.02); }
          100% { transform: scale(1.05); }
        }
        @keyframes emojiWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(-12deg) scale(1.2); }
          50%  { transform: rotate(12deg) scale(1.15); }
          75%  { transform: rotate(-6deg) scale(1.1); }
        }
        @keyframes badgePop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }
      `}</style>
    </button>
  )
}
