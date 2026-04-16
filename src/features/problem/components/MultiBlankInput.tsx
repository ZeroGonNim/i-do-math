import { formatNumber } from '@/shared/utils/format'

interface Props {
  values: string[]
  labels?: string[]
  activeIndex: number
  onFocus: (index: number) => void
}

export function MultiBlankInput({ values, labels, activeIndex, onFocus }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 flex-wrap">
      {values.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          {labels?.[i] && (
            <span
              className="text-[10px] font-bold uppercase tracking-tighter"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
            >
              {labels[i]}
            </span>
          )}
          <button
            onClick={() => onFocus(i)}
            className="min-w-[80px] min-h-[56px] px-3 flex items-center justify-center text-3xl font-bold transition-all active:scale-[0.97]"
            style={{
              backgroundColor: '#000',
              border: `2px solid ${activeIndex === i ? '#38bdf8' : '#23233f'}`,
              boxShadow: activeIndex === i ? '0 0 12px rgba(56,189,248,0.25)' : 'none',
              color: '#e5e3ff',
              fontFamily: 'var(--font-game)',
            }}
          >
            {val ? formatNumber(val) : <span style={{ color: '#23233f', fontSize: '1.25rem' }}>?</span>}
          </button>
        </div>
      ))}
    </div>
  )
}
