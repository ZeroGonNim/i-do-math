import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { PinInputModal } from '@/shared/components/PinInputModal'
import { verifyPin, hashPin, generateSalt } from '@/shared/utils/pinHasher'
import { db } from '@/shared/db/db'
import { AVATARS } from '@/types/avatar'
import type { AvatarId } from '@/types/avatar'

// Section header with colored left bar
function SectionHeader({ title, barColor }: { title: string; barColor: string }) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <div className="w-2 h-8 rounded-sm shrink-0" style={{ backgroundColor: barColor }} />
      <span
        className="text-2xl font-bold leading-8"
        style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.6px' }}
      >
        {title}
      </span>
    </div>
  )
}

export function SettingsRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinPhase, setPinPhase] = useState<'verify' | 'new' | 'confirm'>('verify')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [nameValue, setNameValue] = useState<string | null>(null)

  if (!profile) return null

  const displayName = nameValue ?? profile.displayName
  const unlockedAvatars: AvatarId[] = profile.unlockedAvatars ?? ['warrior']
  const equippedId: AvatarId = profile.avatarId ?? 'warrior'
  const totalStars = profile.totalStars ?? 0
  const hasPinSet = Boolean(profile.parentalPinHash)

  // Stars needed to next locked avatar unlock
  const nextLockedCost = AVATARS
    .filter(a => !unlockedAvatars.includes(a.id) && a.starCost > 0)
    .sort((a, b) => a.starCost - b.starCost)[0]?.starCost
  const starsToNext = nextLockedCost != null ? Math.max(0, nextLockedCost - totalStars) : null

  async function handleNameBlur() {
    const trimmed = (nameValue ?? '').trim()
    if (!trimmed || trimmed === profile!.displayName) {
      setNameValue(null)
      return
    }
    await userProfileRepo.update({ displayName: trimmed })
    setNameValue(null)
  }

  async function handleGradeChange(g: number) {
    await userProfileRepo.update({ grade: g })
  }

  async function handleAvatarEquip(id: AvatarId) {
    await userProfileRepo.update({ avatarId: id })
  }

  async function handleAvatarUnlock(id: AvatarId, cost: number) {
    if (totalStars < cost) return
    await userProfileRepo.update({
      totalStars: totalStars - cost,
      unlockedAvatars: [...unlockedAvatars, id],
      avatarId: id,
    })
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

  function openPinSetup() {
    setPinError(null)
    setPinPhase(hasPinSet ? 'verify' : 'new')
    setShowPinModal(true)
  }

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0c0c1f' }}>

      {/* Top App Bar */}
      <div
        className="shrink-0 flex items-center justify-between px-6 h-16"
        style={{
          backgroundColor: 'rgba(12,12,31,0.6)',
          borderBottom: '1px solid #1c1c3a',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base" style={{ color: '#81ecff' }}>🎮</span>
          <span
            className="text-xl font-medium"
            style={{ color: '#81ecff', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}
          >
            설정
          </span>
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0"
          style={{ backgroundColor: '#1d1d37', border: '1.5px solid #81ecff' }}
        >
          {(() => {
            const av = AVATARS.find(a => a.id === equippedId)
            return av?.imagePath
              ? <img src={av.imagePath} alt={av.name} className="w-full h-full object-cover" />
              : <span className="text-lg">⚔️</span>
          })()}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-28 space-y-8">

          {/* ── 플레이어 프로필 ── */}
          <div>
            <SectionHeader title="플레이어 프로필" barColor="#81ecff" />

            {/* Name input card */}
            <div
              className="px-6 py-5 mb-3"
              style={{ backgroundColor: '#17172f', border: '1px solid #23233f' }}
            >
              <p
                className="text-sm font-medium mb-4"
                style={{ color: '#c180ff', fontFamily: 'var(--font-sans)', letterSpacing: '1.4px' }}
              >
                영웅 이름
              </p>
              <div
                className="rounded px-4 flex items-center"
                style={{
                  height: '80px',
                  backgroundColor: '#000',
                  border: '1px solid #46465c',
                }}
              >
                <input
                  className="w-full bg-transparent text-xl font-bold focus:outline-none"
                  style={{
                    color: '#81ecff',
                    fontFamily: 'var(--font-game)',
                    letterSpacing: '0.05em',
                  }}
                  value={displayName}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={handleNameBlur}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Grade selection card */}
            <div
              className="px-6 py-5"
              style={{ backgroundColor: '#17172f', border: '1px solid #23233f' }}
            >
              <p
                className="text-sm font-medium mb-4"
                style={{ color: '#c180ff', fontFamily: 'var(--font-sans)', letterSpacing: '1.4px' }}
              >
                학년 선택
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(g => {
                  const isSelected = profile.grade === g
                  return (
                    <button
                      key={g}
                      onClick={() => handleGradeChange(g)}
                      className="h-13 text-base font-bold transition-all active:scale-[0.96]"
                      style={isSelected
                        ? {
                            backgroundColor: '#81ecff',
                            color: '#005762',
                            border: '2px solid #81ecff',
                            fontFamily: 'var(--font-game)',
                            height: '52px',
                          }
                        : {
                            backgroundColor: '#1d1d37',
                            color: '#81ecff',
                            border: '2px solid #81ecff',
                            fontFamily: 'var(--font-game)',
                            height: '52px',
                          }
                      }
                    >
                      {g}학년
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── 아바타 변경 ── */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 rounded-sm shrink-0" style={{ backgroundColor: '#c180ff' }} />
                <span
                  className="text-2xl font-bold leading-8"
                  style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.6px' }}
                >
                  아바타 변경
                </span>
              </div>
              {starsToNext != null && (
                <p
                  className="text-base font-bold leading-6 text-right max-w-[160px]"
                  style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}
                >
                  다음 해금까지 별 {starsToNext.toLocaleString()}개
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {AVATARS.map(a => {
                const isUnlocked = unlockedAvatars.includes(a.id)
                const isEquipped = equippedId === a.id
                const canAfford = totalStars >= a.starCost
                return (
                  <div
                    key={a.id}
                    className="overflow-hidden flex flex-col"
                    style={{
                      backgroundColor: isEquipped ? '#1d1d37' : '#17172f',
                      border: `2px solid ${isEquipped ? '#81ecff' : '#23233f'}`,
                      filter: isUnlocked ? 'none' : 'saturate(0) brightness(0.5)',
                    }}
                  >
                    {/* Avatar image */}
                    <div className="relative w-full aspect-square">
                      <img
                        src={a.imagePath}
                        alt={a.name}
                        className="w-full h-full object-cover"
                      />
                      {isEquipped && (
                        <div
                          className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-1.5"
                          style={{ backgroundColor: '#81ecff' }}
                        >
                          <span
                            className="text-xs font-medium"
                            style={{ color: '#005762', fontFamily: 'var(--font-sans)' }}
                          >
                            장착 중
                          </span>
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <span className="text-2xl">🔒</span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}
                          >
                            ⭐ {a.starCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom label / button */}
                    <div
                      className="px-3 py-2 flex items-center justify-center"
                      style={{ backgroundColor: '#000' }}
                    >
                      {isUnlocked && !isEquipped ? (
                        <button
                          onClick={() => handleAvatarEquip(a.id)}
                          className="text-xs font-medium transition-all active:scale-95"
                          style={{ color: '#81ecff', fontFamily: 'var(--font-sans)' }}
                        >
                          장착하기
                        </button>
                      ) : !isUnlocked ? (
                        <button
                          disabled={!canAfford}
                          onClick={() => handleAvatarUnlock(a.id, a.starCost)}
                          className="text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
                          style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
                        >
                          잠금
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: '#aaa8c3' }}>⚔️</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── 부모님 잠금 ── */}
          <div>
            <SectionHeader title="부모님 잠금" barColor="#ffe792" />
            <div
              className="px-6 py-5"
              style={{ backgroundColor: '#17172f', border: '1px solid #23233f' }}
            >
              <p
                className="text-sm font-medium mb-5"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)', lineHeight: '20px' }}
              >
                4자리 PIN을 설정하여 결제 및 고급 설정 접근을 제한합니다.
              </p>

              {/* PIN dots preview */}
              <div className="flex justify-center gap-3 mb-5">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="flex items-center justify-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#000',
                      border: '1px solid #46465c',
                    }}
                  >
                    {hasPinSet && (
                      <div
                        className="w-3 h-3"
                        style={{ backgroundColor: '#ffe792' }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {pinError && (
                <p className="text-xs mb-3 text-center font-medium" style={{ color: '#ff716c' }}>
                  {pinError}
                </p>
              )}

              <button
                onClick={openPinSetup}
                className="w-full h-13 font-medium text-base transition-all active:scale-[0.98]"
                style={{
                  height: '52px',
                  backgroundColor: '#292948',
                  color: '#ffe792',
                  border: '1px solid #ffe792',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {hasPinSet ? 'PIN 재설정' : 'PIN 설정하기'}
              </button>
            </div>
          </div>

          {/* ── 시스템 ── */}
          <div>
            <SectionHeader title="시스템" barColor="#ff716c" />
            <div
              className="px-7 py-6"
              style={{
                backgroundColor: 'rgba(159,5,25,0.2)',
                border: '1px solid rgba(255,113,108,0.3)',
              }}
            >
              <p
                className="text-base font-bold mb-3"
                style={{ color: '#ff716c', fontFamily: 'var(--font-sans)' }}
              >
                주의 필요
              </p>
              <p
                className="text-sm font-medium mb-5"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)', lineHeight: '20px' }}
              >
                데이터를 초기화하면 모든 레벨 진행, 아바타, 최고 점수가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <button
                onClick={handleResetData}
                className="w-full h-14 font-medium text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: '#ff716c',
                  color: '#490006',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                🗑️ 데이터 초기화
              </button>
            </div>
          </div>

        </div>
      </div>

      <BottomNavBar />

      {showPinModal && (
        <PinInputModal
          key={pinPhase}
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
