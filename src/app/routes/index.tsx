import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { SplashScreen } from '@/shared/components/SplashScreen'

export function IndexRoute() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const startTime = Date.now()
    
    userProfileRepo.get().then(profile => {
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, 2000 - elapsed) // 최소 2초 노출 보장

      setTimeout(() => {
        navigate(profile ? '/home' : '/onboarding', { replace: true })
        setChecking(false)
      }, delay)
    }).catch(err => {
      console.error('프로필 로드 실패:', err)
      setChecking(false)
      navigate('/onboarding', { replace: true })
    })
  }, [navigate])

  if (checking) {
    return <SplashScreen />
  }
  return null
}
