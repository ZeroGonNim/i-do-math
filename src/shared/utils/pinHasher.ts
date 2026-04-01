function simpleFallbackHash(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  if (!crypto?.subtle) {
    return simpleFallbackHash(salt + pin)
  }
  const encoder = new TextEncoder()
  const data = encoder.encode(salt + pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPin(pin: string, salt: string, hash: string): Promise<boolean> {
  const computed = await hashPin(pin, salt)
  return computed === hash
}
