import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { loadProblems } from '@/shared/services/problemLoader'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { AVATARS } from '@/types/avatar'
import { formatNumber } from '@/shared/utils/format'
import { useState } from 'react'

// 4학년 1학기 교육과정 단원 (피그마 기준)
const GRADE4_UNITS = [
  { chapter: 1, unit: '큰 수' },
  { chapter: 2, unit: '각도' },
  { chapter: 3, unit: '곱셈과 나눗셈' },
  { chapter: 4, unit: '평면도형의 이동' },
  { chapter: 5, unit: '막대그래프' },
  { chapter: 6, unit: '규칙 찾기' },
  { chapter: 7, unit: '분수의 덧셈과 뺄셈' },
]

const DIFFICULTY_CHAPTER: Record<string, number> = {
  basic: 1,
  applied: 3,
  challenge: 5,
}


export function HomeRoute() {
  const profile = useUserProfile()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

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
      <div className="flex h-dvh items-center justify-center text-sm bg-[#0c0c1f] text-[#aaa8c3]">
        로딩 중...
      </div>
    )
  }

  const mission = getMissionProgress(profile)
  const avatar = AVATARS.find(a => a.id === (profile.avatarId ?? 'warrior')) ?? AVATARS[0]
  const boxCount = profile.boxCount ?? 0
  const missionPct = Math.min(100, (mission.problemsSolved / DAILY_PROBLEM_GOAL) * 100)
  const chapterIdx = DIFFICULTY_CHAPTER[profile.unlockedDifficulty] ?? 1
  const dungeonUnit = GRADE4_UNITS.find(u => u.chapter === chapterIdx) ?? GRADE4_UNITS[0]
  const hasStreak = profile.currentStreak > 0

  return (
    <div className="flex h-dvh flex-col bg-[#0c0c1f]">

      {/* ── 헤더 (피그마: h=64, bg rgba(#0c0c1f,0.6), border-b #1c1c3a) ── */}
      <header className="shrink-0 flex items-center justify-between px-5 h-16 border-b border-[#1c1c3a] bg-[#0c0c1f]/60">
        <div className="flex items-center gap-3">
          {/* 피그마: ← 문자, color #ccccff, Inter 18px */}
          <span className="text-[18px] text-[#ccccff] font-normal leading-none">←</span>
          {/* 피그마: Noto Sans KR Medium 20px, #81ecff, letterSpacing 1px */}
          <span className="text-[20px] font-medium text-[#81ecff] tracking-[0.05em]">
            수학 퀘스트
          </span>
        </div>
        {/* 피그마: 40×40, bg #1d1d37, border 1.5px #81ecff */}
        <button
          onClick={() => navigate('/inventory')}
          className="w-10 h-10 flex items-center justify-center overflow-hidden bg-[#1d1d37] border-[1.5px] border-[#81ecff]"
        >
          {avatar.imagePath
            ? <img src={avatar.imagePath} alt={avatar.name} className="w-full h-full object-cover" />
            : <span className="text-lg">⚔️</span>}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* 피그마: 카드 간 gap 16px, 좌우 padding 16px */}
        <div className="px-4 pt-4 pb-24 flex flex-col gap-4">

          {/* ── 히어로 배너 (피그마 node 3:3019: 358×144, bg #17172f, border #23233f) ── */}
          <div className="relative bg-[#17172f]" style={{ border: '1px solid #23233f', height: '144px', overflow: 'visible' }}>
            {/* 텍스트 영역 — 이미지 위 레이어 */}
            <div className="relative z-10" style={{ padding: '28px 28px' }}>
              {/* 피그마: Noto Sans KR Medium 500, 24px, lineHeight 30px, #81ecff */}
              <p className="text-[24px] font-medium text-[#81ecff]" style={{ lineHeight: '30px' }}>
                오늘도 모험을<br />시작하자!
              </p>
              {/* 피그마: Noto Sans KR Medium 500, 14px, lineHeight 20px, #aaa8c3 */}
              <p className="text-[14px] font-medium text-[#aaa8c3] mt-2" style={{ lineHeight: '20px' }}>
                어제보다 더 강력한 수학 용사가 되세요.
              </p>
            </div>
            {/* 피그마: hero-knight.png — 카드 우측 */}
            <button
              onClick={() => navigate('/inventory')}
              className="absolute w-[120px] h-[120px] flex items-center justify-center active:scale-[0.97] transition-transform"
              style={{ top: '12px', right: '8px' }}
            >
              <img src="/images/hero-knight.png" alt="hero" className="w-full h-full object-contain" />
            </button>
          </div>

          {/* ── 오늘의 미션 (피그마 node 3:3027: 358×132, bg #111127, border #23233f) ── */}
          <div className="bg-[#111127] border border-[#23233f]" style={{ padding: '20px 20px' }}>
            {/* 타이틀 행 */}
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2">
                {/* 피그마: 체크 원형 아이콘 (Container node 3:3030) */}
                <div className="w-3 h-3 rounded-full border-2 border-[#81ecff]" />
                {/* 피그마: Noto Sans KR Medium 500, 16px, lineHeight 24px, #81ecff */}
                <span className="text-[16px] font-medium text-[#81ecff]" style={{ lineHeight: '24px' }}>
                  오늘의 미션
                </span>
              </div>
              {/* 피그마: Space Grotesk Bold 700, 12px, lineHeight 16px, #00d4ec */}
              <span className="text-[12px] font-bold text-[#00d4ec]" style={{ lineHeight: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
                {Math.round(missionPct)}% 완료
              </span>
            </div>
            {/* 문제 풀기 행 */}
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              {/* 피그마: Noto Sans KR Medium 500, 12px, #e5e3ff */}
              <span className="text-[12px] font-medium text-[#e5e3ff]" style={{ lineHeight: '16px' }}>
                문제 풀기
              </span>
              {/* 피그마: Space Grotesk Bold 700, 12px, #e5e3ff */}
              <span className="text-[12px] font-bold text-[#e5e3ff]" style={{ lineHeight: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
                ({formatNumber(mission.problemsSolved)}/{formatNumber(DAILY_PROBLEM_GOAL)})
              </span>
            </div>
            {/* 피그마: 진행바 컨테이너 318×24, bg #23233f / 내부 바 h=16, top=4, left=4, bg #81ecff */}
            <div className="relative bg-[#23233f]" style={{ height: '24px' }}>
              <div
                className="absolute bg-[#81ecff] transition-[width] duration-700"
                style={{
                  top: '4px',
                  left: '4px',
                  height: '16px',
                  width: missionPct > 0 ? `calc(${missionPct}% - 8px)` : '0px',
                  minWidth: 0,
                }}
              />
            </div>
          </div>

          {/* ── 스트릭 · 보상 2열 (피그마: 각 171×101.5, gap 16px) ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* 스트릭 카드 (피그마 node 3:3043: bg #ff8a3d, border #b85a1c) */}
            <div
              className={hasStreak
                ? 'bg-[#ff8a3d] border border-[#b85a1c]'
                : 'bg-[#1d1d37] border border-[#23233f]'
              }
              style={{ padding: '20px 20px' }}
            >
              {/* 피그마: 상단 Container (node 3:3044) — 불꽃 아이콘 */}
              <div style={{ height: '22.5px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>🔥</span>
              </div>
              {/* 피그마: Noto Sans KR Medium 500, 12px, lineHeight 16px, #632d0a */}
              <p className="text-[12px] font-medium text-[#632d0a]" style={{ lineHeight: '16px', marginBottom: '0px' }}>
                학습 스트릭
              </p>
              {/* 피그마: Noto Sans KR Medium 500, 18px, lineHeight 22.5px, #ffffff */}
              <p className="text-[18px] font-medium text-white" style={{ lineHeight: '22.5px' }}>
                {hasStreak
                  ? `${formatNumber(profile.currentStreak)}일 연속\n학습 중!`
                  : '오늘\n시작해봐요!'}
              </p>
            </div>

            {/* 보상 카드 (피그마 node 3:3051: bg #17172f, border #23233f) */}
            <button
              onClick={() => navigate('/inventory')}
              className="text-left bg-[#17172f] border border-[#23233f] active:opacity-80 transition-opacity"
              style={{ padding: '20px 20px' }}
            >
              {/* 피그마: 상단 Container (node 3:3052) — 상자 아이콘 */}
              <div style={{ height: '25px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>📦</span>
              </div>
              {/* 피그마: Noto Sans KR Medium 500, 12px, lineHeight 16px, #aaa8c3 */}
              <p className="text-[12px] font-medium text-[#aaa8c3]" style={{ lineHeight: '16px' }}>
                획득한 보상
              </p>
              {/* 피그마: Space Grotesk Bold 700, 18px, lineHeight 28px, #ffe792 */}
              <p className="text-[18px] font-bold text-[#ffe792]" style={{ lineHeight: '28px', fontFamily: 'Space Grotesk, sans-serif' }}>
                {formatNumber(boxCount)}개 상자
              </p>
            </button>
          </div>

          {/* ── 던전 카드 (피그마 node 3:3059: 358×332, bg #1d1d37, border #c180ff 1px) ── */}
          <div className="bg-[#1d1d37] border-2 border-[#c180ff] overflow-hidden">

            {/* 배경 이미지 영역 (피그마 node 3:3060: 350×128) */}
            <div className="relative" style={{ height: '128px' }}>
              <img
                src="/images/dungeon-bg.png"
                alt=""
                className="w-full h-full object-cover"
              />
              {/* 하단 그라디언트 페이드 (피그마 node 3:3062) */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '64px',
                  background: 'linear-gradient(to bottom, transparent, #1d1d37)',
                }}
              />
              {/* 현재 던전 배지 (피그마 node 3:3063: bg #c180ff, borderRadius 4, 58.55×17) */}
              {/* 피그마 절대 위치: x=263-247=16, y=651-547=104 → bottom=128-104-17=7 */}
              <div
                className="absolute"
                style={{
                  left: '16px',
                  bottom: '7px',
                  backgroundColor: '#c180ff',
                  borderRadius: '4px',
                  padding: '1px 8px',
                }}
              >
                {/* 피그마: Noto Sans KR Medium 500, 10px, lineHeight 15px, #33005b */}
                <span className="text-[10px] font-medium text-[#33005b]" style={{ lineHeight: '15px' }}>
                  현재 던전
                </span>
              </div>
            </div>

            {/* 텍스트 + 버튼 (피그마 node 3:3065: 350×196, padding 24px 24px) */}
            <div style={{ padding: '24px 24px 24px' }}>
              {/* 피그마 node 3:3068: Space Grotesk Bold 700, 20px, lineHeight 28px, #c180ff */}
              <p
                className="text-[20px] font-bold text-[#c180ff]"
                style={{ lineHeight: '28px', marginBottom: '4px', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {formatNumber(profile.grade)}학년 1학기 - {chapterIdx}단원
              </p>
              {/* 피그마 node 3:3070: Noto Sans KR Medium 500, 24px, lineHeight 32px, #e5e3ff */}
              <p
                className="text-[24px] font-medium text-[#e5e3ff]"
                style={{ lineHeight: '32px', marginBottom: '24px' }}
              >
                {dungeonUnit.unit}
              </p>

              {/* 버튼 (피그마 node 3:3071: 302×68, bg #c180ff, border #4f0089) */}
              <button
                onClick={startProblem}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#c180ff] border-2 border-[#4f0089] text-[#33005b] disabled:opacity-50 active:scale-[0.98] transition-transform"
                style={{ height: '68px' }}
              >
                {/* 피그마: 아이콘 Container (node 3:3072: 20×20) + 텍스트 Noto Sans KR Medium 500, 18px, lineHeight 28px */}
                <span className="text-[20px] leading-none">⚔</span>
                <span className="text-[18px] font-medium" style={{ lineHeight: '28px' }}>
                  {loading ? '불러오는 중...' : '모험 시작하기!'}
                </span>
              </button>

              {loadError && (
                <p className="text-[12px] text-center text-[#ff716c] mt-2">
                  문제를 불러오지 못했어요. 다시 시도해주세요.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      <BottomNavBar />
    </div>
  )
}
