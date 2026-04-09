import { useRef, useEffect, useCallback } from 'react'

interface Props {
  onClear?: () => void
}

export function Scratchpad({ onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const dprRef = useRef(window.devicePixelRatio || 1)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = dprRef.current
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1e293b'
  }, [])

  // 레이아웃 완료 후 초기화 (requestAnimationFrame으로 타이밍 보장)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      initCanvas()
    })
    return () => cancelAnimationFrame(raf)
  }, [initCanvas])

  function getPos(e: React.TouchEvent | React.MouseEvent): { x: number; y: number } {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0] ?? e.changedTouches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
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
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
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
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onClear?.()
  }, [onClear])

  return (
    <div className="relative w-full h-full">
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
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={handleClear}
        className="absolute bottom-2 right-2 px-3 py-1 text-xs font-bold active:opacity-70"
        style={{ backgroundColor: '#17172f', color: '#aaa8c3', border: '1px solid #46465c', fontFamily: 'var(--font-game)' }}
      >
        지우기 🧹
      </button>
    </div>
  )
}
