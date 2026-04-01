import { db } from './db'

export const templateCounterRepo = {
  async getCount(userId: string, templateId: string): Promise<number> {
    const key = `${userId}::${templateId}`
    const record = await db.templateCounters.get(key)
    return record?.count ?? 0
  },
  async increment(userId: string, templateId: string): Promise<number> {
    const key = `${userId}::${templateId}`
    const existing = await db.templateCounters.get(key)
    const newCount = (existing?.count ?? 0) + 1
    await db.templateCounters.put({ key, count: newCount })
    return newCount
  },
}
