import { db } from './db'
import type { UserBox, BoxType } from '@/types/userBox'

export const userBoxRepo = {
  async add(data: Omit<UserBox, 'boxId'>): Promise<UserBox> {
    const boxId = await db.userBoxes.add(data as UserBox)
    return { ...data, boxId: boxId as number }
  },

  async getUnopenedCount(userId: string): Promise<number> {
    return db.userBoxes
      .where('userId').equals(userId)
      .and(box => !box.isOpened)
      .count()
  },

  async getOldestUnopened(userId: string): Promise<UserBox | undefined> {
    return db.userBoxes
      .where('userId').equals(userId)
      .and(box => !box.isOpened)
      .sortBy('acquiredAt')
      .then(boxes => boxes[0])
  },

  async markOpened(boxId: number, drawnItemId: string): Promise<void> {
    await db.userBoxes.update(boxId, {
      isOpened: true,
      openedAt: Date.now(),
      drawnItemId,
    })
  },

  /** 추첨은 완료했으나 아직 애니메이션 미완료 박스 (재진입 대응) */
  async getDrawnButNotViewed(userId: string): Promise<UserBox | undefined> {
    const boxes = await db.userBoxes
      .where('userId').equals(userId)
      .and(box => box.isOpened && !!box.drawnItemId)
      .sortBy('openedAt')
    return boxes[0]
  },

  /** 박스 드롭 여부 판단 (20% + 천장 + 버프) */
  shouldDropBox(noDropStreak: number, bonusRate = 0): boolean {
    if (noDropStreak >= 10) return true  // 천장: 연속 10문제 미드롭 → 강제
    return Math.random() < (0.20 + bonusRate)
  },

  /** 레벨업 박스 지급 여부 (5의 배수 레벨 도달 시) */
  isLevelupBoxLevel(prevLevel: number, nextLevel: number): boolean {
    if (nextLevel <= prevLevel) return false
    return Math.floor(nextLevel / 5) > Math.floor(prevLevel / 5)
  },

  /** 박스 타입에 따른 드롭 테이블에서 레어도 추첨 */
  drawRarity(boxType: BoxType): 'common' | 'rare' | 'epic' | 'legend' {
    const rand = Math.random()
    if (boxType === 'legend') {
      return rand < 0.5 ? 'epic' : 'legend'
    }
    if (boxType === 'levelup') {
      if (rand < 0.20) return 'common'
      if (rand < 0.65) return 'rare'
      if (rand < 0.95) return 'epic'
      return 'legend'
    }
    // normal box
    if (rand < 0.50) return 'common'
    if (rand < 0.85) return 'rare'
    if (rand < 0.98) return 'epic'
    return 'legend'
  },
}
