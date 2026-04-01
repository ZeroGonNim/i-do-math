import { useState } from 'react'

interface Props {
  title: string
  onConfirm: (pin: string) => void
  onCancel: () => void
}

export function PinInputModal({ title, onConfirm, onCancel }: Props) {
  const [pin, setPin] = useState('')

  function handleKey(key: string) {
    if (key === 'del') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (pin.length >= 4) return
    const next = pin + key
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => onConfirm(next), 100)
    }
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-8">
        <h3 className="text-center font-bold text-gray-800 text-lg mb-6">{title}</h3>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pin.length ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((d, i) => {
            if (d === '') return <div key={i} />
            return (
              <button
                key={i}
                onClick={() => handleKey(d)}
                className={`min-h-[56px] rounded-2xl font-bold text-xl transition-colors ${
                  d === 'del'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-50 text-gray-800 active:bg-indigo-100'
                }`}
              >
                {d === 'del' ? '⌫' : d}
              </button>
            )
          })}
        </div>

        <button
          className="w-full mt-4 min-h-[44px] text-gray-400 text-sm"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </div>
  )
}
