type Symbol = '>' | '=' | '<'

interface Props {
  selected: Symbol | null
  onSelect: (symbol: Symbol) => void
}

const SYMBOLS: Symbol[] = ['>', '=', '<']

export function SymbolInput({ selected, onSelect }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 px-4">
      {SYMBOLS.map(sym => (
        <button
          key={sym}
          onClick={() => onSelect(sym)}
          className={`w-20 h-16 rounded-2xl border-2 text-3xl font-bold transition-colors active:scale-95 ${
            selected === sym
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-500'
          }`}
        >
          {sym}
        </button>
      ))}
    </div>
  )
}
