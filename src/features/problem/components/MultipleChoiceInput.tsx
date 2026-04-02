interface Props {
  choices?: string[]
  choiceImages?: string[]
  selected: number | null
  onSelect: (choice: number) => void
}

const LABELS = ['①', '②', '③', '④', '⑤']

export function MultipleChoiceInput({ choices, choiceImages, selected, onSelect }: Props) {
  // 이미지 선택지 모드
  if (choiceImages && choiceImages.length > 0) {
    return (
      <div className="grid grid-cols-3 gap-2 px-4">
        {choiceImages.map((src, i) => {
          const num = i + 1
          const isSelected = selected === num
          return (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-colors active:scale-[0.97] ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <img
                src={src}
                alt={`선택지 ${LABELS[i]}`}
                className="w-full h-20 object-contain"
              />
              <span className={`text-sm font-bold ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                {LABELS[i]}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // 텍스트 선택지 모드
  return (
    <div className="flex flex-col gap-2 px-4">
      {(choices ?? []).map((text, i) => {
        const num = i + 1
        const isSelected = selected === num
        return (
          <button
            key={num}
            onClick={() => onSelect(num)}
            className={`flex items-center gap-3 w-full min-h-[48px] rounded-xl border-2 px-4 py-2 text-left text-base font-medium transition-colors active:scale-[0.98] ${
              isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <span className={`text-lg font-bold ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
              {LABELS[i]}
            </span>
            <span>{text}</span>
          </button>
        )
      })}
    </div>
  )
}
