import { db } from '@/shared/db/db'

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

interface UpdateStreakResult {
  newStreak: number
  streakIncremented: boolean
}

export async function updateStreak(userId: string): Promise<UpdateStreakResult> {
  const profile = await db.userProfile.get(userId)
  if (!profile) return { newStreak: 0, streakIncremented: false }
  const today = getTodayString()
  // 오늘 이미 학습한 경우: 스트릭 변경 없음
  if (profile.lastStudyDate === today) {
    return { newStreak: profile.currentStreak, streakIncremented: false }
  }

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

  return { newStreak, streakIncremented: true }
}
