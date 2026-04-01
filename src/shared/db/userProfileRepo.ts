import { db } from './db'
import type { UserProfile } from '@/types/user'

export const userProfileRepo = {
  async get(): Promise<UserProfile | undefined> {
    return db.userProfile.toCollection().first()
  },
  async save(profile: UserProfile): Promise<void> {
    await db.userProfile.put(profile)
  },
  async update(changes: Partial<UserProfile>): Promise<void> {
    const profile = await userProfileRepo.get()
    if (!profile) return
    await db.userProfile.update(profile.userId, changes)
  },
}
