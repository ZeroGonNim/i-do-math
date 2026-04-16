
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
      <div className="grid grid-cols-2 gap-3 px-4">
        {choiceImages.map((src, i) => {
          const num = i + 1
          const isSelected = selected === num

          const cleanSrc = src.startsWith('/') ? src.slice(1) : src
          const imageFullUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${cleanSrc}`

          return (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className="flex flex-col items-center gap-2 p-3 transition-all active:scale-[0.96]"
              style={{
                backgroundColor: isSelected ? '#0d1f2a' : '#1d1d37',
                border: `2px solid ${isSelected ? '#38bdf8' : '#23233f'}`,
                boxShadow: isSelected ? '0 0 12px rgba(56,189,248,0.2)' : 'none',
              }}
            >
              <div className="w-full aspect-square flex items-center justify-center overflow-hidden"
                   style={{ backgroundColor: '#000' }}>
                <img
                  src={imageFullUrl}
                  alt={`선택지 ${LABELS[i]}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23111127"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2346465c" font-size="12">이미지 없음</text></svg>'
                  }}
                />
              </div>
              <span
                className="text-base font-bold"
                style={{ color: isSelected ? '#38bdf8' : '#aaa8c3', fontFamily: 'var(--font-game)' }}
              >
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
            className="flex items-center gap-4 w-full min-h-[56px] px-5 py-3 text-left text-lg font-bold transition-all active:scale-[0.98]"
            style={{
              backgroundColor: isSelected ? '#0d1f2a' : '#1d1d37',
              border: `2px solid ${isSelected ? '#38bdf8' : '#23233f'}`,
              boxShadow: isSelected ? '0 0 12px rgba(56,189,248,0.2)' : 'none',
            }}
          >
            <span
              className="text-xl font-bold shrink-0"
              style={{ color: isSelected ? '#38bdf8' : '#64748b', fontFamily: 'var(--font-game)' }}
            >
              {LABELS[i]}
            </span>
            <span className="leading-tight" style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}>
              {text}
            </span>
          </button>
        )
      })}
    </div>
  )
}
