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
          className="w-20 h-16 border-2 text-3xl font-bold transition-colors active:scale-95"
          style={selected === sym
            ? { borderColor: '#81ecff', backgroundColor: '#0d1f2a', color: '#81ecff', boxShadow: '0 0 12px rgba(129,236,255,0.2)', fontFamily: 'var(--font-game)' }
            : { borderColor: '#23233f', backgroundColor: '#1d1d37', color: '#aaa8c3', fontFamily: 'var(--font-game)' }
          }
        >
          {sym}
        </button>
      ))}
    </div>
  )
}
