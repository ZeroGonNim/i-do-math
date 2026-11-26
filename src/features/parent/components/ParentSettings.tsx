import { useState } from 'react'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import type { UserProfile } from '@/types/user'

const AVAILABLE_GRADES = new Set([4, 5, 6])

interface Props {
  profile: UserProfile
  primaryColor: string
  onGradeClick: (grade: number) => void
}

export function ParentSettings({ profile, primaryColor, onGradeClick }: Props) {
  const [showDifficultyTooltip, setShowDifficultyTooltip] = useState(false)

  return (
    <div className="px-6 py-8 space-y-8" style={{ backgroundColor: '#17172f', borderBottom: '1px solid #1c1c3a' }}>
      {/* 학년 선택 */}
      <div>
        <p className="text-xs font-bold mb-4" style={{ color: primaryColor }}>아이 학년 설정</p>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(g => {
            const available = AVAILABLE_GRADES.has(g)
            const selected = profile.grade === g
            return (
              <button
                key={g}
                onClick={() => onGradeClick(g)}
                className="relative py-3 text-sm font-bold border-2 transition-all"
                style={
                  !available
                    ? { backgroundColor: '#111127', color: '#3a3a5c', borderColor: '#1c1c3a' }
                    : selected
                    ? { backgroundColor: primaryColor, color: '#000', borderColor: primaryColor }
                    : { backgroundColor: '#1d1d37', color: primaryColor, borderColor: '#23233f' }
                }
              >
                {g}학년
                {!available && (
                  <span
                    className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 py-px"
                    style={{ backgroundColor: '#23233f', color: '#64748b', borderRadius: '2px' }}
                  >
                    준비중
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-[10px] mt-3 text-[#ff716c]">⚠️ 학년 변경 시 현재 학년의 기록은 초기화됩니다.</p>
      </div>

      {/* 난이도 설정 */}
      <div>
        <div className="flex items-center gap-2 mb-4 relative">
          <p className="text-xs font-bold" style={{ color: primaryColor }}>미션 난이도 설정</p>
          <button onClick={() => setShowDifficultyTooltip(!showDifficultyTooltip)} className="w-4 h-4 rounded-full border border-[#64748b] text-[10px] text-[#64748b]">?</button>
          {showDifficultyTooltip && (
            <div className="absolute top-8 left-0 z-20 w-64 p-3 border-2 border-[#23233f] bg-[#1d1d37]">
              <p className="text-[11px] font-bold mb-1" style={{ color: primaryColor }}>✨ 자동 성장 모드: 시스템이 최적의 난이도를 조절합니다.</p>
              <p className="text-[11px] font-bold mt-2" style={{ color: '#fff' }}>🔒 수동 고정 모드: 선택한 난이도만 노출됩니다.</p>
            </div>
          )}
        </div>
        <button
          onClick={async () => await userProfileRepo.update({ difficultyMode: 'auto' })}
          className="w-full py-3 mb-3 text-sm font-bold border-2"
          style={{ backgroundColor: profile.difficultyMode === 'auto' ? primaryColor : 'transparent', color: profile.difficultyMode === 'auto' ? '#000' : primaryColor, borderColor: primaryColor }}
        >
          {profile.difficultyMode === 'auto' ? '✨ 자동 성장 모드 작동 중' : '자동 성장 모드로 전환하기'}
        </button>
        <div className="flex gap-2">
          {(['basic', 'applied', 'challenge'] as const).map(d => (
            <button
              key={d}
              onClick={async () => await userProfileRepo.update({ unlockedDifficulty: d, difficultyMode: 'manual' })}
              className="flex-1 py-2.5 text-xs font-bold border-2"
              style={{ backgroundColor: profile.difficultyMode === 'manual' && profile.unlockedDifficulty === d ? '#fff' : 'transparent', color: profile.difficultyMode === 'manual' && profile.unlockedDifficulty === d ? '#000' : '#64748b', borderColor: '#23233f' }}
            >
              {d === 'basic' ? '기초' : d === 'applied' ? '실력' : '심화'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
