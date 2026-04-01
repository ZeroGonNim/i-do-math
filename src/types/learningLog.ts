import type { MistakeType, Answer } from './problem'

export interface LearningLog {
  logId: string
  userId: string
  grade: number
  problemId: string
  concept: string
  mistakeType: MistakeType
  isCorrect: boolean
  userAnswer: Answer
  timeSpent: number
  hintUsed: boolean
  retryCount: number
  timestamp: number
}
