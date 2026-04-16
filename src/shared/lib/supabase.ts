import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 1. 설정값 유효성 검사
// 2. 개발 환경(DEV)인 경우 연동 비활성화 (운영 배포 환경에서만 작동)
const isDev = import.meta.env.DEV
const isValidConfig = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10

/**
 * Supabase 클라이언트 생성
 * 개발 모드이거나 설정이 없으면 가짜 클라이언트를 반환합니다.
 */
export const supabase = (isValidConfig && !isDev)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any)

/**
 * 서비스 작동 여부 판단 가드
 */
export const isSupabaseConfigured = () => {
  if (isDev) {
    // 로컬 개발 중에는 연동 안 함 (콘솔 노이즈 방지)
    return false
  }
  if (!isValidConfig) {
    console.warn('Supabase configuration is missing. Sync disabled.')
    return false
  }
  return true
}
