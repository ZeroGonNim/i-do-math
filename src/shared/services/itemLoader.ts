import type { Item } from '@/types/item'

let cache: Item[] | null = null

export async function loadItems(): Promise<Item[]> {
  if (cache) return cache
  const res = await fetch(`${import.meta.env.BASE_URL}data/items.json`)
  if (!res.ok) throw new Error('아이템 데이터를 불러올 수 없어요')
  cache = (await res.json()) as Item[]
  return cache
}

export function pickRandomItem(items: Item[], rarity: Item['rarity']): Item {
  if (items.length === 0) throw new Error('아이템 목록이 비어있어요')

  const pool = items.filter(i => i.rarity === rarity)
  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // 요청한 등급의 아이템이 없는 경우 전체 목록에서 랜덤 선택 (방어 코드)
  return items[Math.floor(Math.random() * items.length)]
}
