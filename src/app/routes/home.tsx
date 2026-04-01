import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { LEVEL_TITLES } from '@/types/user'
import { loadProblems } from '@/shared/services/problemLoader'

export function HomeRoute() {
  const profile = useUserProfile()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function startProblem() {
    setLoading(true)
    try {
      const data = await loadProblems()
      const problem = data.problems.find(p => p.grade === (profile?.grade ?? 4))
      if (problem) navigate('/problem', { state: { problem } })
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

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-full rounded-2xl bg-indigo-50 p-6 text-center">
          <div className="text-lg font-bold text-gray-800">{profile.grade}학년 수학</div>
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
