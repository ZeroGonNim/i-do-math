import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  referenceImage: string
  onSelfAssess: (isCorrect: boolean) => void
}

type Phase = 'drawing' | 'comparing'

export function DrawProblem({ referenceImage, onSelfAssess }: Props) {
  const [phase, setPhase] = useState<Phase>('drawing')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1e293b'
  }, [])

  function getPos(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    }
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    drawing.current = true
    lastPos.current = getPos(e)
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    if (!drawing.current || !lastPos.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  function endDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    drawing.current = false
    lastPos.current = null
  }

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  if (phase === 'comparing') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-1 min-h-0 gap-1">
          {/* 내 그림 */}
          <div className="flex-1 flex flex-col items-center min-h-0">
            <span className="text-xs font-bold text-gray-500 py-1">내 그림</span>
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-200 bg-amber-50">
              <canvas
                ref={canvasRef}
                className="w-full h-full pointer-events-none"
              />
            </div>
          </div>
          {/* 정답 */}
          <div className="flex-1 flex flex-col items-center min-h-0">
            <span className="text-xs font-bold text-blue-500 py-1">정답</span>
            <div className="flex-1 w-full rounded-xl overflow-hidden border-2 border-blue-200 bg-white flex items-center justify-center">
              <img
                src={referenceImage}
                alt="정답 그림"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* 자기 채점 버튼 */}
        <div className="pt-3 pb-2 flex flex-col gap-2">
          <p className="text-center text-sm font-medium text-gray-600">두 그림을 비교해 보세요</p>
          <div className="flex gap-3">
            <button
              onClick={() => onSelfAssess(true)}
              className="flex-1 min-h-[52px] rounded-2xl bg-green-500 text-white text-base font-bold active:scale-95 transition-transform"
            >
              맞게 그렸어 ⭕
            </button>
            <button
              onClick={() => onSelfAssess(false)}
              className="flex-1 min-h-[52px] rounded-2xl bg-red-400 text-white text-base font-bold active:scale-95 transition-transform"
            >
              다시 그려볼래 ❌
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 캔버스 */}
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair bg-amber-50 rounded-2xl"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={handleClear}
          className="absolute bottom-2 right-2 rounded-xl bg-white/80 border border-gray-200 px-3 py-1 text-xs font-bold text-gray-500 shadow-sm active:bg-gray-100"
        >
          지우기 🧹
        </button>
      </div>

      {/* 정답 확인 버튼 */}
      <div className="pt-3 pb-2">
        <button
          onClick={() => setPhase('comparing')}
          className="w-full min-h-[52px] rounded-2xl bg-blue-500 text-white text-xl font-bold active:scale-[0.98] transition-transform"
        >
          정답 확인 ✓
        </button>
      </div>
    </div>
  )
}
