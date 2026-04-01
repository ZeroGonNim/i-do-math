interface Props {
  onKey: (key: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '0', 'del']

export function CustomKeypad({ onKey }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {KEYS.map(k => (
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
