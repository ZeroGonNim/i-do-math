import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import type { CharacterId } from '@/types/user'

export function useOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<number>(4)
  const [characterId, setCharacterId] = useState<CharacterId>('char-01')

  async function complete() {
    const today = new Date().toISOString().split('T')[0]
    await userProfileRepo.save({
      userId: crypto.randomUUID(),
      displayName: name.trim(),
      grade,
      characterId,
      level: 1,
      totalStars: 0,
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
  }

  return {
    step,
    setStep,
    name,
    setName,
    grade,
    setGrade,
    characterId,
    setCharacterId,
    complete,
  }
}
