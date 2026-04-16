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
  unit?: string
  concept: string
  currentDifficulty: Difficulty
  difficultyMode?: 'auto' | 'manual'
  currentId: string
  isCorrect: boolean
  recentIds: string[]
  pool: Problem[]
  avgTimeSpent?: number
  timeSpent?: number
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function selectRecommendedProblem(params: Params): Problem | null {
  const { unit, concept, currentDifficulty, difficultyMode = 'auto', currentId, isCorrect, recentIds, pool, avgTimeSpent, timeSpent } = params
  
  // 강력한 제외 목록: 현재 문제 + 최근 학습 이력 전체 (최대 100개)
  const excludeIds = new Set([...recentIds, currentId])

  // 1. 같은 개념(concept) 내에서 안 푼 문제 찾기
  let available = pool.filter(p => p.concept === concept && !excludeIds.has(p.id))

  // 2. 같은 단원(unit) 내에서 안 푼 문제 찾기
  if (available.length === 0 && unit) {
    available = pool.filter(p => p.unit === unit && !excludeIds.has(p.id))
  }

  // 3. 만약 모든 문제를 다 풀었다면? 
  // 그나마 가장 오래전에 풀었던 문제(recentIds의 앞부분)부터 다시 허용하되, 최소 최근 20개는 절대 보호
  if (available.length === 0) {
    const safeZoneCount = Math.min(recentIds.length, 20)
    const safeExcludeIds = new Set([...recentIds.slice(recentIds.length - safeZoneCount), currentId])
    available = pool.filter(p => !safeExcludeIds.has(p.id))
  }

  // 4. 마지막 보루: 현재 문제만 제외
  if (available.length === 0) {
    available = pool.filter(p => p.id !== currentId)
  }

  // [Manual Mode] 수동 모드인 경우 현재 난이도만 고집
  if (difficultyMode === 'manual') {
    const candidates = available.filter(p => p.difficulty === currentDifficulty)
    if (candidates.length > 0) {
      const shuffled = shuffle(candidates)
      return shuffled[0]
    }
    // 해당 난이도 문제가 바닥났을 때만 전체에서 섞어 반환
    const shuffled = shuffle(available)
    return shuffled[0]
  }

  // [Auto Mode] 기존 추천 로직 수행
  const isHard = timeSpent != null && avgTimeSpent != null && timeSpent > avgTimeSpent * 2
  const isFast = timeSpent != null && avgTimeSpent != null && timeSpent <= avgTimeSpent * 1.5

  let priorities: Difficulty[]
  if (isCorrect) {
    const target = isFast ? higherDifficulty(currentDifficulty) : currentDifficulty
    priorities = [target, currentDifficulty]
  } else {
    const target = isHard ? lowerDifficulty(currentDifficulty) : currentDifficulty
    priorities = [target, currentDifficulty, 'basic']
  }

  // 우선순위 난이도 적용
  for (const d of priorities) {
    const candidates = available.filter(p => p.difficulty === d)
    if (candidates.length > 0) {
      const shuffled = shuffle(candidates)
      return shuffled[0]
    }
  }

  // 난이도 상관없이 무작위 섞어서 선택
  if (available.length > 0) {
    const shuffled = shuffle(available)
    return shuffled[0]
  }

  return null
}
