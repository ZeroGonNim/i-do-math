import { useUserProfile } from './useUserProfile'

export function useTheme() {
  const profile = useUserProfile()
  
  // 학기별 테마 컬러 정의 (Refined Palette)
  const colors = {
    1: {
      primary: '#10b981',    // 소프트 에메랄드
      bg: '#0f172a',         // 딥 네이비
      accent: '#38bdf8',     // 스카이 블루
    },
    2: {
      primary: '#8b5cf6',    // 더 차분해진 소프트 퍼플
      bg: '#0f172a',
      accent: '#38bdf8',
    }
  }

  const semester = profile?.currentSemester === 2 ? 2 : 1
  return colors[semester]
}
