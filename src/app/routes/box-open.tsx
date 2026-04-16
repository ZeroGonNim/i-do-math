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
import { BoxIcon, SparkleIcon } from '@/shared/components/PixelIcons'
import { ConfirmModal } from '@/shared/components/ConfirmModal'

type Phase = 'idle' | 'opening' | 'result' | 'all-opening' | 'all-result'

export function BoxOpenRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const [phase, setPhase] = useState<Phase>('idle')
  const [obtained, setObtained] = useState<Item | null>(null)
  const [userItemId, setUserItemId] = useState<string | null>(null)
  const [allObtained, setAllObtained] = useState<Item[]>([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
      setErrorMessage('박스를 열 수 없었어요. 다시 시도해 주세요!')
      setShowErrorModal(true)
    }
  }

  async function handleOpenAll() {
    if (boxCount <= 0 || phase !== 'idle') return

    try {
      setPhase('all-opening')

      const [items] = await Promise.all([
        loadItems(),
        new Promise(r => setTimeout(r, 1200)),
      ])

      const results: Item[] = []
      for (let i = 0; i < boxCount; i++) {
        const rarity = rollItemRarity()
        const item = pickRandomItem(items, rarity)
        await userItemRepo.add(profile!.userId, item.id)
        results.push(item)
      }
      await userProfileRepo.update({ boxCount: 0 })

      setAllObtained(results)
      setPhase('all-result')
    } catch (error) {
      console.error('전체 열기 실패:', error)
      setPhase('idle')
      setErrorMessage('박스를 열 수 없었어요. 다시 시도해 주세요!')
      setShowErrorModal(true)
    }
  }

  function handleOpenNext() {
    setObtained(null)
    setUserItemId(null)
    setPhase('idle')
  }

  async function handleEquip() {
    if (!obtained || !userItemId) return
    await equippedItemsRepo.equip(profile!.userId, obtained.slot, userItemId)
    navigate('/settings', { replace: true })
  }

  function handleNext() {
    navigate('/home', { replace: true })
  }

  const rarityColor = obtained ? RARITY_COLOR[obtained.rarity] : '#38bdf8'

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>
      <AppHeader
        title={
          phase === 'result' ? '아이템 획득!' :
          phase === 'all-result' ? `${allObtained.length}개 획득!` :
          '박스 오픈'
        }
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 gap-6 py-8">

        {/* ── 일반 열기 / 열기 중 ── */}
        {(phase === 'idle' || phase === 'opening') && (
          <>
            {/* 박스 카드 */}
            <div
              className="w-full flex flex-col items-center gap-6 px-8 py-10 border-4 border-[#38bdf8]"
              style={{ backgroundColor: '#1d1d37', boxShadow: '0 6px 0 #000000, 0 0 32px rgba(56,189,248,0.2)' }}
            >
              <div className="px-5 py-1" style={{ backgroundColor: '#38bdf8' }}>
                <span className="text-sm font-bold" style={{ color: '#005762', fontFamily: 'var(--font-game)', letterSpacing: '1px' }}>
                  일반 박스
                </span>
              </div>

              <div
                className="relative flex items-center justify-center border-4 border-[#38bdf8]"
                style={{
                  width: '144px', height: '144px', backgroundColor: '#000',
                  boxShadow: phase === 'opening' ? '0 4px 0 #000000, 0 0 48px rgba(56,189,248,0.5)' : '0 4px 0 #000000, 0 0 16px rgba(56,189,248,0.2)',
                }}
              >
                {phase === 'opening' && (
                  <div className="absolute inset-0" style={{ backgroundColor: 'rgba(56,189,248,0.12)', animation: 'glowPulse 0.5s ease-in-out infinite alternate' }} />
                )}
                <span className="flex items-center justify-center select-none" style={{ animation: phase === 'opening' ? 'boxShake 0.35s ease-in-out infinite' : 'none' }}>
                  <BoxIcon color="#38bdf8" size={96} />
                </span>
              </div>

              <p className="text-xl font-bold text-center" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)', letterSpacing: '-0.5px' }}>
                {phase === 'opening' ? <span className="flex items-center justify-center gap-1.5"><SparkleIcon color="#ffe792" size={16} /> 오픈 중...</span> : '탭하여 열기'}
              </p>
              {phase !== 'opening' && (
                <p className="text-sm text-center" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
                  박스 안에 아이템이 들어있어요!
                </p>
              )}
            </div>

            {/* 열기 버튼 */}
            <div className="w-full flex flex-col gap-3">
              <div style={{ backgroundColor: '#005762', marginTop: 4 }}>
                <button
                  disabled={boxCount <= 0 || phase === 'opening'}
                  onClick={handleOpen}
                  className="w-full flex items-center justify-center text-xl font-bold transition-opacity disabled:opacity-40 active:opacity-80 -translate-y-1"
                  style={{ height: '68px', backgroundColor: '#38bdf8', color: '#003840', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px', border: '2px solid #005762', display: 'flex' }}
                >
                  {boxCount <= 0 ? '박스 없음' : '열기 ▶'}
                </button>
              </div>

              {/* 모두 열기 — 2개 이상일 때만 표시 */}
              {boxCount > 1 && phase === 'idle' && (
                <div style={{ backgroundColor: '#1a3a3a', marginTop: 0 }}>
                  <button
                    onClick={handleOpenAll}
                    className="w-full flex items-center justify-center text-base font-bold transition-opacity active:opacity-80 -translate-y-0.5"
                    style={{ height: '52px', backgroundColor: '#2a5a5a', color: '#38bdf8', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px', border: '2px solid #1a3a3a', display: 'flex' }}
                  >
                    <BoxIcon color="#38bdf8" size={18} /> 모두 열기 ({formatNumber(boxCount)}개)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/home')}
              className="text-sm font-medium"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
            >
              나중에 하기
            </button>

            <div className="w-full px-5 py-4" style={{ backgroundColor: '#17172f', border: '1px solid #23233f' }}>
              <p className="text-sm font-bold mb-1" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
                보유 박스: {formatNumber(boxCount)}개
              </p>
              <p className="text-xs" style={{ color: '#64748b', fontFamily: 'var(--font-game)' }}>
                정답 20% 확률 드롭 · 10문제 연속 미드롭 시 강제 지급
              </p>
            </div>
          </>
        )}

        {/* ── 모두 열기 중 ── */}
        {phase === 'all-opening' && (
          <div className="w-full flex flex-col items-center gap-6 px-8 py-10 border-4 border-[#38bdf8]"
            style={{ backgroundColor: '#1d1d37', boxShadow: '0 6px 0 #000000, 0 0 32px rgba(56,189,248,0.2)' }}
          >
            <div className="flex gap-3">
              {Array.from({ length: Math.min(boxCount, 5) }).map((_, i) => (
                <span key={i} className="flex items-center justify-center" style={{ animation: `boxShake 0.35s ease-in-out ${i * 0.1}s infinite` }}><BoxIcon color="#38bdf8" size={40} /></span>
              ))}
              {boxCount > 5 && <span className="text-2xl self-center" style={{ color: '#38bdf8', fontFamily: 'var(--font-game)' }}>+{boxCount - 5}</span>}
            </div>
            <p className="text-xl font-bold text-center" style={{ color: '#38bdf8', fontFamily: 'var(--font-game)' }}>
              <span className="flex items-center justify-center gap-1.5"><SparkleIcon color="#ffe792" size={16} /> {formatNumber(boxCount)}개 오픈 중...</span>
            </p>
          </div>
        )}

        {/* ── 단일 결과 ── */}
        {phase === 'result' && obtained && (
          <>
            <div
              className="relative flex flex-col items-center gap-6 px-8 py-10 w-full border-4"
              style={{ backgroundColor: '#1d1d37', borderColor: rarityColor, boxShadow: `0 6px 0 #000000, 0 0 48px ${rarityColor}40`, animation: 'itemPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: rarityColor, opacity: 0.8 }} />

              <div
                className="flex items-center justify-center overflow-hidden border-4"
                style={{ width: '176px', height: '176px', backgroundColor: '#000', borderColor: rarityColor, boxShadow: `0 4px 0 #000000, 0 0 32px ${rarityColor}40` }}
              >
                <div className="w-28 h-28 overflow-hidden" style={{ animation: 'itemWiggle 0.6s ease 0.4s' }}>
                  <img src={obtained.imagePath} alt={obtained.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="px-5 py-1.5" style={{ backgroundColor: rarityColor, animation: 'fadeSlideUp 0.4s ease 0.3s both' }}>
                <span className="text-sm font-bold" style={{ color: '#000', fontFamily: 'var(--font-game)', letterSpacing: '1.2px' }}>
                  ✦ {RARITY_LABEL[obtained.rarity]}
                </span>
              </div>

              <div className="text-center" style={{ animation: 'fadeSlideUp 0.4s ease 0.45s both' }}>
                <p className="text-2xl font-bold mb-2" style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.6px' }}>
                  {obtained.name}
                </p>
                <p className="text-sm" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
                  {SLOT_LABEL[obtained.slot]} 슬롯 · {obtained.description}
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <div style={{ backgroundColor: `${rarityColor}60`, marginTop: 4 }}>
                <button
                  onClick={handleEquip}
                  className="w-full flex items-center justify-center text-xl font-bold transition-opacity active:opacity-80 -translate-y-1"
                  style={{ height: '68px', backgroundColor: rarityColor, color: '#000', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px', border: `2px solid ${rarityColor}80`, display: 'flex' }}
                >
                  장착하기
                </button>
              </div>

              {/* 다음 박스 열기 — 남은 박스가 있을 때 */}
              {boxCount > 0 && (
                <div style={{ backgroundColor: '#005762', marginTop: 0 }}>
                  <button
                    onClick={handleOpenNext}
                    className="w-full flex items-center justify-center text-base font-bold transition-opacity active:opacity-80 -translate-y-0.5"
                    style={{ height: '52px', backgroundColor: '#38bdf8', color: '#003840', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px', border: '2px solid #005762', display: 'flex' }}
                  >
                    다음 박스 열기 ({formatNumber(boxCount)}개 남음) ▶
                  </button>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full text-sm font-medium text-center"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)', letterSpacing: '0.5px' }}
              >
                {boxCount > 0 ? '나중에 열기' : '다음 문제 →'}
              </button>
            </div>
          </>
        )}

        {/* ── 모두 열기 결과 ── */}
        {phase === 'all-result' && allObtained.length > 0 && (
          <>
            <div className="w-full" style={{ animation: 'itemPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-3 border-4 border-[#38bdf8]"
                style={{ backgroundColor: '#1d1d37', boxShadow: '0 4px 0 #000, 0 0 24px rgba(56,189,248,0.2)', borderBottomWidth: '2px' }}
              >
                <p className="text-base font-bold" style={{ color: '#38bdf8', fontFamily: 'var(--font-game)' }}>
                  <span className="flex items-center gap-1.5"><BoxIcon color="#38bdf8" size={16} /> 총 {formatNumber(allObtained.length)}개 획득</span>
                </p>
                <p className="text-xs" style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}>
                  인벤토리에 저장됨
                </p>
              </div>

              {/* 아이템 리스트 */}
              <div className="border-4 border-t-0 border-[#38bdf8]" style={{ backgroundColor: '#17172f', maxHeight: '55vh', overflowY: 'auto' }}>
                {allObtained.map((item, i) => {
                  const color = RARITY_COLOR[item.rarity]
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom: i < allObtained.length - 1 ? '1px solid #23233f' : 'none',
                        animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both`,
                      }}
                    >
                      {/* 아이템 이미지 */}
                      <div
                        className="shrink-0 flex items-center justify-center overflow-hidden border-2"
                        style={{ width: '48px', height: '48px', backgroundColor: '#000', borderColor: color }}
                      >
                        <img src={item.imagePath} alt={item.name} className="w-8 h-8 object-cover" />
                      </div>

                      {/* 이름 + 슬롯 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}>
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
                          {SLOT_LABEL[item.slot]}
                        </p>
                      </div>

                      {/* 희귀도 뱃지 */}
                      <div className="shrink-0 px-2 py-0.5" style={{ backgroundColor: color }}>
                        <span className="text-xs font-bold" style={{ color: '#000', fontFamily: 'var(--font-game)' }}>
                          {RARITY_LABEL[item.rarity]}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <div style={{ backgroundColor: '#005762', marginTop: 4 }}>
                <button
                  onClick={() => navigate('/settings', { replace: true })}
                  className="w-full flex items-center justify-center text-xl font-bold transition-opacity active:opacity-80 -translate-y-1"
                  style={{ height: '68px', backgroundColor: '#38bdf8', color: '#003840', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px', border: '2px solid #005762', display: 'flex' }}
                >
                  인벤토리에서 장착하기
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

      {showErrorModal && (
        <ConfirmModal
          title="오류 발생"
          message={errorMessage}
          onConfirm={() => setShowErrorModal(false)}
        />
      )}

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
