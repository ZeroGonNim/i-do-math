import { db } from '@/shared/db/db'

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export async function updateStreak(userId: string): Promise<void> {
  const profile = await db.userProfile.get(userId)
  if (!profile) return
  const today = getTodayString()
  if (profile.lastStudyDate === today) return

  const yesterday = getYesterdayString()
  const newStreak = profile.lastStudyDate === yesterday
    ? profile.currentStreak + 1
    : 1
  const longestStreak = Math.max(profile.longestStreak, newStreak)

  await db.userProfile.update(userId, {
    lastStudyDate: today,
    currentStreak: newStreak,
    longestStreak,
  })
}
