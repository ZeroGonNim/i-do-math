interface Props {
  onKey: (key: string) => void
  mode?: 'fraction' | 'integer'
}

const FRACTION_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '0', 'del']
const INTEGER_KEYS  = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del']

export function CustomKeypad({ onKey, mode = 'fraction' }: Props) {
  const keys = mode === 'integer' ? INTEGER_KEYS : FRACTION_KEYS
  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {keys.map(k => (
        <button
          key={k}
          className="min-h-[48px] rounded-2xl bg-gray-100 text-xl font-bold active:bg-indigo-100 transition-colors"
          onClick={() => onKey(k)}
        >
          {k === 'del' ? '⌫' : k === '/' ? '÷' : k}
        </button>
      ))}
    </div>
  )
}
