import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useTheme } from '@/shared/hooks/useTheme'
import { loadProblems } from '@/shared/services/problemLoader'
import { learningLogRepo } from '@/shared/db/learningLogRepo'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { getMissionProgress, DAILY_PROBLEM_GOAL } from '@/shared/hooks/useDailyMission'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { MainTabHeader } from '@/shared/components/MainTabHeader'
import { formatNumber } from '@/shared/utils/format'
import { useState } from 'react'
import { FlameIcon, BoxIcon, SwordIcon, RetryIcon, GlobeIcon, StarIcon } from '@/shared/components/PixelIcons'
import { DifficultyBadge } from '@/shared/components/DifficultyBadge'
import type { Problem } from '@/types/problem'

// World Map 정보
const WORLDS = {
  1: { name: '평원의 왕국', color: '#10b981', bgColor: '#0c2d15' },
  2: { name: '신비의 던전', color: '#8b5cf6', bgColor: '#1d0c2d' },
}

// 학년/학기별 단원 매핑
const GRADE_UNITS: Record<number, Record<number, { chapter: number; unit: string }[]>> = {
  4: {
    1: [
      { chapter: 1, unit: '큰 수' },
      { chapter: 2, unit: '각도' },
      { chapter: 3, unit: '곱셈과 나눗셈' },
      { chapter: 4, unit: '평면도형의 이동' },
      { chapter: 5, unit: '막대그래프' },
      { chapter: 6, unit: '규칙 찾기' },
      { chapter: 7, unit: '분수의 덧셈과 뺄셈' },
    ],
    2: [
      { chapter: 1, unit: '분수의 덧셈과 뺄셈' },
      { chapter: 2, unit: '삼각형' },
      { chapter: 3, unit: '소수의 덧셈과 뺄셈' },
      { chapter: 4, unit: '사각형' },
      { chapter: 5, unit: '꺾은선그래프' },
      { chapter: 6, unit: '다각형' },
    ],
  },
  5: {
    1: [
      { chapter: 1, unit: '자연수의 혼합 계산' },
      { chapter: 2, unit: '약수와 배수' },
      { chapter: 3, unit: '규칙과 대응' },
      { chapter: 4, unit: '약분과 통분' },
      { chapter: 5, unit: '분수의 덧셈과 뺄셈' },
      { chapter: 6, unit: '다각형의 둘레와 넓이' },
    ],
    2: [
      { chapter: 1, unit: '수의 범위와 어림하기' },
      { chapter: 2, unit: '분수의 곱셈' },
      { chapter: 3, unit: '합동과 대칭' },
      { chapter: 4, unit: '소수의 곱셈' },
      { chapter: 5, unit: '직육면체' },
      { chapter: 6, unit: '평균과 가능성' },
    ],
  },
  6: {
    1: [
      { chapter: 1, unit: '분수의 나눗셈' },
      { chapter: 2, unit: '각기둥과 각뿔' },
      { chapter: 3, unit: '소수의 나눗셈' },
      { chapter: 4, unit: '비와 비율' },
      { chapter: 5, unit: '여러 가지 그래프' },
      { chapter: 6, unit: '직육면체의 겉넓이와 부피' },
    ],
    2: [
      { chapter: 1, unit: '분수의 나눗셈' },
      { chapter: 2, unit: '소수의 나눗셈' },
      { chapter: 3, unit: '공간과 입체' },
      { chapter: 4, unit: '비례식과 비례배분' },
      { chapter: 5, unit: '원의 넓이' },
      { chapter: 6, unit: '원기둥, 원뿔, 구' },
    ],
  },
}

const DIFFICULTY_CHAPTER: Record<string, number> = {
  basic: 1,
  applied: 3,
  challenge: 5,
}


export function HomeRoute() {
  const profile = useUserProfile()
  const navigate = useNavigate()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [showWorldMap, setShowWorldMap] = useState(false)

  const currentWorld = (profile && profile.currentSemester === 2) ? WORLDS[2] : WORLDS[1]
  const worldColor = currentWorld?.color || '#10b981'
  const worldName = currentWorld?.name || '평원의 왕국'

  async function handleSwitchSemester(sem: 1 | 2) {
    if (!profile || profile.currentSemester === sem) return
    await userProfileRepo.update({ currentSemester: sem })
    setShowWorldMap(false)
  }

  async function startProblem() {
    if (!profile) return
    setLoading(true)
    setLoadError(false)
    try {
      const data = await loadProblems()
      
      // 1. 최근 푼 데이터 분석
      const recentIds = await learningLogRepo.getRecentProblemIds(profile.userId, 200)
      const recentLogs = await learningLogRepo.getRecentByUser(profile.userId, 100)
      
      // 2. 현재 조건(학년/학기)에 맞는 전체 풀
      const pool = data.problems.filter(p => 
        p.grade === profile.grade && 
        p.semester === profile.currentSemester
      )
      
      // 3. 난이도 필터링
      let difficultyFiltered: Problem[] = []
      if (profile.difficultyMode === 'manual') {
        difficultyFiltered = pool.filter(p => p.difficulty === profile.unlockedDifficulty)
      } else {
        const byDifficulty = pool.filter(p => p.difficulty === profile.unlockedDifficulty)
        difficultyFiltered = byDifficulty.length > 0 ? byDifficulty : pool
      }

      if (difficultyFiltered.length === 0) {
        setLoadError(true); return
      }

      // 4. [고도화] 유형 순환 알고리즘 적용
      const availableConcepts = Array.from(new Set(difficultyFiltered.map(p => p.concept)))
      
      const conceptLastPlayed: Record<string, number> = {}
      availableConcepts.forEach(c => {
        const lastLog = recentLogs.find(l => l.concept === c)
        conceptLastPlayed[c] = lastLog ? new Date(lastLog.timestamp).getTime() : -1
      })

      const sortedConcepts = [...availableConcepts].sort((a, b) => conceptLastPlayed[a] - conceptLastPlayed[b])
      const topPriorityConcepts = sortedConcepts.slice(0, Math.max(2, Math.floor(sortedConcepts.length / 3)))
      
      let finalCandidates = difficultyFiltered.filter(p => topPriorityConcepts.includes(p.concept) && !recentIds.includes(p.id))
      
      if (finalCandidates.length === 0) {
        finalCandidates = difficultyFiltered.filter(p => topPriorityConcepts.includes(p.concept))
      }

      const rec = finalCandidates[Math.floor(Math.random() * finalCandidates.length)]
      if (rec) navigate('/problem', { state: { problem: rec } })
    } catch (err) {
      console.error('Problem selection error:', err)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm bg-[#0f172a] text-[#aaa8c3]">
        로딩 중...
      </div>
    )
  }

  const mission = profile ? getMissionProgress(profile) : { problemsSolved: 0, wrongReviewed: false }
  const boxCount = profile?.boxCount ?? 0
  const missionPct = profile ? Math.min(100, (mission.problemsSolved / DAILY_PROBLEM_GOAL) * 100) : 0
  const chapterIdx = profile ? (DIFFICULTY_CHAPTER[profile.unlockedDifficulty] ?? 1) : 1
  const gradeUnits = GRADE_UNITS[profile.grade]?.[profile.currentSemester ?? 1] ?? GRADE_UNITS[4][1]
  const dungeonUnit = gradeUnits.find(u => u.chapter === chapterIdx) ?? gradeUnits[0]
  const hasStreak = profile ? profile.currentStreak > 0 : false

  return (
    <div className="flex h-dvh flex-col bg-[#0f172a]">
      <MainTabHeader title="수학 퀘스트" />

      <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-[#1c1c3a]" style={{ backgroundColor: '#111127' }}>
        <button onClick={() => setShowWorldMap(true)} className="flex items-center gap-2 active:opacity-60 transition-opacity">
          <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ backgroundColor: worldColor }}><GlobeIcon color="#000" size={14} /></div>
          <span className="text-sm font-bold" style={{ color: worldColor, fontFamily: 'var(--font-game)' }}>{worldName} <span className="text-[10px] ml-0.5">▼</span></span>
        </button>
        <div className="flex items-center gap-1.5"><StarIcon color="#ffe792" size={12} /><span className="text-xs font-bold" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>{formatNumber(profile.totalStars)}</span></div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#0f172a' }}>
        <div className="h-1 w-full" style={{ backgroundColor: worldColor, opacity: 0.3 }} />
        <div className="px-4 pt-4 pb-24 flex flex-col gap-4">
          <div className="relative bg-[#17172f] border-4 border-[#23233f]" style={{ height: '144px', overflow: 'visible', boxShadow: '0 6px 0 #000000' }}>
            <div className="relative z-10" style={{ padding: '28px 28px' }}>
              <p className="text-[24px] font-medium text-[#38bdf8]" style={{ lineHeight: '30px' }}>오늘도 모험을<br />시작하자!</p>
              <p className="text-[14px] font-medium text-[#aaa8c3] mt-2" style={{ lineHeight: '20px' }}>어제보다 더 강력한 수학 용사가 되세요.</p>
            </div>
            <button onClick={() => navigate('/settings')} className="absolute w-[120px] h-[120px] flex items-center justify-center active:scale-[0.97] transition-transform" style={{ top: '12px', right: '8px' }}><img src="/images/hero-knight.png" alt="hero" className="w-full h-full object-contain" /></button>
          </div>

          <div className="bg-[#111127] border-4 border-[#23233f]" style={{ padding: '20px 20px', boxShadow: '0 4px 0 #000000' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2" style={{ borderColor: theme.primary }} /><span className="text-[16px] font-medium" style={{ color: theme.primary, lineHeight: '24px' }}>오늘의 미션</span></div>
              <span className="text-[12px] font-bold" style={{ color: theme.primary, opacity: 0.8, lineHeight: '16px', fontFamily: 'var(--font-game)' }}>{Math.round(missionPct)}% 완료</span>
            </div>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <span className="text-[12px] font-medium text-[#e5e3ff]" style={{ lineHeight: '16px' }}>문제 풀기</span>
              <span className="text-[12px] font-bold text-[#e5e3ff]" style={{ lineHeight: '16px', fontFamily: 'var(--font-game)' }}>({formatNumber(mission.problemsSolved)}/{formatNumber(DAILY_PROBLEM_GOAL)})</span>
            </div>
            <div className="relative bg-[#23233f]" style={{ height: '24px' }}><div className="absolute transition-[width] duration-700" style={{ top: '4px', left: '4px', height: '16px', backgroundColor: theme.primary, width: missionPct > 0 ? `calc(${missionPct}% - 8px)` : '0px', minWidth: 0 }} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={hasStreak ? 'bg-[#ff8a3d] border-4 border-[#b85a1c]' : 'bg-[#1d1d37] border-4 border-[#23233f]'} style={{ padding: '20px 20px', boxShadow: hasStreak ? '0 4px 0 #632d0a' : '0 4px 0 #000000' }}>
              <div style={{ height: '22.5px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}><FlameIcon color={hasStreak ? '#ffffff' : '#8b5cf6'} innerColor={hasStreak ? '#ffe792' : '#38bdf8'} size={22} /></div>
              <p className="text-[12px] font-medium text-[#632d0a]" style={{ lineHeight: '16px' }}>학습 스트릭</p>
              <p className="text-[18px] font-medium text-white" style={{ lineHeight: '22.5px' }}>{hasStreak ? `${formatNumber(profile.currentStreak)}일 연속\n학습 중!` : '오늘\n시작해봐요!'}</p>
            </div>
            <button onClick={() => navigate(boxCount > 0 ? '/box-open' : '/settings')} className="text-left bg-[#17172f] border-4 border-[#23233f] active:opacity-80 transition-opacity" style={{ padding: '20px 20px', boxShadow: '0 4px 0 #000000' }}>
              <div style={{ height: '25px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}><BoxIcon color="#ffe792" size={22} /></div>
              <p className="text-[12px] font-medium text-[#aaa8c3]" style={{ lineHeight: '16px' }}>획득한 보상</p>
              <p className="text-[18px] font-bold text-[#ffe792]" style={{ lineHeight: '28px', fontFamily: 'var(--font-game)' }}>{formatNumber(boxCount)}개 상자</p>
            </button>
          </div>

          <div className="bg-[#1d1d37] border-4 overflow-hidden" style={{ borderColor: theme.primary, boxShadow: `0 6px 0 #000000, 0 0 20px ${theme.primary}40` }}>
            <div className="relative" style={{ height: '128px' }}>
              <img src="/images/dungeon-bg.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0" style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, #1d1d37)' }} />
              <div className="absolute flex items-center justify-center" style={{ left: '16px', bottom: '7px', width: '59px', height: '17px', backgroundColor: theme.primary, borderRadius: '4px' }}><span className="text-[10px] font-medium text-[#000]">현재 던전</span></div>
            </div>
            <div style={{ padding: '24px 24px 24px' }}>
              <div className="flex items-center gap-2 mb-1"><p className="text-[20px] font-bold" style={{ color: theme.primary, lineHeight: '28px', fontFamily: 'var(--font-game)' }}>{formatNumber(profile.grade)}학년 {formatNumber(profile.currentSemester ?? 1)}학기 - {chapterIdx}단원</p><DifficultyBadge difficulty={profile.unlockedDifficulty} /></div>
              <p className="text-[24px] font-medium text-[#e5e3ff]" style={{ lineHeight: '32px', marginBottom: '24px' }}>{dungeonUnit.unit}</p>
              <button onClick={startProblem} disabled={loading} className="w-full flex items-center justify-center gap-2 border-2 disabled:opacity-50 active:scale-[0.98] transition-transform" style={{ height: '68px', backgroundColor: theme.primary, borderColor: 'rgba(0,0,0,0.3)', color: '#000' }}><SwordIcon color="#000" size={22} /><span className="text-[18px] font-medium">{loading ? '불러오는 중...' : '모험 시작하기!'}</span></button>
              {loadError && <p className="text-[12px] text-center text-[#ff716c] mt-2">문제를 불러오지 못했어요. 다시 시도해주세요.</p>}
              <button onClick={() => navigate('/remind')} className="w-full flex items-center justify-center gap-2 border-2 border-[#23233f] text-[#aaa8c3] active:scale-[0.98] transition-transform mt-2" style={{ height: '48px', backgroundColor: '#17172f' }}><RetryIcon color="#ff716c" size={16} /><span className="text-[14px] font-medium" style={{ lineHeight: '20px' }}>오답 다시 도전하기</span></button>
            </div>
          </div>
        </div>
      </div>
      <BottomNavBar />

      {showWorldMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#0f172a] border-4 border-[#23233f] overflow-hidden flex flex-col" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
            <div className="px-5 py-4 border-b border-[#23233f] flex items-center justify-between bg-[#17172f]">
              <span className="text-lg font-bold" style={{ color: '#38bdf8', fontFamily: 'var(--font-game)' }}>🗺️ 월드맵 선택</span>
              <button onClick={() => setShowWorldMap(false)} className="w-8 h-8 flex items-center justify-center bg-[#23233f] text-[#aaa8c3] font-bold">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <button onClick={() => handleSwitchSemester(1)} className={`relative flex flex-col gap-1 p-5 border-4 transition-all active:scale-[0.98] ${profile.currentSemester === 1 ? 'border-[#10b981]' : 'border-[#23233f]'}`} style={{ backgroundColor: profile.currentSemester === 1 ? '#0c2d15' : '#17172f' }}>
                <span className="text-xs font-black tracking-widest text-[#10b981]" style={{ fontFamily: 'var(--font-game)' }}>WORLD 01</span>
                <h3 className="text-xl font-bold text-white mt-1">평원의 왕국</h3>
                <p className="text-xs text-[#aaa8c3]">{profile.grade}학년 1학기 교육과정</p>
              </button>
              <button onClick={() => handleSwitchSemester(2)} className={`relative flex flex-col gap-1 p-5 border-4 transition-all active:scale-[0.98] ${profile.currentSemester === 2 ? 'border-[#8b5cf6]' : 'border-[#23233f]'}`} style={{ backgroundColor: profile.currentSemester === 2 ? '#1d0c2d' : '#17172f' }}>
                <span className="text-xs font-black tracking-widest text-[#8b5cf6]" style={{ fontFamily: 'var(--font-game)' }}>WORLD 02</span>
                <h3 className="text-xl font-bold text-white mt-1">신비의 던전</h3>
                <p className="text-xs text-[#aaa8c3]">{profile.grade}학년 2학기 교육과정</p>
              </button>
            </div>
            <div className="px-5 pb-6"><button onClick={() => setShowWorldMap(false)} className="w-full py-3 text-sm font-bold text-[#aaa8c3] bg-[#17172f] border-2 border-[#23233f]">닫기</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
