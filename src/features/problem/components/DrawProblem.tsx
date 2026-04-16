import React, { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  referenceImage: string
  referenceText?: string
  onSelfAssess: (isCorrect: boolean, drawingData?: string) => void
}

type Phase = 'drawing' | 'comparing'

export function DrawProblem({ referenceImage, referenceText, onSelfAssess }: Props) {
  const [phase, setPhase] = useState<Phase>('drawing')
  const [capturedImage, setCapturedImage] = useState<string | undefined>(undefined)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1e293b'

    // Figma 스펙: 노란색 캔버스 배경 #ffe792
    ctx.fillStyle = '#ffe792'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  useEffect(() => {
    if (phase === 'drawing') {
      const timer = setTimeout(setupCanvas, 100)
      return () => clearTimeout(timer)
    }
  }, [phase, setupCanvas])

  function getPos(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
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
    if (phase !== 'drawing') return
    e.preventDefault()
    drawing.current = true
    lastPos.current = getPos(e)
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!drawing.current || !lastPos.current || phase !== 'drawing') return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  function endDraw(e: React.TouchEvent | React.MouseEvent) {
    if (!drawing.current) return
    e.preventDefault()
    drawing.current = false
    lastPos.current = null
  }

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffe792'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  function handleCompareStart() {
    const canvas = canvasRef.current
    if (!canvas) {
      setPhase('comparing')
      return
    }

    const MAX_SIZE = 300
    const rect = canvas.getBoundingClientRect()
    let w = rect.width
    let h = rect.height

    if (w > h) {
      if (w > MAX_SIZE) { h = (h * MAX_SIZE) / w; w = MAX_SIZE }
    } else {
      if (h > MAX_SIZE) { w = (w * MAX_SIZE) / h; h = MAX_SIZE }
    }

    const offscreen = document.createElement('canvas')
    offscreen.width = Math.round(w)
    offscreen.height = Math.round(h)
    const offCtx = offscreen.getContext('2d')
    if (offCtx) {
      offCtx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height)
      setCapturedImage(offscreen.toDataURL('image/jpeg', 0.7))
    } else {
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.7))
    }

    setPhase('comparing')
  }

  function handleAssess(isCorrect: boolean) {
    onSelfAssess(isCorrect, capturedImage)
  }

  if (phase === 'comparing') {
    return (
      <div className="flex flex-col h-full gap-3">
        {/* 비교 안내 */}
        <p
          className="text-sm font-medium text-center"
          style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
        >
          두 그림을 비교해 보세요
        </p>

        <div className="flex flex-1 min-h-0 gap-3">
          {/* 내 그림 */}
          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            <span
              className="text-xs font-bold text-center"
              style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
            >
              내 그림
            </span>
            <div
              className="flex-1 w-full overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: '#ffe792', border: '1px solid #23233f' }}
            >
              {capturedImage ? (
                <img src={capturedImage} alt="내 그림" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-xs italic" style={{ color: '#655400' }}>그림 없음</span>
              )}
            </div>
          </div>

          {/* 정답 */}
          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            <span
              className="text-xs font-bold text-center"
              style={{ color: '#38bdf8', fontFamily: 'var(--font-sans)' }}
            >
              정답
            </span>
            <div
              className="flex-1 w-full overflow-hidden bg-white flex items-center justify-center p-3"
              style={{ border: '1px solid #38bdf8' }}
            >
              {referenceText ? (
                <p className="text-base font-bold text-center break-all" style={{ color: '#1e293b', fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap' }}>
                  {referenceText}
                </p>
              ) : (
                <img src={referenceImage} alt="정답 그림" className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>
        </div>

        {/* 자기 채점 버튼 */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleAssess(false)}
            className="w-full flex items-center justify-center text-xl font-medium transition-all active:scale-[0.97]"
            style={{
              height: '60px',
              backgroundColor: 'transparent',
              color: '#38bdf8',
              border: '2px solid #38bdf8',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.5px',
            }}
          >
            다시 그려볼래
          </button>
          <button
            onClick={() => handleAssess(true)}
            className="w-full flex items-center justify-center text-xl font-medium transition-all active:scale-[0.97]"
            style={{
              height: '60px',
              backgroundColor: '#38bdf8',
              color: '#005762',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.5px',
            }}
          >
            맞게 그렸어
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 캔버스 — Figma: #ffe792 배경 */}
      <div>
        {/* 그리기 영역 레이블 + 지우기 버튼 */}
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-sm font-medium"
            style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
          >
            그리기 영역
          </span>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-opacity active:opacity-70"
            style={{
              backgroundColor: '#ff716c',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
            }}
          >
            🗑️ 지우기
          </button>
        </div>
      </div>
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          style={{ backgroundColor: '#ffe792' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* 정답 확인 버튼 */}
      <div className="pt-3">
        <div style={{ backgroundColor: '#005762' }}>
          <button
            onClick={handleCompareStart}
            className="w-full flex items-center justify-center text-xl font-medium transition-all active:opacity-80 -translate-y-1"
            style={{
              height: '60px',
              backgroundColor: '#38bdf8',
              color: '#003840',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.5px',
              border: '2px solid #005762',
              display: 'flex',
            }}
          >
            정답 확인 ✓
          </button>
        </div>
      </div>
    </div>
  )
}
