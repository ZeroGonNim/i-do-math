import { formatNumber } from '@/shared/utils/format'

interface Props {
  numerator: string
  denominator: string
  activeField: 'numerator' | 'denominator'
  onFieldSelect: (f: 'numerator' | 'denominator') => void
}

export function FractionInput({ numerator, denominator, activeField, onFieldSelect }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 text-3xl font-bold">
      <button
        className="w-20 min-h-[56px] flex items-center justify-center text-center transition-all active:scale-[0.97]"
        style={{
          backgroundColor: '#000',
          border: `2px solid ${activeField === 'numerator' ? '#38bdf8' : '#23233f'}`,
          boxShadow: activeField === 'numerator' ? '0 0 12px rgba(56,189,248,0.25)' : 'none',
          color: '#e5e3ff',
          fontFamily: 'var(--font-game)',
        }}
        onClick={() => onFieldSelect('numerator')}
      >
        {numerator ? formatNumber(numerator) : <span style={{ color: '#23233f' }}>?</span>}
      </button>
      <span className="text-4xl" style={{ color: '#aaa8c3' }}>/</span>
      <button
        className="w-20 min-h-[56px] flex items-center justify-center text-center transition-all active:scale-[0.97]"
        style={{
          backgroundColor: '#000',
          border: `2px solid ${activeField === 'denominator' ? '#38bdf8' : '#23233f'}`,
          boxShadow: activeField === 'denominator' ? '0 0 12px rgba(56,189,248,0.25)' : 'none',
          color: '#e5e3ff',
          fontFamily: 'var(--font-game)',
        }}
        onClick={() => onFieldSelect('denominator')}
      >
        {denominator ? formatNumber(denominator) : <span style={{ color: '#23233f' }}>?</span>}
      </button>
    </div>
  )
}
