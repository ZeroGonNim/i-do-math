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
  currentId: string
  isCorrect: boolean
  recentIds: string[]
  pool: Problem[]
  avgTimeSpent?: number
  timeSpent?: number
}

export function selectRecommendedProblem(params: Params): Problem | null {
  const { unit, concept, currentDifficulty, currentId, isCorrect, recentIds, pool, avgTimeSpent, timeSpent } = params
  
  // 강력한 제외 목록: 현재 문제 + 최근 학습 이력 전체
  // 이 이력에 포함된 문제는 절대 뽑지 않는 것을 원칙으로 함
  const excludeIds = new Set([...recentIds, currentId])

  // 1. 같은 개념(concept) 내에서 안 푼 문제 찾기
  let available = pool.filter(p => p.concept === concept && !excludeIds.has(p.id))

  // 2. 같은 단원(unit) 내에서 안 푼 문제 찾기
  if (available.length === 0 && unit) {
    available = pool.filter(p => p.unit === unit && !excludeIds.has(p.id))
  }

  // 3. 만약 모든 문제를 다 풀었다면? 
  // 그나마 가장 오래전에 풀었던 문제(recentIds의 앞부분)부터 다시 허용하되, 최소 최근 10개는 절대 보호
  if (available.length === 0) {
    const safeZoneCount = Math.min(recentIds.length, 10)
    const safeExcludeIds = new Set([...recentIds.slice(0, safeZoneCount), currentId])
    available = pool.filter(p => !safeExcludeIds.has(p.id))
  }

  // 4. 마지막 보루: 현재 문제만 제외 (정말 풀이 없을 때)
  if (available.length === 0) {
    available = pool.filter(p => p.id !== currentId)
  }

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
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
  }

  // 난이도 상관없이 선택
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)]
  }

  return null
}
