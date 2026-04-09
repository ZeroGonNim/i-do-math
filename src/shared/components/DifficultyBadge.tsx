import type { Difficulty } from '@/types/problem'

interface Props {
  difficulty: Difficulty
  className?: string
  showLabel?: boolean
}

const CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  basic: {
    label: '기초',
    icon: '🌿',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
  },
  applied: {
    label: '실력',
    icon: '⭐',
    color: '#81ecff',
    bg: 'rgba(129,236,255,0.12)',
    border: 'rgba(129,236,255,0.3)',
  },
  challenge: {
    label: '심화',
    icon: '🏆',
    color: '#c180ff',
    bg: 'rgba(193,128,255,0.12)',
    border: 'rgba(193,128,255,0.3)',
  },
}

export function DifficultyBadge({ difficulty, className = '', showLabel = true }: Props) {
  const cfg = (difficulty && CONFIG[difficulty]) ? CONFIG[difficulty] : CONFIG.basic

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold leading-none ${className}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span>{cfg.icon}</span>
      {showLabel && <span>{cfg.label}</span>}
    </div>
  )
}
