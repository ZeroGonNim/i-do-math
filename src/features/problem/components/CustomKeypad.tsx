import type { AnswerType } from '@/types/problem'

interface Props {
  onKey: (key: string) => void
  mode?: AnswerType
  compact?: boolean
}

const FRACTION_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
const INTEGER_KEYS  = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del']

export function CustomKeypad({ onKey, mode = 'fraction', compact = false }: Props) {
  const keys = mode === 'integer' ? INTEGER_KEYS : FRACTION_KEYS
  return (
    <div className={`grid grid-cols-3 ${compact ? 'gap-1.5 p-3' : 'gap-2 p-4'}`}>
      {keys.map((k, i) => (
        <button
          key={i}
          disabled={k === ''}
          className={`${compact ? 'min-h-[44px] text-xl' : 'min-h-[56px] text-2xl'} font-bold transition-all active:opacity-60 active:scale-[0.97]`}
          style={{
            backgroundColor: k === '' ? 'transparent' : '#1d1d37',
            color: k === 'del' ? '#ff716c' : '#e5e3ff',
            border: k === '' ? 'none' : '1px solid #23233f',
            visibility: k === '' ? 'hidden' : 'visible',
            fontFamily: 'var(--font-game)',
          }}
          onClick={() => onKey(k)}
        >
          {k === 'del' ? '⌫' : k}
        </button>
      ))}
    </div>
  )
}
