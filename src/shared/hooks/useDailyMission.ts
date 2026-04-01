import { db } from '@/shared/db/db'

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export const DAILY_PROBLEM_GOAL = 5

export async function recordMissionProblemSolved(userId: string): Promise<void> {
  const profile = await db.userProfile.get(userId)
  if (!profile) return
  const today = getTodayString()
  const base = profile.missionDate === today ? profile.missionProblemsSolved : 0
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
  missionDate: string
  missionProblemsSolved: number
  missionWrongReviewed: boolean
}): { problemsSolved: number; wrongReviewed: boolean; isComplete: boolean } {
  const today = getTodayString()
  if (profile.missionDate !== today) {
    return { problemsSolved: 0, wrongReviewed: false, isComplete: false }
  }
  const problemsSolved = profile.missionProblemsSolved
  const wrongReviewed = profile.missionWrongReviewed
  const isComplete = problemsSolved >= DAILY_PROBLEM_GOAL && wrongReviewed
  return { problemsSolved, wrongReviewed, isComplete }
}
