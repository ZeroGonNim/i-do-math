import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isDev = import.meta.env.DEV
const isValidConfig = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10

/**
 * Supabase 클라이언트.
 * 개발 모드 또는 설정 누락 시 null. 호출부는 반드시 null-체크 필요.
 */
export const supabase: SupabaseClient | null = (isValidConfig && !isDev)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

export const isSupabaseConfigured = (): boolean => {
  if (isDev) return false
  if (!isValidConfig) {
    console.warn('Supabase configuration is missing. Sync disabled.')
    return false
  }
  return true
}

/**
 * 익명 세션 보장. 세션이 있으면 그 user.id, 없으면 signInAnonymously 호출 후 user.id 반환.
 * 클라이언트가 없거나 로그인 실패 시 null.
 *
 * RLS 정책이 auth.uid() = user_id 형태라 cloud sync 직전에 호출해 세션을 보장한다.
 *
 * @param client 의존성 주입용 (테스트에서 모킹). 기본값 = 모듈 레벨 supabase
 */
export async function ensureAnonSession(
  client: SupabaseClient | null = supabase,
): Promise<string | null> {
  if (!client) return null

  const { data: sessionData } = await client.auth.getSession()
  if (sessionData.session) {
    return sessionData.session.user.id
  }

  const { data, error } = await client.auth.signInAnonymously()
  if (error) {
    console.error('Anonymous sign-in failed:', error.message)
    return null
  }
  return data.user?.id ?? null
}
