import { db } from './db'
import type { EquippedItems, ItemSlot } from '@/types/item'

const EMPTY_EQUIPPED: Omit<EquippedItems, 'userId'> = {
  hat: null,
  weapon: null,
  armor: null,
  pet: null,
}

export const equippedItemsRepo = {
  async get(userId: string): Promise<EquippedItems> {
    const record = await db.equippedItems.get(userId)
    return record ?? { userId, ...EMPTY_EQUIPPED }
  },

  async equip(userId: string, slot: ItemSlot, itemId: string): Promise<void> {
    const current = await equippedItemsRepo.get(userId)
    await db.equippedItems.put({ ...current, [slot]: itemId })
  },

  async unequip(userId: string, slot: ItemSlot): Promise<void> {
    const current = await equippedItemsRepo.get(userId)
    await db.equippedItems.put({ ...current, [slot]: null })
  },
}
