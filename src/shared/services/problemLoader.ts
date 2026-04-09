import type { Problem, ProblemTemplate } from '@/types/problem'

interface ProblemsData {
  version: number
  problems: Problem[]
  templates: ProblemTemplate[]
}

let cache: ProblemsData | null = null

export async function loadProblems(): Promise<ProblemsData> {
  if (cache) return cache
  const url = `${import.meta.env.BASE_URL}data/problems-v1.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load problems data')
  const raw = await res.json()
  if (!raw?.problems || !Array.isArray(raw.problems)) {
    throw new Error('Invalid problems data format')
  }
  cache = raw as ProblemsData
  return cache
}

export async function getProblemsByFilter(params: {
  grade: number
  concept?: string
  difficulty?: string
}): Promise<Problem[]> {
  const data = await loadProblems()
  return data.problems.filter(
    p =>
      p.grade === params.grade &&
      (!params.concept || p.concept === params.concept) &&
      (!params.difficulty || p.difficulty === params.difficulty),
  )
}
