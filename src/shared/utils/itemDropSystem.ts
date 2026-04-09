const DROP_RATE = 0.2
const PITTY_THRESHOLD = 10

export function shouldDropBox(pittyCount: number): boolean {
  if (pittyCount >= PITTY_THRESHOLD) return true
  return Math.random() < DROP_RATE
}

export function rollItemRarity(): 'common' | 'rare' | 'epic' | 'legend' {
  const roll = Math.random()
  if (roll < 0.5)  return 'common'
  if (roll < 0.8)  return 'rare'
  if (roll < 0.95) return 'epic'
  return 'legend'
}
