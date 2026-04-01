import type { MistakeType, FractionAnswer } from './problem'

export interface LearningLog {
  logId: string
  userId: string
  grade: number
  problemId: string
  concept: string
  mistakeType: MistakeType
  isCorrect: boolean
  userAnswer: FractionAnswer
  timeSpent: number
  hintUsed: boolean
  retryCount: number
  timestamp: number
}
