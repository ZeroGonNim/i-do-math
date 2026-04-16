import { db } from '@/shared/db/db'

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTodayString(): string {
  return getLocalDateString()
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return getLocalDateString(d)
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
