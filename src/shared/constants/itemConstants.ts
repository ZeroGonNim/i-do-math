import type { Item } from '@/types/item'

export const RARITY_COLOR: Record<Item['rarity'], string> = {
  common: '#a8a29e',
  rare:   '#60a5fa',
  epic:   '#8b5cf6',
  legend: '#f59e0b',
}

export const RARITY_LABEL: Record<Item['rarity'], string> = {
  common: '커먼',
  rare:   '레어',
  epic:   '에픽',
  legend: '레전드',
}

export const SLOT_LABEL: Record<string, string> = {
  hat:    '모자',
  weapon: '무기',
  armor:  '갑옷',
  pet:    '펫',
}
