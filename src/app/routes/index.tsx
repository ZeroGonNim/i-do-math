import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userProfileRepo } from '@/shared/db/userProfileRepo'

export function IndexRoute() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    userProfileRepo.get().then(profile => {
      navigate(profile ? '/home' : '/onboarding', { replace: true })
      setChecking(false)
    })
  }, [navigate])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        로딩 중...
      </div>
    )
  }
  return null
}
