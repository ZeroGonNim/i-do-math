import { db } from './db'
import type { UserItem } from '@/types/item'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const userItemRepo = {
  async getAll(userId: string): Promise<UserItem[]> {
    return db.userItems.where('userId').equals(userId).sortBy('obtainedAt')
  },

  async add(userId: string, itemId: string): Promise<UserItem> {
    const userItem: UserItem = {
      id: generateId(),
      userId,
      itemId,
      obtainedAt: Date.now(),
    }
    await db.userItems.add(userItem)
    return userItem
  },

  async remove(id: string): Promise<void> {
    await db.userItems.delete(id)
  },
}
