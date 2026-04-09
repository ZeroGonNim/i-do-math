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
  lastWrongAnswer: Answer
  replayData: { inputSequence: string[] }
  lastAttemptAt: number
  drawingData?: string     // 가장 최근 오답 시 사용자가 그린 이미지 (Base64)
}
