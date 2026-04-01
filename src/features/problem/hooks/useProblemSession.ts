import { useState, useRef, useEffect } from 'react'
import type { Problem, Answer } from '@/types/problem'

export function useProblemSession(problem: Problem) {
  const answerType = problem.answerType ?? 'fraction'

  // 분수 입력 상태
  const [numerator, setNumerator] = useState('')
  const [denominator, setDenominator] = useState('')
  const [activeField, setActiveField] = useState<'numerator' | 'denominator'>('numerator')

  // 정수 입력 상태
  const [intValue, setIntValue] = useState('')

  const [hintUsed, setHintUsed] = useState(false)
  const [inputSequence, setInputSequence] = useState<string[]>([])
  const startTime = useRef(Date.now())

  useEffect(() => {
    startTime.current = Date.now()
    setNumerator('')
    setDenominator('')
    setActiveField('numerator')
    setIntValue('')
    setHintUsed(false)
    setInputSequence([])
  }, [problem.id])

  function handleKeyPress(key: string) {
    setInputSequence(prev => [...prev, key])

    if (answerType === 'integer') {
      if (key === 'del') {
        setIntValue(v => v.slice(0, -1))
      } else if (key === '00') {
        setIntValue(v => (v.length >= 4 ? v : v + '00'))
      } else {
        setIntValue(v => (v.length >= 6 ? v : v + key))
      }
      return
    }

    // 분수 모드
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
      setNumerator(n => {
        if (n.length >= 3) return n
        const next = n + key
        if (next.length === 1) setActiveField('denominator')
        return next
      })
    } else {
      setDenominator(d => (d.length >= 3 ? d : d + key))
    }
  }

  function getAnswer(): Answer | null {
    if (answerType === 'integer') {
      const v = parseInt(intValue)
      if (isNaN(v)) return null
      return { value: v }
    }
    const n = parseInt(numerator)
    const d = parseInt(denominator)
    if (isNaN(n) || isNaN(d) || d === 0) return null
    return { numerator: n, denominator: d }
  }

  function getTimeSpent(): number {
    return Math.round((Date.now() - startTime.current) / 1000)
  }

  const isReady =
    answerType === 'integer'
      ? intValue.length > 0
      : numerator.length > 0 && denominator.length > 0

  return {
    answerType,
    numerator,
    denominator,
    activeField,
    setActiveField,
    intValue,
    hintUsed,
    setHintUsed,
    handleKeyPress,
    getAnswer,
    getTimeSpent,
    isReady,
    inputSequence,
  }
}
