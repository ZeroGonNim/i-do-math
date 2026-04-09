import type { AvatarId } from './avatar'

export type ItemSlot = 'hat' | 'weapon' | 'armor' | 'pet'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legend'

export interface Item {
  id: string
  name: string
  slot: ItemSlot
  rarity: ItemRarity
  description: string
  avatarId: AvatarId          // 어떤 아바타의 아이템인지
  imagePath: string           // e.g. '/images/items/warrior-hat-common.png'
  emoji?: string              // 이미지 로딩 실패 시 폴백용
}

export interface UserItem {
  id: string
  userId: string
  itemId: string
  obtainedAt: number
}

export interface EquippedItems {
  userId: string
  hat: string | null
  weapon: string | null
  armor: string | null
  pet: string | null
}
