import { db } from '@/shared/db/db'

function getTodayString(): string {
  // 로컬 타임존 기준 YYYY-MM-DD 반환
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const DAILY_PROBLEM_GOAL = 20

export async function recordMissionProblemSolved(userId: string): Promise<void> {
  const profile = await db.userProfile.get(userId)
  if (!profile) return
  
  const today = getTodayString()
  const currentMissionDate = profile.missionDate || ''
  const base = currentMissionDate === today ? (profile.missionProblemsSolved || 0) : 0
  
  await db.userProfile.update(userId, {
    missionDate: today,
    missionProblemsSolved: base + 1,
  })
}

export async function recordMissionWrongReviewed(userId: string): Promise<void> {
  const profile = await db.userProfile.get(userId)
  if (!profile) return
  
  const today = getTodayString()
  await db.userProfile.update(userId, {
    missionDate: today,
    missionWrongReviewed: true,
  })
}

export function getMissionProgress(profile: {
  missionDate?: string
  missionProblemsSolved?: number
  missionWrongReviewed?: boolean
}): { problemsSolved: number; wrongReviewed: boolean; isComplete: boolean } {
  const today = getTodayString()
  
  if (!profile.missionDate || profile.missionDate !== today) {
    return { problemsSolved: 0, wrongReviewed: false, isComplete: false }
  }
  
  const problemsSolved = profile.missionProblemsSolved || 0
  const wrongReviewed = !!profile.missionWrongReviewed
  const isComplete = problemsSolved >= DAILY_PROBLEM_GOAL && wrongReviewed
  
  return { problemsSolved, wrongReviewed, isComplete }
}
