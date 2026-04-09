import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { userItemRepo } from '@/shared/db/userItemRepo'
import { equippedItemsRepo } from '@/shared/db/equippedItemsRepo'
import { loadItems, pickRandomItem } from '@/shared/services/itemLoader'
import { rollItemRarity } from '@/shared/utils/itemDropSystem'
import { AppHeader } from '@/shared/components/AppHeader'
import { RARITY_COLOR, RARITY_LABEL, SLOT_LABEL } from '@/shared/constants/itemConstants'
import { formatNumber } from '@/shared/utils/format'
import type { Item } from '@/types/item'

type Phase = 'idle' | 'opening' | 'result'

export function BoxOpenRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const [phase, setPhase] = useState<Phase>('idle')
  const [obtained, setObtained] = useState<Item | null>(null)
  const [userItemId, setUserItemId] = useState<string | null>(null)

  const boxCount = profile?.boxCount ?? 0

  useEffect(() => {
    if (profile && boxCount <= 0 && phase === 'idle') {
      navigate('/home', { replace: true })
    }
  }, [profile, boxCount, phase, navigate])

  if (!profile) return null

  async function handleOpen() {
    if (boxCount <= 0 || phase !== 'idle') return

    try {
      setPhase('opening')

      const [items] = await Promise.all([
        loadItems(),
        new Promise(r => setTimeout(r, 1400)),
      ])
      const rarity = rollItemRarity()
      const item = pickRandomItem(items, rarity)

      const userItem = await userItemRepo.add(profile!.userId, item.id)
      await userProfileRepo.update({ boxCount: boxCount - 1 })

      setObtained(item)
      setUserItemId(userItem.id)
      setPhase('result')
    } catch (error) {
      console.error('박스 열기 실패:', error)
      setPhase('idle')
      alert('박스를 열 수 없었어요. 다시 시도해 주세요!')
    }
  }

  async function handleEquip() {
    if (!obtained || !userItemId) return
    await equippedItemsRepo.equip(profile!.userId, obtained.slot, userItemId)
    navigate('/inventory', { replace: true })
  }

  function handleNext() {
    navigate('/home', { replace: true })
  }

  const rarityColor = obtained ? RARITY_COLOR[obtained.rarity] : '#81ecff'

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0c0c1f' }}>
      <AppHeader
        title={phase === 'result' ? '아이템 획득!' : '박스 오픈'}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">

        {phase !== 'result' ? (
          <>
            {/* 박스 카드 */}
            <div
              className="w-full flex flex-col items-center gap-6 px-8 py-10"
              style={{ backgroundColor: '#1d1d37', border: '2px solid #81ecff', boxShadow: '0 0 32px rgba(129,236,255,0.2)' }}
            >
              {/* Pixel corner accents */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5" style={{ backgroundColor: 'rgba(129,236,255,0.5)' }} />
              <div className="absolute top-2 right-2 w-1.5 h-1.5" style={{ backgroundColor: 'rgba(129,236,255,0.5)' }} />

              <div
                className="px-5 py-1"
                style={{ backgroundColor: '#81ecff' }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: '#005762', fontFamily: 'var(--font-game)', letterSpacing: '1px' }}
                >
                  일반 박스
                </span>
              </div>

              {/* Box icon */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: '144px',
                  height: '144px',
                  backgroundColor: '#000',
                  border: '2px solid #81ecff',
                  boxShadow: phase === 'opening' ? '0 0 48px rgba(129,236,255,0.5)' : '0 0 16px rgba(129,236,255,0.2)',
                }}
              >
                {phase === 'opening' && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(129,236,255,0.12)', animation: 'glowPulse 0.5s ease-in-out infinite alternate' }}
                  />
                )}
                <span
                  className="text-7xl select-none"
                  style={{ animation: phase === 'opening' ? 'boxShake 0.35s ease-in-out infinite' : 'none' }}
                >
                  📦
                </span>
              </div>

              <p
                className="text-xl font-bold text-center"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)', letterSpacing: '-0.5px' }}
              >
                {phase === 'opening' ? '✨ 오픈 중...' : '탭하여 열기'}
              </p>
              {phase !== 'opening' && (
                <p className="text-sm text-center" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
                  박스 안에 아이템이 들어있어요!
                </p>
              )}
            </div>

            {/* 열기 버튼 */}
            <div className="w-full">
              <div style={{ backgroundColor: '#005762', marginTop: 4 }}>
                <button
                  disabled={boxCount <= 0 || phase === 'opening'}
                  onClick={handleOpen}
                  className="w-full flex items-center justify-center text-xl font-bold transition-opacity disabled:opacity-40 active:opacity-80 -translate-y-1"
                  style={{
                    height: '68px',
                    backgroundColor: '#81ecff',
                    color: '#003840',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '-0.5px',
                    border: '2px solid #005762',
                    display: 'flex',
                  }}
                >
                  {boxCount <= 0 ? '박스 없음' : '열기 ▶'}
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/home')}
              className="text-sm font-medium"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
            >
              나중에 하기
            </button>

            {/* 보유 박스 정보 + 드롭 확률 */}
            <div
              className="w-full px-5 py-4"
              style={{ backgroundColor: '#17172f', border: '1px solid #23233f' }}
            >
              <p
                className="text-sm font-bold mb-1"
                style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}
              >
                보유 박스: {formatNumber(boxCount)}개
              </p>
              <p className="text-xs" style={{ color: '#46465c', fontFamily: 'var(--font-game)' }}>
                정답 20% 확률 드롭 · 10문제 연속 미드롭 시 강제 지급
              </p>
            </div>
          </>
        ) : obtained && (
          <>
            {/* 아이템 카드 */}
            <div
              className="relative flex flex-col items-center gap-6 px-8 py-10 w-full"
              style={{
                backgroundColor: '#1d1d37',
                border: `2px solid ${rarityColor}`,
                boxShadow: `0 0 48px ${rarityColor}40`,
                animation: 'itemPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              {/* Rarity glow strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: rarityColor, opacity: 0.8 }}
              />

              {/* Item image */}
              <div
                className="flex items-center justify-center overflow-hidden"
                style={{
                  width: '176px',
                  height: '176px',
                  backgroundColor: '#000',
                  border: `2px solid ${rarityColor}`,
                  boxShadow: `0 0 32px ${rarityColor}40`,
                }}
              >
                <div
                  className="w-28 h-28 overflow-hidden"
                  style={{ animation: 'itemWiggle 0.6s ease 0.4s' }}
                >
                  <img src={obtained.imagePath} alt={obtained.name} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* 희귀도 뱃지 */}
              <div
                className="px-5 py-1.5"
                style={{ backgroundColor: rarityColor, animation: 'fadeSlideUp 0.4s ease 0.3s both' }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: '#000', fontFamily: 'var(--font-game)', letterSpacing: '1.2px' }}
                >
                  ✦ {RARITY_LABEL[obtained.rarity]}
                </span>
              </div>

              {/* 아이템 정보 */}
              <div className="text-center" style={{ animation: 'fadeSlideUp 0.4s ease 0.45s both' }}>
                <p
                  className="text-2xl font-bold mb-2"
                  style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.6px' }}
                >
                  {obtained.name}
                </p>
                <p
                  className="text-sm"
                  style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
                >
                  {SLOT_LABEL[obtained.slot]} 슬롯 · {obtained.description}
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="w-full flex flex-col gap-3">
              <div style={{ backgroundColor: `${rarityColor}60`, marginTop: 4 }}>
                <button
                  onClick={handleEquip}
                  className="w-full flex items-center justify-center text-xl font-bold transition-opacity active:opacity-80 -translate-y-1"
                  style={{
                    height: '68px',
                    backgroundColor: rarityColor,
                    color: '#000',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '-0.5px',
                    border: `2px solid ${rarityColor}80`,
                    display: 'flex',
                  }}
                >
                  장착하기
                </button>
              </div>
              <button
                onClick={handleNext}
                className="w-full text-sm font-medium text-center"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)', letterSpacing: '0.5px' }}
              >
                다음 문제 →
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes boxShake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20%       { transform: rotate(-8deg) scale(1.05); }
          40%       { transform: rotate(8deg) scale(1.08); }
          60%       { transform: rotate(-6deg) scale(1.05); }
          80%       { transform: rotate(6deg) scale(1.03); }
        }
        @keyframes glowPulse {
          from { opacity: 0.3; }
          to   { opacity: 1; }
        }
        @keyframes itemPopIn {
          0%   { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes itemWiggle {
          0%, 100% { transform: rotate(0deg); }
          25%      { transform: rotate(-15deg) scale(1.2); }
          50%      { transform: rotate(15deg) scale(1.15); }
          75%      { transform: rotate(-8deg) scale(1.1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
