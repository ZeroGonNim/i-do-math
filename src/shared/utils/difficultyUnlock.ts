export function canUnlockNextDifficulty(logs: { isCorrect: boolean }[]): boolean {
  if (logs.length < 15) return false
  const accuracy = logs.filter(l => l.isCorrect).length / logs.length
  if (accuracy < 0.7) return false
  const recent5 = logs.slice(0, 5) // 호출자가 newest-first 배열 전달
  const recentCorrect = recent5.filter(l => l.isCorrect).length
  return recentCorrect >= 4
}
