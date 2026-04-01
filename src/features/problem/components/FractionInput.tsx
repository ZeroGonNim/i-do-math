interface Props {
  numerator: string
  denominator: string
  activeField: 'numerator' | 'denominator'
  onFieldSelect: (f: 'numerator' | 'denominator') => void
}

export function FractionInput({ numerator, denominator, activeField, onFieldSelect }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 text-2xl font-bold">
      <button
        className={`w-16 min-h-[48px] rounded-xl border-2 text-center transition-colors ${
          activeField === 'numerator' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
        }`}
        onClick={() => onFieldSelect('numerator')}
      >
        {numerator || '_'}
      </button>
      <span className="text-3xl text-gray-500">/</span>
      <button
        className={`w-16 min-h-[48px] rounded-xl border-2 text-center transition-colors ${
          activeField === 'denominator' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
        }`}
        onClick={() => onFieldSelect('denominator')}
      >
        {denominator || '_'}
      </button>
    </div>
  )
}
