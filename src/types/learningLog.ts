import type { MistakeType, Answer, Difficulty } from './problem'

export interface LearningLog {
  logId: string
  userId: string
  grade: number
  semester: 1 | 2
  problemId: string
  concept: string
  difficulty: Difficulty // 난이도 필드 추가
  mistakeType: MistakeType
  isCorrect: boolean
  userAnswer: Answer
  timeSpent: number
  hintUsed: boolean
  retryCount: number
  timestamp: number
  drawingData?: string // 그리기 문제의 경우 사용자가 그린 이미지 (Base64)
}
