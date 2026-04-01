import { useEffect, useRef } from 'react'

interface Props {
  stars: number
  onDone: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  shape: 'rect' | 'circle'
  rotation: number
  rotSpeed: number
  alpha: number
}

const COLORS = [
  '#FF6B6B', '#FF922B', '#FFD43B',
  '#69DB7C', '#4DABF7', '#CC5DE8',
  '#FF8CC8', '#63E6BE',
]

function createParticles(w: number, h: number, count = 90): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const spread = (i / count) * Math.PI * 2
    const speed = 8 + Math.random() * 10
    return {
      x: w / 2 + (Math.random() - 0.5) * w * 0.3,
      y: h * 0.45,
      vx: Math.cos(spread) * speed * (0.5 + Math.random()),
      vy: Math.sin(spread) * speed - Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.25,
      alpha: 1,
    }
  })
}

const TOTAL_MS = 2400

export function CorrectOverlay({ stars, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width = window.innerWidth
    const h = canvas.height = window.innerHeight
    const particles = createParticles(w, h)

    function draw(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / TOTAL_MS, 1)

      ctx!.clearRect(0, 0, w, h)

      // 오버레이 페이드인 → 페이드아웃
      const overlayAlpha = progress < 0.15
        ? progress / 0.15 * 0.55
        : progress > 0.6
          ? (1 - (progress - 0.6) / 0.4) * 0.55
          : 0.55
      ctx!.fillStyle = `rgba(255,255,255,${overlayAlpha})`
      ctx!.fillRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.35   // gravity
        p.vx *= 0.985  // air resistance
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.alpha = Math.max(0, 1 - progress * 1.3)

        ctx!.save()
        ctx!.globalAlpha = p.alpha
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rotation)
        ctx!.fillStyle = p.color

        if (p.shape === 'circle') {
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        } else {
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        }
        ctx!.restore()
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(draw)
      } else {
        onDone()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 중앙 체크마크 팝 */}
      <div
        className="relative z-10 flex flex-col items-center gap-3"
        style={{ animation: 'correctPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center shadow-2xl">
          <span className="text-6xl">✓</span>
        </div>
        <p className="text-3xl font-black text-green-600 drop-shadow-sm">정답!</p>
        <p className="text-lg font-bold text-yellow-500">+{stars}⭐ 획득!</p>
      </div>

      <style>{`
        @keyframes correctPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
          80%  { transform: scale(0.95) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
