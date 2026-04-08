import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { LEVEL_TITLES } from '@/types/user'
import { loadProblems } from '@/shared/services/problemLoader'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { CHARACTERS } from '@/shared/components/CharacterSelectCard'
import { CharacterDisplay } from '@/shared/components/CharacterDisplay'
import { levelProgress, xpForNextLevel } from '@/shared/utils/levelUp'
import { equippedItemsRepo } from '@/shared/db/equippedItemsRepo'
import { loadItems } from '@/shared/services/itemLoader'
import { userItemRepo } from '@/shared/db/userItemRepo'
import { formatNumber } from '@/shared/utils/format'
import type { Item } from '@/types/item'

export function HomeRoute() {
  const profile = useUserProfile()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [allItems, setAllItems] = useState<Item[]>([])

  const equipped = useLiveQuery(
    () => profile ? equippedItemsRepo.get(profile.userId) : undefined,
    [profile?.userId]
  )
  const userItems = useLiveQuery(
    () => profile ? userItemRepo.getAll(profile.userId) : [],
    [profile?.userId],
    []
  )

  useEffect(() => {
    loadItems().then(setAllItems)
  }, [])

  async function startProblem() {
    if (!profile) return
    setLoading(true)
    setLoadError(false)
    try {
      const data = await loadProblems()
      const recentIds = await learningLogRepo.getRecentProblemIds(profile.userId, 10)
      const gradeProblems = data.problems.filter(p => p.grade === profile.grade)

      const notRecent = gradeProblems.filter(p => !recentIds.includes(p.id))
      const pool = notRecent.length > 0 ? notRecent : gradeProblems

      const byDifficulty = pool.filter(p => p.difficulty === profile.unlockedDifficulty)
      const candidates = byDifficulty.length > 0 ? byDifficulty : pool

      const rec = candidates[Math.floor(Math.random() * candidates.length)]
      if (rec) navigate('/problem', { state: { problem: rec } })
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm"
           style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-muted)' }}>
        로딩 중...
      </div>
    )
  }

  const mission = getMissionProgress(profile)
  const character = CHARACTERS.find(c => c.id === profile.characterId) ?? CHARACTERS[0]
  const itemMap = Object.fromEntries(allItems.map(i => [i.id, i]))
  const boxCount = profile.boxCount ?? 0

  function getEquippedItem(slot: 'hat' | 'weapon' | 'armor' | 'pet'): Item | null {
    const equippedId = equipped?.[slot] ?? null
    if (!equippedId) return null
    const ui = userItems.find(u => u.id === equippedId)
    return ui ? (itemMap[ui.itemId] ?? null) : null
  }

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: 'var(--color-bg-base)' }}>

      {/* GNB */}
      <div className="shrink-0 flex flex-col px-4 pt-3 pb-2"
           style={{
             borderBottom: '1px solid var(--color-border)',
             background: 'linear-gradient(180deg, var(--color-bg-raised) 0%, var(--color-bg-base) 100%)',
           }}>
        {/* 이름 · 레벨 / 별 · 설정 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {profile.displayName}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-cyan)' }}>
              ✦ {LEVEL_TITLES[profile.level] ?? `Lv.${formatNumber(profile.level)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                 style={{
                   backgroundColor: 'var(--color-bg-surface)',
                   border: '1px solid rgba(255, 209, 102, 0.25)',
                 }}>
              <span className="text-sm leading-none">⭐</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-yellow)', fontFamily: 'var(--font-game)' }}>
                {formatNumber(profile.totalStars)}
              </span>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="text-xl transition-opacity active:opacity-60 w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
            >
              ⚙️
            </button>
          </div>
        </div>
        {/* XP 진행 바 */}
        {(() => {
          const xp = profile.totalXP ?? 0
          const progress = levelProgress(xp)
          const needed = xpForNextLevel(profile.level)
          const current = Math.round(progress * needed)
          return (
            <>
              <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', backgroundColor: 'var(--color-bg-surface)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: 'var(--color-green)' }} />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                  Lv.{formatNumber(profile.level)}
                </span>
                <span className="text-[9px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-game)' }}>
                  {formatNumber(current)} / {formatNumber(needed)} XP
                </span>
              </div>
            </>
          )
        })()}
      </div>

      {/* 스트릭 배너 */}
      {profile.currentStreak > 0 && (
        <div className="streak-pulse mx-4 mt-3 rounded-xl px-4 py-2.5 text-center text-sm font-bold"
             style={{
               background: 'linear-gradient(135deg, rgba(255,159,67,0.12) 0%, rgba(255,107,107,0.08) 100%)',
               border: '1px solid rgba(255, 159, 67, 0.5)',
               color: 'var(--color-orange)',
             }}>
          🔥 {formatNumber(profile.currentStreak)}일 연속 학습 중!
        </div>
      )}

      {/* 오늘의 미션 배너 */}
      <div className="mx-4 mt-3 rounded-xl px-4 py-3"
           style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold" style={{ color: 'var(--color-cyan)' }}>🎯 오늘의 미션</p>
          {mission.isComplete && (
            <span className="text-xs font-bold" style={{ color: 'var(--color-green)' }}>🎉 완료!</span>
          )}
        </div>
        {/* 진행 바 */}
        <div className="w-full rounded-full mb-2.5 overflow-hidden"
             style={{ height: '5px', backgroundColor: 'var(--color-bg-surface)' }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out"
               style={{
                 width: `${Math.min(100, (mission.problemsSolved / DAILY_PROBLEM_GOAL) * 100)}%`,
                 background: mission.isComplete
                   ? 'var(--color-green)'
                   : 'linear-gradient(90deg, var(--color-cyan), var(--color-purple))',
               }} />
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span>{mission.problemsSolved >= DAILY_PROBLEM_GOAL ? '✅' : '⬜'}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>문제 {formatNumber(DAILY_PROBLEM_GOAL)}개</span>
            <span className="font-bold" style={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-game)' }}>
              {formatNumber(mission.problemsSolved)}/{formatNumber(DAILY_PROBLEM_GOAL)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{mission.wrongReviewed ? '✅' : '⬜'}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>오답 복습</span>
          </div>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">

        {/* 캐릭터 카드 — 탭 → 인벤토리 */}
        <CharacterDisplay
          characterEmoji={character.emoji}
          accentColor={character.accentColor}
          equippedSlots={{
            hat:    getEquippedItem('hat')?.emoji    ?? undefined,
            weapon: getEquippedItem('weapon')?.emoji ?? undefined,
            armor:  getEquippedItem('armor')?.emoji  ?? undefined,
            pet:    getEquippedItem('pet')?.emoji    ?? undefined,
          }}
          boxCount={boxCount}
          onClick={() => navigate('/inventory')}
          showHint
        />

        {/* 학년 카드 */}
        <div className="w-full rounded-xl px-6 py-4 text-center"
             style={{
               backgroundColor: 'var(--color-bg-raised)',
               border: '1px solid var(--color-border)',
               boxShadow: 'var(--shadow-card)',
             }}>
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatNumber(profile.grade)}학년 수학
            </span>
            {profile.unlockedDifficulty === 'applied' && (
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: 'rgba(196,127,255,0.15)', color: 'var(--color-purple)', border: '1px solid rgba(196,127,255,0.3)' }}>
                🔓 응용
              </span>
            )}
          </div>
          <div className="mt-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            오늘도 함께 풀어보자! 💪
          </div>
        </div>

        {/* 학습 시작 버튼 */}
        <button
          onClick={startProblem}
          disabled={loading}
          className="btn-glow-green w-full min-h-[56px] rounded-xl text-lg font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
          style={{
            background: loading
              ? 'var(--color-green)'
              : 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #15803D 100%)',
            color: '#071a14',
          }}
        >
          {loading ? '문제 불러오는 중...' : '학습 시작하기  →'}
        </button>

        {loadError && (
          <p className="text-sm text-center" style={{ color: 'var(--color-red)' }}>
            문제를 불러오지 못했어요. 다시 시도해주세요.
          </p>
        )}

        {/* 서브 버튼 */}
        <div className="flex gap-2.5 w-full">
          {[
            { label: '수학 일기', emoji: '📖', path: '/diary', color: 'var(--color-cyan)', bg: 'rgba(125,232,255,0.07)', border: 'rgba(125,232,255,0.2)' },
            { label: '오답 복습', emoji: '🔁', path: '/remind', color: 'var(--color-yellow)', bg: 'rgba(255,209,102,0.07)', border: 'rgba(255,209,102,0.2)' },
            { label: '보호자', emoji: '👨‍👩‍👧', path: '/parent', color: 'var(--color-purple)', bg: 'rgba(196,127,255,0.07)', border: 'rgba(196,127,255,0.2)' },
          ].map(btn => (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              className="flex-1 min-h-[52px] rounded-xl font-bold text-xs transition-all active:opacity-70 active:scale-[0.97] flex flex-col items-center justify-center gap-0.5"
              style={{ backgroundColor: btn.bg, color: btn.color, border: `1px solid ${btn.border}` }}
            >
              <span className="text-lg leading-none">{btn.emoji}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNavBar />
    </div>
  )
}
