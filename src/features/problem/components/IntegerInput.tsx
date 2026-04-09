import { formatNumber } from '@/shared/utils/format'

interface Props {
  value: string
  unit?: string
}

export function IntegerInput({ value, unit }: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div
        className="min-w-[160px] min-h-[64px] flex items-center justify-center px-4"
        style={{
          backgroundColor: '#000',
          border: '2px solid #81ecff',
          boxShadow: '0 0 12px rgba(129,236,255,0.2)',
        }}
      >
        <span className="text-4xl font-bold tracking-widest" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
          {value ? formatNumber(value) : <span style={{ color: '#23233f' }}>?</span>}
        </span>
      </div>
      {unit && (
        <span className="text-2xl font-bold" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>{unit}</span>
      )}
    </div>
  )
}
