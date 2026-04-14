import type { MistakeType, Answer } from './problem'

export interface WrongNote {
  id: string               // `${userId}::${concept}::${mistakeType}`
  userId: string
  concept: string
  mistakeType: MistakeType
  wrongCount: number
  consecutiveWrong: number
  consecutiveCorrect: number
  isWeak: boolean
  problemId?: string       // 가장 최근 틀린 문제 ID (정확한 재도전용)
  questionText: string     // 오답 당시의 문제 지문
  correctAnswer: Answer    // 실제 정답
  lastWrongAnswer: Answer
  replayData: { inputSequence: string[] }
  lastAttemptAt: number
  drawingData?: string     // 가장 최근 오답 시 사용자가 그린 이미지 (Base64)
}
