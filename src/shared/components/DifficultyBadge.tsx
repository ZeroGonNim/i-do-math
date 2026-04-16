import type { Difficulty } from '@/types/problem'
import { LeafIcon, StarIcon, TrophyIcon } from '@/shared/components/PixelIcons'

interface Props {
  difficulty: Difficulty
  className?: string
  showLabel?: boolean
}

const CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  basic:     { label: '기초', color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  applied:   { label: '실력', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)'  },
  challenge: { label: '심화', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)'  },
}

function DifficultyIcon({ difficulty, color }: { difficulty: string; color: string }) {
  if (difficulty === 'applied')   return <StarIcon   color={color} size={10} />
  if (difficulty === 'challenge') return <TrophyIcon color={color} size={10} />
  return <LeafIcon color={color} size={10} />
}

export function DifficultyBadge({ difficulty, className = '', showLabel = true }: Props) {
  const cfg = (difficulty && CONFIG[difficulty]) ? CONFIG[difficulty] : CONFIG.basic

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold leading-none ${className}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <DifficultyIcon difficulty={difficulty} color={cfg.color} />
      {showLabel && <span>{cfg.label}</span>}
    </div>
  )
}
