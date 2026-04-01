import { useState, useRef, useEffect } from 'react'
import type { Problem, FractionAnswer } from '@/types/problem'

export function useProblemSession(problem: Problem) {
  const [numerator, setNumerator] = useState('')
  const [denominator, setDenominator] = useState('')
  const [activeField, setActiveField] = useState<'numerator' | 'denominator'>('numerator')
  const [hintUsed, setHintUsed] = useState(false)
  const [inputSequence, setInputSequence] = useState<string[]>([])
  const startTime = useRef(Date.now())

  useEffect(() => {
    startTime.current = Date.now()
    setNumerator('')
    setDenominator('')
    setActiveField('numerator')
    setHintUsed(false)
    setInputSequence([])
  }, [problem.id])

  function handleKeyPress(key: string) {
    setInputSequence(prev => [...prev, key])
    if (key === 'del') {
      if (activeField === 'numerator') setNumerator(n => n.slice(0, -1))
      else setDenominator(d => d.slice(0, -1))
      return
    }
    if (key === '/') {
      setActiveField('denominator')
      return
    }
    if (activeField === 'numerator') {
      setNumerator(n => (n.length >= 3 ? n : n + key))
    } else {
      setDenominator(d => (d.length >= 3 ? d : d + key))
    }
  }

  function getAnswer(): FractionAnswer | null {
    const n = parseInt(numerator)
    const d = parseInt(denominator)
    if (isNaN(n) || isNaN(d) || d === 0) return null
    return { numerator: n, denominator: d }
  }

  function getTimeSpent(): number {
    return Math.round((Date.now() - startTime.current) / 1000)
  }

  const isReady = numerator.length > 0 && denominator.length > 0

  return {
    numerator,
    denominator,
    activeField,
    setActiveField,
    hintUsed,
    setHintUsed,
    handleKeyPress,
    getAnswer,
    getTimeSpent,
    isReady,
    inputSequence,
  }
}
