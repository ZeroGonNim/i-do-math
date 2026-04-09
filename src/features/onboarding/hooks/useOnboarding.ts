import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { generateUUID } from '@/shared/utils/uuid'
import type { AvatarId } from '@/types/avatar'

export function useOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<number>(4)
  const [avatarId, setAvatarId] = useState<AvatarId>('warrior')

  async function complete() {
    try {
      const today = new Date().toISOString().split('T')[0]
      await userProfileRepo.save({
        userId: generateUUID(),
        displayName: name.trim(),
        grade,
        characterId: 'char-01',  // @deprecated, kept for DB compat
        avatarId,
        unlockedAvatars: ['warrior'],
        level: 1,
        totalStars: 0,
        totalXP: 0,
        noDropStreak: 0,
        boxCount: 0,
        pittyCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: today,
        parentalPinHash: null,
        parentalPinSalt: null,
        createdAt: Date.now(),
        missionDate: today,
        missionProblemsSolved: 0,
        missionWrongReviewed: false,
        unlockedDifficulty: 'basic',
      })
      navigate('/home', { replace: true })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      alert('시작하는 중에 문제가 생겼어. 다시 한번 눌러봐!')
    }
  }

  return {
    step,
    setStep,
    name,
    setName,
    grade,
    setGrade,
    avatarId,
    setAvatarId,
    complete,
  }
}
