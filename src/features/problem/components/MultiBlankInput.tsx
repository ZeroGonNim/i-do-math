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
            <span className="text-xs font-medium text-gray-500">{labels[i]}</span>
          )}
          <button
            onClick={() => onFocus(i)}
            className={`min-w-[80px] min-h-[52px] rounded-xl border-2 px-3 flex items-center justify-center text-2xl font-bold transition-colors ${
              activeIndex === i
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-300 bg-gray-50 text-gray-700'
            }`}
          >
            {val || '_'}
          </button>
        </div>
      ))}
    </div>
  )
}
