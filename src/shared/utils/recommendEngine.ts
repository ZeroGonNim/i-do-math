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

function calculateSkillSimilarity(p1: Problem, p2: Problem): number {
  if (!p1.skills || !p2.skills) return 0
  const set1 = new Set(p1.skills)
  const set2 = new Set(p2.skills)
  let intersect = 0
  for (const s of set1) {
    if (set2.has(s)) intersect++
  }
  return intersect / Math.max(set1.size, set2.size)
}

export function selectRecommendedProblem(params: Params): Problem | null {
  const { unit, concept, currentDifficulty, difficultyMode = 'auto', currentId, isCorrect, recentIds, pool, avgTimeSpent, timeSpent } = params
  
  const excludeIds = new Set([...recentIds, currentId])
  const currentProblem = pool.find(p => p.id === currentId)

  // 1. 같은 개념(concept) 내에서 안 푼 문제 찾기
  let available = pool.filter(p => p.concept === concept && !excludeIds.has(p.id))

  // 2. [추가] 같은 단원(unit) 내에서 Skills 유사도가 높은 문제 찾기
  if (available.length === 0 && currentProblem && unit) {
    available = pool
      .filter(p => p.unit === unit && !excludeIds.has(p.id))
      .slice()
      .sort((a, b) => calculateSkillSimilarity(currentProblem, b) - calculateSkillSimilarity(currentProblem, a))
  }

  // 3. 만약 모든 문제를 다 풀었다면?
  if (available.length === 0) {
    const safeZoneCount = Math.min(recentIds.length, 20)
    const safeExcludeIds = new Set([...recentIds.slice(recentIds.length - safeZoneCount), currentId])
    available = pool.filter(p => !safeExcludeIds.has(p.id))
  }

  // 4. 마지막 보루
  if (available.length === 0) {
    available = pool.filter(p => p.id !== currentId)
  }

  if (difficultyMode === 'manual') {
    const candidates = available.filter(p => p.difficulty === currentDifficulty)
    return candidates.length > 0 ? shuffle(candidates)[0] : shuffle(available)[0]
  }

  // [Auto Mode] 난이도 결정 로직 강화
  const isHard = timeSpent != null && avgTimeSpent != null && timeSpent > avgTimeSpent * 2
  const isFast = timeSpent != null && avgTimeSpent != null && timeSpent <= avgTimeSpent * 1.5

  let priorities: Difficulty[]
  if (isCorrect) {
    const target = isFast ? higherDifficulty(currentDifficulty) : currentDifficulty
    priorities = [target, currentDifficulty]
  } else {
    // 오답 시: 심각한 지연 시 난이도 2단계 하향 고려
    const target = isHard ? lowerDifficulty(lowerDifficulty(currentDifficulty)) : lowerDifficulty(currentDifficulty)
    priorities = [target, 'basic', currentDifficulty]
  }

  for (const d of priorities) {
    const candidates = available.filter(p => p.difficulty === d)
    if (candidates.length > 0) {
      // 같은 난이도 내에서도 Skill 유사도가 높은 것을 최상단으로
      if (currentProblem) {
        return candidates.slice().sort((a, b) => 
          calculateSkillSimilarity(currentProblem, b) - calculateSkillSimilarity(currentProblem, a)
        )[0]
      }
      return shuffle(candidates)[0]
    }
  }

  return available.length > 0 ? shuffle(available)[0] : null
}
