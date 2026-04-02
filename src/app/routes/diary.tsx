import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useDiary } from '@/features/diary/hooks/useDiary'
import { AppHeader } from '@/shared/components/AppHeader'

export function DiaryRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const days = useDiary(profile?.userId)

  const conceptLabels: Record<string, string> = {
    fraction_add_same_denominator: '분모 같은 덧셈',
    fraction_sub_same_denominator: '분모 같은 뺄셈',
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <AppHeader title="수학 일기" onBack={() => navigate('/home')} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {days.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-4">
            <div className="text-5xl">📖</div>
            <p className="text-gray-500 text-center">아직 기록이 없어요.<br />문제를 풀면 일기가 생겨요!</p>
            <button
              className="min-h-[48px] px-8 rounded-2xl bg-indigo-500 text-white font-bold"
              onClick={() => navigate('/home')}
            >
              문제 풀러 가기
            </button>
          </div>
        ) : (
          days.map(day => (
            <div key={day.date} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-gray-800">{day.date}</p>
                <p className="text-sm text-yellow-500 font-bold">⭐ {day.stars}</p>
              </div>
              <div className="flex gap-4 text-sm mb-3">
                <span className="text-gray-500">
                  총 <span className="font-bold text-gray-800">{day.totalProblems}</span>문제
                </span>
                <span className="text-gray-500">
                  정답 <span className="font-bold text-green-600">{day.correctCount}</span>개
                </span>
                <span className="text-gray-500">
                  오답 <span className="font-bold text-red-500">{day.totalProblems - day.correctCount}</span>개
                </span>
              </div>
              <div className="space-y-1">
                {day.logs.slice(0, 5).map(log => (
                  <div key={log.logId} className="flex items-center gap-2 text-sm">
                    <span>{log.isCorrect ? '✅' : '❌'}</span>
                    <span className="text-gray-600">
                      {conceptLabels[log.concept] ?? log.concept}
                    </span>
                    {!log.isCorrect && log.mistakeType && (
                      <span className="text-xs text-red-400 ml-auto">{log.mistakeType}</span>
                    )}
                  </div>
                ))}
                {day.logs.length > 5 && (
                  <p className="text-xs text-gray-400 text-right">+{day.logs.length - 5}개 더</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
