import { useEffect, useState, lazy, Suspense } from 'react'
const Lottie = lazy(() => import('lottie-react'))

interface Props {
  asset: string      // e.g. "fraction-pizza-add"
  className?: string
}

const EMOJI_FALLBACK: Record<string, string> = {
  'fraction-pizza-add':  '🍕',
  'fraction-bar-add':    '📏',
  'fraction-clock-add':  '⏰',
  'fraction-water-sub':  '💧',
  'fraction-bar-sub':    '✂️',
}

export function AnimationPlayer({ asset, className = '' }: Props) {
  const [animData, setAnimData] = useState<object | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setAnimData(null)
    setFailed(false)
    const url = `${import.meta.env.BASE_URL}animations/${asset}.json`
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(setAnimData)
      .catch(() => setFailed(true))
  }, [asset])

  if (!failed && animData) {
    return (
      <Suspense fallback={<span className="text-4xl">{EMOJI_FALLBACK[asset] ?? '🔢'}</span>}>
        <Lottie
          animationData={animData}
          loop
          className={className}
        />
      </Suspense>
    )
  }

  const emoji = EMOJI_FALLBACK[asset] ?? '🔢'
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <span className="text-7xl animate-pulse">{emoji}</span>
    </div>
  )
}
