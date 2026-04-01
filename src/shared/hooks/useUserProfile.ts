import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/db/db'

export function useUserProfile() {
  return useLiveQuery(() => db.userProfile.toCollection().first())
}
