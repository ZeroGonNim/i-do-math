import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { LEVEL_TITLES } from '@/types/user'
import { loadProblems } from '@/shared/services/problemLoader'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'

export function HomeRoute() {
  const profile = useUserProfile()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function startProblem() {
    if (!profile) return
    setLoading(true)
    try {
      const data = await loadProblems()
      const recentIds = await learningLogRepo.getRecentProblemIds(profile.userId, 10)
      const gradeProblems = data.problems.filter(p => p.grade === profile.grade)

      // 최근 안 푼 문제 중 난이도 우선 선택 (concept 무관)
      const notRecent = gradeProblems.filter(p => !recentIds.includes(p.id))
      const pool = notRecent.length > 0 ? notRecent : gradeProblems

      const byDifficulty = pool.filter(p => p.difficulty === profile.unlockedDifficulty)
      const candidates = byDifficulty.length > 0 ? byDifficulty : pool

      const rec = candidates[Math.floor(Math.random() * candidates.length)]
      if (rec) navigate('/problem', { state: { problem: rec } })
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        로딩 중...
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* GNB */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <span className="font-bold text-gray-800">{profile.displayName}</span>
          <span className="ml-2 text-sm text-gray-500">
            {LEVEL_TITLES[profile.level] ?? `Lv.${profile.level}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">⭐ {profile.totalStars}</span>
          <button onClick={() => navigate('/settings')} className="text-gray-400 text-xl">
            ⚙️
          </button>
        </div>
      </div>

      {/* 스트릭 배너 */}
      {profile.currentStreak > 0 && (
        <div className="mx-4 mt-3 rounded-2xl bg-orange-50 border border-orange-200 p-3 text-center text-sm font-medium">
          🔥 {profile.currentStreak}일 연속 학습 중!
        </div>
      )}

      {/* 오늘의 미션 배너 */}
      {(() => {
        const mission = getMissionProgress(profile)
        return (
          <div className="mx-4 mt-2 rounded-2xl bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs font-bold text-blue-600 mb-2">🎯 오늘의 미션</p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span>{mission.problemsSolved >= DAILY_PROBLEM_GOAL ? '✅' : '⬜'}</span>
                <span className="text-gray-600">문제 {DAILY_PROBLEM_GOAL}개 풀기</span>
                <span className="text-blue-600 font-bold">({mission.problemsSolved}/{DAILY_PROBLEM_GOAL})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{mission.wrongReviewed ? '✅' : '⬜'}</span>
                <span className="text-gray-600">오답 복습</span>
              </div>
            </div>
            {mission.isComplete && (
              <p className="text-xs text-green-600 font-bold mt-1">🎉 오늘 미션 완료!</p>
            )}
          </div>
        )
      })()}

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-full rounded-2xl bg-indigo-50 p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="text-lg font-bold text-gray-800">{profile.grade}학년 수학</div>
            {profile.unlockedDifficulty === 'applied' && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-600">
                🔓 응용
              </span>
            )}
          </div>
          <div className="text-gray-500 mt-1 text-sm">오늘도 함께 풀어보자! 💪</div>
        </div>

        <button
          onClick={startProblem}
          disabled={loading}
          className="w-full min-h-[48px] rounded-2xl bg-green-500 text-white text-xl font-bold disabled:opacity-60 transition-opacity"
        >
          {loading ? '문제 불러오는 중...' : '🟢 학습 시작하기'}
        </button>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate('/diary')}
            className="flex-1 min-h-[48px] rounded-2xl bg-gray-100 font-bold text-gray-700"
          >
            📖 수학 일기
          </button>
          <button
            onClick={() => navigate('/remind')}
            className="flex-1 min-h-[48px] rounded-2xl bg-yellow-100 font-bold text-yellow-700"
          >
            🔁 오답 복습
          </button>
          <button
            onClick={() => navigate('/parent')}
            className="flex-1 min-h-[48px] rounded-2xl bg-purple-100 font-bold text-purple-700"
          >
            👨‍👩‍👧 보호자
          </button>
        </div>
      </div>
    </div>
  )
}
