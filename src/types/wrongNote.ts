import type { MistakeType, FractionAnswer } from './problem'

export interface WrongNote {
  id: string               // `${userId}::${concept}::${mistakeType}`
  userId: string
  concept: string
  mistakeType: MistakeType
  wrongCount: number
  consecutiveWrong: number
  consecutiveCorrect: number
  isWeak: boolean
  lastWrongAnswer: FractionAnswer
  replayData: { inputSequence: string[] }
  lastAttemptAt: number
}
