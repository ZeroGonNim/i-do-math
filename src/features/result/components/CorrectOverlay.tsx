import { useEffect, useRef } from 'react'
import { StarIcon } from '@/shared/components/PixelIcons'
import { useTheme } from '@/shared/hooks/useTheme'

interface Props {
  stars: number
  onDone: () => void
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  color: string; size: number; shape: 'rect' | 'circle'
  rotation: number; rotSpeed: number; alpha: number
}

const COLORS = ['#38bdf8', '#ffe792', '#8b5cf6', '#ff716c', '#69DB7C', '#FF922B']

function createParticles(w: number, h: number): Particle[] {
  return Array.from({ length: 70 }, (_, i) => {
    const spread = (i / 70) * Math.PI * 2
    const speed = 6 + Math.random() * 8
    return {
      x: w / 2 + (Math.random() - 0.5) * w * 0.25,
      y: h * 0.4,
      vx: Math.cos(spread) * speed * (0.4 + Math.random()),
      vy: Math.sin(spread) * speed - Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 5 + Math.random() * 7,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      alpha: 1,
    }
  })
}

export function CorrectOverlay({ stars, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const theme = useTheme()

  // Auto-close after 1 second
  useEffect(() => {
    const timer = setTimeout(onDone, 1000)
    return () => clearTimeout(timer)
  }, [onDone])

  // Run confetti animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const { width: w, height: h } = canvas
    const particles = createParticles(w, h)
    let start = 0
    const DURATION = 2000

    function draw(ts: number) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / DURATION, 1)
      ctx!.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.3
        p.vx *= 0.99
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.alpha = Math.max(0, 1 - progress * 1.4)

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
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(12,12,31,0.85)', backdropFilter: 'blur(8px)' }}
    >
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Modal card */}
      <div
        className="relative z-10 flex flex-col items-center mx-6"
        style={{
          width: '342px',
          backgroundColor: '#0f172a',
          border: `2px solid ${theme.primary}`,
          boxShadow: `0 0 40px ${theme.primary}40`,
          animation: 'correctPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* Pixel pattern decoration strip */}
        <div
          className="w-full h-2"
          style={{
            background: `repeating-linear-gradient(90deg, ${theme.primary} 0px, ${theme.primary} 8px, transparent 8px, transparent 16px)`,
            opacity: 0.3,
          }}
        />

        <div className="flex flex-col items-center px-6 py-8 gap-5 w-full">
          {/* Big check icon */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '128px',
              height: '128px',
              backgroundColor: theme.primary,
            }}
          >
            <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
              <path
                d="M4 26L22 44L60 6"
                stroke="#000"
                strokeWidth="10"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </div>

          {/* 정답! text */}
          <p
            className="text-5xl font-black text-center"
            style={{ color: theme.primary, fontFamily: 'var(--font-sans)', lineHeight: '48px' }}
          >
            정답!
          </p>

          {/* Star reward banner */}
          <div
            className="w-full flex items-center justify-center gap-3 py-4"
            style={{ backgroundColor: '#ffe792' }}
          >
            <StarIcon color="#655400" size={24} />
            <span
              className="text-2xl font-bold"
              style={{ color: '#655400', fontFamily: 'var(--font-game)' }}
            >
              +{stars}별 획득!
            </span>
          </div>
        </div>

        {/* Bottom pixel strip */}
        <div
          className="w-full h-2"
          style={{
            background: `repeating-linear-gradient(90deg, ${theme.primary} 0px, ${theme.primary} 8px, transparent 8px, transparent 16px)`,
            opacity: 0.3,
          }}
        />
      </div>

      <style>{`
        @keyframes correctPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
