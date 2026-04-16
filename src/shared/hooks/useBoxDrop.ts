import { useState, useEffect, useRef } from 'react'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { shouldDropBox } from '@/shared/utils/itemDropSystem'
import { useUserProfile } from '@/shared/hooks/useUserProfile'

interface UseBoxDropResult {
  boxDropped: boolean
}

export function useBoxDrop(isCorrect: boolean): UseBoxDropResult {
  const profile = useUserProfile()
  const [boxDropped, setBoxDropped] = useState(false)
  const hasChecked = useRef(false)

  useEffect(() => {
    // 이미 체크했거나 정답이 아니거나 프로필이 로딩 전이면 대기
    if (hasChecked.current || !isCorrect || !profile) return

    async function processBoxDrop() {
      // 즉시 체크 완료 표시 (레이스 컨디션 방지)
      hasChecked.current = true
      
      const currentPitty = profile?.pittyCount ?? 0
      const dropped = shouldDropBox(currentPitty)

      if (dropped) {
        await userProfileRepo.update({
          boxCount: (profile?.boxCount ?? 0) + 1,
          pittyCount: 0,
        })
        setBoxDropped(true)
      } else {
        await userProfileRepo.update({
          pittyCount: currentPitty + 1,
        })
      }
    }

    processBoxDrop().catch(err => console.error('박스 드롭 처리 오류:', err))
  }, [isCorrect, profile])

  return { boxDropped }
}
