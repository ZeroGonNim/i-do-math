interface Step {
  value: string
  label?: string // 예: "(365 × 5)"
}

interface Props {
  expression: string  // 예: "365 × 45"
  steps?: Step[]
  result: string      // 예: "16,425"
  className?: string
}

export function VerticalArithmetic({ expression, steps, result, className = '' }: Props) {
  const hasSteps = steps && steps.length > 0

  return (
    <div className={`px-5 py-4 ${className}`} style={{ border: '1px solid #c180ff', backgroundColor: '#000' }}>
      {/* 수식 헤더 */}
      <div className="border-b border-[#46465c] pb-2 text-right font-sans text-lg text-[#e5e3ff]">
        {expression}
      </div>

      {/* 중간 스텝 (부분 곱 등) */}
      {hasSteps && (
        <div className="mt-2 space-y-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-2 py-0.5 text-sm ${
                i === steps.length - 1
                  ? 'border-b border-[#46465c] pb-2'
                  : ''
              }`}
            >
              {step.label ? (
                <span className="font-sans text-xs text-[#e5e3ff]/50">{step.label}</span>
              ) : (
                <span />
              )}
              <span className="font-game text-[#e5e3ff]">{step.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* 최종 정답 */}
      <div className={`text-right font-game text-xl font-bold text-[#81ecff] ${hasSteps ? 'mt-2' : 'mt-2 border-t border-[#46465c] pt-2'}`}>
        {result}
      </div>
    </div>
  )
}
