import { db } from './db'
import type { UserProfile } from '@/types/user'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const userProfileRepo = {
  async get(): Promise<UserProfile | undefined> {
    return db.userProfile.toCollection().first()
  },
  async save(profile: UserProfile): Promise<void> {
    await db.userProfile.put(profile)
    
    if (isSupabaseConfigured() && supabase) {
      console.log('☁️ Supabase: 프로필 저장 시도...', profile.userId)
      const { error } = await supabase.from('profiles').upsert({
        id: profile.userId,
        display_name: profile.displayName,
        grade: profile.grade,
        level: profile.level,
        total_stars: profile.totalStars,
        current_streak: profile.currentStreak,
        avatar_id: profile.avatarId,
        last_active: new Date().toISOString()
      })
      if (error) console.error('❌ Supabase 저장 실패:', error.message)
      else console.log('✅ Supabase 저장 완료!')
    }
  },
  async update(changes: Partial<UserProfile>): Promise<void> {
    const profile = await userProfileRepo.get()
    if (!profile) return
    await db.userProfile.update(profile.userId, changes)
    
    if (isSupabaseConfigured() && supabase) {
      const updated = { ...profile, ...changes }
      console.log('☁️ Supabase: 프로필 업데이트 시도...', updated.userId)
      const { error } = await supabase.from('profiles').upsert({
        id: updated.userId,
        display_name: updated.displayName,
        grade: updated.grade,
        level: updated.level,
        total_stars: updated.totalStars,
        current_streak: updated.currentStreak,
        avatar_id: updated.avatarId,
        last_active: new Date().toISOString()
      })
      if (error) console.error('❌ Supabase 업데이트 실패:', error.message)
      else console.log('✅ Supabase 업데이트 완료!')
    }
  },
}
