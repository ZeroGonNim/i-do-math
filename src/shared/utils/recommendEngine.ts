import type { Problem, Difficulty } from '@/types/problem'

const DIFFICULTY_ORDER: Difficulty[] = ['basic', 'applied', 'challenge']

function lowerDifficulty(d: Difficulty): Difficulty {
  const i = DIFFICULTY_ORDER.indexOf(d)
  return i > 0 ? DIFFICULTY_ORDER[i - 1] : 'basic'
}

function higherDifficulty(d: Difficulty): Difficulty {
  const i = DIFFICULTY_ORDER.indexOf(d)
  return i < 2 ? DIFFICULTY_ORDER[i + 1] : 'challenge'
}

interface Params {
  concept: string
  currentDifficulty: Difficulty
  isCorrect: boolean
  recentIds: string[]
  pool: Problem[]
  avgTimeSpent?: number
  timeSpent?: number
}

export function selectRecommendedProblem(params: Params): Problem | null {
  const { concept, currentDifficulty, isCorrect, recentIds, pool, avgTimeSpent, timeSpent } = params
  const available = pool.filter(p => p.concept === concept && !recentIds.includes(p.id))

  const isHard = timeSpent != null && avgTimeSpent != null && timeSpent > avgTimeSpent * 2
  const isFast = timeSpent != null && avgTimeSpent != null && timeSpent <= avgTimeSpent * 1.5

  let priorities: Difficulty[]
  if (isCorrect) {
    const target = isFast ? higherDifficulty(currentDifficulty) : currentDifficulty
    priorities = [target, currentDifficulty]
  } else {
    const target = isHard ? lowerDifficulty(currentDifficulty) : lowerDifficulty(currentDifficulty)
    priorities = [target, currentDifficulty, 'basic']
  }

  for (const d of priorities) {
    const candidates = available.filter(p => p.difficulty === d)
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
  }
  return null
}
