import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ensureAnonSession } from '../supabase'

interface MockAuth {
  getSession: ReturnType<typeof vi.fn>
  signInAnonymously: ReturnType<typeof vi.fn>
}

function createMockClient(): { client: SupabaseClient; auth: MockAuth } {
  const auth: MockAuth = {
    getSession: vi.fn(),
    signInAnonymously: vi.fn(),
  }
  return { client: { auth } as unknown as SupabaseClient, auth }
}

describe('ensureAnonSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when client is null', async () => {
    expect(await ensureAnonSession(null)).toBeNull()
  })

  it('returns existing session user.id when session exists', async () => {
    const { client, auth } = createMockClient()
    auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'existing-uid' } } },
    })

    const result = await ensureAnonSession(client)

    expect(result).toBe('existing-uid')
    expect(auth.signInAnonymously).not.toHaveBeenCalled()
  })

  it('signs in anonymously and returns new user.id when no session', async () => {
    const { client, auth } = createMockClient()
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously.mockResolvedValue({
      data: { user: { id: 'new-anon-uid' } },
      error: null,
    })

    const result = await ensureAnonSession(client)

    expect(result).toBe('new-anon-uid')
    expect(auth.signInAnonymously).toHaveBeenCalledTimes(1)
  })

  it('returns null when signInAnonymously fails', async () => {
    const { client, auth } = createMockClient()
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously.mockResolvedValue({
      data: { user: null },
      error: { message: 'rate limited' },
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await ensureAnonSession(client)

    expect(result).toBeNull()
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('returns null when sign-in succeeds but user is missing', async () => {
    const { client, auth } = createMockClient()
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const result = await ensureAnonSession(client)

    expect(result).toBeNull()
  })
})
