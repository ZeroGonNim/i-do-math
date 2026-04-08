export type BoxType = 'normal' | 'levelup' | 'legend'

export interface UserBox {
  boxId?: number        // Dexie auto-increment (++boxId)
  userId: string
  boxType: BoxType
  acquiredAt: number
  openedAt?: number
  isOpened: boolean
  drawnItemId?: string  // 추첨 완료 후 저장 (null이면 미추첨)
}
