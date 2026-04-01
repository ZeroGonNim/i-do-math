import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { PinInputModal } from '@/shared/components/PinInputModal'
import { CharacterSelectCard, CHARACTERS } from '@/shared/components/CharacterSelectCard'
import { verifyPin, hashPin, generateSalt } from '@/shared/utils/pinHasher'
import { db } from '@/shared/db/db'
import type { CharacterId } from '@/types/user'

export function SettingsRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinPhase, setPinPhase] = useState<'verify' | 'new' | 'confirm'>('verify')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [nameEdit, setNameEdit] = useState(false)
  const [nameValue, setNameValue] = useState('')

  if (!profile) return null

  async function handleCharacterChange(id: CharacterId) {
    await userProfileRepo.update({ characterId: id })
  }

  async function handleNameSave() {
    const trimmed = nameValue.trim()
    if (!trimmed) return
    await userProfileRepo.update({ displayName: trimmed })
    setNameEdit(false)
  }

  async function handleResetData() {
    if (!confirm('모든 학습 데이터를 삭제할까요? 이 작업은 되돌릴 수 없어요.')) return
    await db.learningLogs.clear()
    await db.wrongNotes.clear()
    await db.templateCounters.clear()
    await userProfileRepo.update({
      totalStars: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      missionProblemsSolved: 0,
      missionWrongReviewed: false,
    })
    navigate('/home')
  }

  const hasPinSet = Boolean(profile.parentalPinHash)

  function openPinSetup() {
    setPinError(null)
    setPinPhase(hasPinSet ? 'verify' : 'new')
    setShowPinModal(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="text-gray-500 font-medium">←</button>
        <h1 className="text-lg font-bold text-gray-800">설정</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-3">👤 프로필</p>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-sm text-gray-500 w-16">이름</p>
            {nameEdit ? (
              <div className="flex flex-1 gap-2">
                <input
                  className="flex-1 border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  maxLength={10}
                  autoFocus
                />
                <button onClick={handleNameSave} className="text-indigo-500 font-medium text-sm">저장</button>
                <button onClick={() => setNameEdit(false)} className="text-gray-400 text-sm">취소</button>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-between">
                <p className="font-medium text-gray-800">{profile.displayName}</p>
                <button
                  className="text-xs text-indigo-500"
                  onClick={() => { setNameValue(profile.displayName); setNameEdit(true) }}
                >
                  수정
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 w-16">학년</p>
            <p className="font-medium text-gray-800">{profile.grade}학년</p>
          </div>
        </div>

        {/* 캐릭터 선택 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-3">🎨 캐릭터 선택</p>
          <div className="grid grid-cols-4 gap-3">
            {CHARACTERS.map(c => (
              <CharacterSelectCard
                key={c.id}
                char={c}
                selected={profile.characterId === c.id}
                onSelect={handleCharacterChange}
              />
            ))}
          </div>
        </div>

        {/* 부모님 PIN */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-1">🔒 부모님 PIN</p>
          <p className="text-xs text-gray-400 mb-3">부모님 대시보드 잠금 설정</p>
          {pinError && (
            <p className="text-xs text-red-500 mb-2">{pinError}</p>
          )}
          <button
            onClick={openPinSetup}
            className="w-full min-h-[44px] rounded-xl bg-gray-100 text-gray-700 font-medium text-sm"
          >
            {hasPinSet ? 'PIN 변경하기' : 'PIN 설정하기'}
          </button>
        </div>

        {/* 데이터 초기화 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-700 mb-1">🗑️ 데이터 초기화</p>
          <p className="text-xs text-gray-400 mb-3">학습 기록을 모두 삭제해요</p>
          <button
            onClick={handleResetData}
            className="w-full min-h-[44px] rounded-xl bg-red-50 text-red-600 font-medium text-sm border border-red-200"
          >
            학습 데이터 초기화
          </button>
        </div>

        <div className="text-center text-xs text-gray-300 pb-4">
          I Do Math v1.0.0
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <PinInputModal
          title={
            pinPhase === 'verify' ? '현재 PIN을 입력해주세요'
            : pinPhase === 'new' ? '새 PIN 4자리를 입력해주세요'
            : '새 PIN을 한 번 더 입력해주세요'
          }
          onConfirm={async (pin) => {
            if (pinPhase === 'verify') {
              const ok = await verifyPin(pin, profile.parentalPinSalt!, profile.parentalPinHash!)
              if (!ok) {
                setPinError('PIN이 일치하지 않아요.')
                setShowPinModal(false)
                return
              }
              setNewPin('')
              setPinPhase('new')
            } else if (pinPhase === 'new') {
              setNewPin(pin)
              setPinPhase('confirm')
            } else {
              if (pin !== newPin) {
                setPinError('PIN이 일치하지 않아요. 다시 시도해주세요.')
                setShowPinModal(false)
                setNewPin('')
                return
              }
              const salt = generateSalt()
              const hash = await hashPin(pin, salt)
              await userProfileRepo.update({ parentalPinHash: hash, parentalPinSalt: salt })
              setPinError(null)
              setShowPinModal(false)
              setPinPhase('verify')
            }
          }}
          onCancel={() => { setShowPinModal(false); setPinPhase('verify') }}
        />
      )}
    </div>
  )
}
