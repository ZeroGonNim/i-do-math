import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useDiary } from '@/features/diary/hooks/useDiary'
import { wrongNoteRepo } from '@/shared/db/wrongNoteRepo'
import { useLiveQuery } from 'dexie-react-hooks'
import { PinInputModal } from '@/shared/components/PinInputModal'
import { verifyPin, hashPin, generateSalt } from '@/shared/utils/pinHasher'
import { userProfileRepo } from '@/shared/db/userProfileRepo'

type View = 'lock' | 'setup' | 'dashboard'

export function ParentRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const days = useDiary(profile?.userId)
  const weakNotes = useLiveQuery(async () => {
    if (!profile) return []
    return wrongNoteRepo.getWeakConcepts(profile.userId)
  }, [profile?.userId], [])

  const [view, setView] = useState<View>(
    profile?.parentalPinHash ? 'lock' : 'setup'
  )
  const [pinError, setPinError] = useState(false)
  const [setupStep, setSetupStep] = useState<'input' | 'confirm'>('input')
  const [firstPin, setFirstPin] = useState('')

  if (!profile) return null

  const hasPinSet = Boolean(profile.parentalPinHash)

  if (view === 'lock' && hasPinSet) {
    return (
      <PinInputModal
        title="부모님 PIN 입력"
        onConfirm={async (pin) => {
          const ok = await verifyPin(pin, profile.parentalPinSalt!, profile.parentalPinHash!)
          if (ok) {
            setPinError(false)
            setView('dashboard')
          } else {
            setPinError(true)
          }
        }}
        onCancel={() => navigate('/home')}
      />
    )
  }

  if (view === 'setup') {
    if (setupStep === 'input') {
      return (
        <>
          {pinError && (
            <div className="fixed top-4 left-0 right-0 mx-4 bg-red-100 border border-red-300 rounded-xl p-3 text-sm text-red-700 text-center z-50">
              PIN이 일치하지 않아요. 다시 시도해주세요.
            </div>
          )}
          <PinInputModal
            title="사용할 PIN 4자리를 설정해주세요"
            onConfirm={(pin) => {
              setFirstPin(pin)
              setSetupStep('confirm')
              setPinError(false)
            }}
            onCancel={() => navigate('/home')}
          />
        </>
      )
    }
    return (
      <>
        {pinError && (
          <div className="fixed top-4 left-0 right-0 mx-4 bg-red-100 border border-red-300 rounded-xl p-3 text-sm text-red-700 text-center z-50">
            PIN이 일치하지 않아요. 다시 입력해주세요.
          </div>
        )}
        <PinInputModal
          title="PIN을 한 번 더 입력해주세요"
          onConfirm={async (pin) => {
            if (pin !== firstPin) {
              setPinError(true)
              setSetupStep('input')
              setFirstPin('')
              return
            }
            const salt = generateSalt()
            const hash = await hashPin(pin, salt)
            await userProfileRepo.update({ parentalPinHash: hash, parentalPinSalt: salt })
            setView('dashboard')
          }}
          onCancel={() => { setSetupStep('input'); setFirstPin('') }}
        />
      </>
    )
  }

  // Dashboard
  const totalProblems = days.reduce((s, d) => s + d.totalProblems, 0)
  const totalCorrect = days.reduce((s, d) => s + d.correctCount, 0)
  const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="text-gray-500 font-medium">←</button>
        <h1 className="text-lg font-bold text-gray-800">부모님 대시보드</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 아이 정보 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">아이 이름</p>
          <p className="text-xl font-bold text-gray-800">{profile.displayName}</p>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-xs text-gray-400">레벨</p>
              <p className="font-bold text-indigo-600">Lv.{profile.level}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">총 별</p>
              <p className="font-bold text-yellow-500">⭐ {profile.totalStars}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">연속 학습</p>
              <p className="font-bold text-orange-500">🔥 {profile.currentStreak}일</p>
            </div>
          </div>
        </div>

        {/* 학습 통계 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 mb-3">📊 전체 통계</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">{totalProblems}</p>
              <p className="text-xs text-gray-500 mt-1">총 문제</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">정답률</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-600">{days.length}</p>
              <p className="text-xs text-gray-500 mt-1">학습 일수</p>
            </div>
          </div>
        </div>

        {/* 약점 개념 */}
        {weakNotes && weakNotes.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-gray-800 mb-3">⚠️ 자주 틀리는 개념</p>
            <div className="space-y-2">
              {weakNotes.map(note => (
                <div key={note.id} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                  <p className="text-sm text-gray-700">{note.concept}</p>
                  <p className="text-sm font-bold text-red-500">틀린 횟수 {note.wrongCount}회</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 최근 7일 활동 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 mb-3">📅 최근 학습 기록</p>
          {days.slice(0, 7).map(day => (
            <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-0">
              <p className="text-sm text-gray-600">{day.date}</p>
              <div className="flex gap-3 text-sm">
                <span className="text-gray-500">{day.totalProblems}문제</span>
                <span className="text-green-600 font-medium">{day.correctCount}정답</span>
                <span className="text-yellow-500">⭐{day.stars}</span>
              </div>
            </div>
          ))}
          {days.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">아직 학습 기록이 없어요</p>
          )}
        </div>
      </div>
    </div>
  )
}
