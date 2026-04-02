import { useState, useRef, useEffect } from 'react'
import type { Problem, Answer, AnswerType } from '@/types/problem'

export function useProblemSession(problem: Problem) {
  const answerType: AnswerType = problem.answerType ?? 'fraction'

  // 분수 입력
  const [numerator, setNumerator] = useState('')
  const [denominator, setDenominator] = useState('')
  const [activeField, setActiveField] = useState<'numerator' | 'denominator'>('numerator')

  // 정수 입력
  const [intValue, setIntValue] = useState('')

  // 객관식 입력
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)

  // 부등호 입력
  const [selectedSymbol, setSelectedSymbol] = useState<'>' | '=' | '<' | null>(null)

  // 다중 빈칸 입력
  const blankCount = answerType === 'multi_blank'
    ? (problem.answer as { values: number[] }).values?.length ?? 2
    : 0
  const [blankValues, setBlankValues] = useState<string[]>(() => Array(blankCount).fill(''))
  const [activeBlankIndex, setActiveBlankIndex] = useState(0)

  const [hintUsed, setHintUsed] = useState(false)
  const [inputSequence, setInputSequence] = useState<string[]>([])
  const startTime = useRef(Date.now())

  useEffect(() => {
    startTime.current = Date.now()
    setNumerator('')
    setDenominator('')
    setActiveField('numerator')
    setIntValue('')
    setSelectedChoice(null)
    setSelectedSymbol(null)
    setBlankValues(Array(blankCount).fill(''))
    setActiveBlankIndex(0)
    setHintUsed(false)
    setInputSequence([])
  }, [problem.id, blankCount])

  function handleKeyPress(key: string) {
    setInputSequence(prev => [...prev, key])

    if (answerType === 'integer') {
      if (key === 'del') {
        setIntValue(v => v.slice(0, -1))
      } else if (key === '00') {
        setIntValue(v => (v.length >= 13 ? v : v + '00'))
      } else {
        setIntValue(v => (v.length >= 13 ? v : v + key))
      }
      return
    }

    if (answerType === 'multi_blank') {
      setBlankValues(prev => {
        const next = [...prev]
        if (key === 'del') {
          next[activeBlankIndex] = next[activeBlankIndex].slice(0, -1)
        } else if (key === '00') {
          next[activeBlankIndex] = next[activeBlankIndex].length >= 8
            ? next[activeBlankIndex]
            : next[activeBlankIndex] + '00'
        } else {
          if (next[activeBlankIndex].length < 10) {
            next[activeBlankIndex] = next[activeBlankIndex] + key
            // 숫자 입력 후 자동으로 다음 빈칸으로 이동 (한 자리 입력 시)
            if (next[activeBlankIndex].length === 1 && activeBlankIndex < blankCount - 1) {
              setActiveBlankIndex(i => i + 1)
            }
          }
        }
        return next
      })
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

    if (answerType === 'multiple_choice') {
      if (selectedChoice === null) return null
      return { choice: selectedChoice }
    }

    if (answerType === 'symbol') {
      if (selectedSymbol === null) return null
      return { symbol: selectedSymbol }
    }

    if (answerType === 'multi_blank') {
      const values = blankValues.map(v => parseInt(v))
      if (values.some(isNaN)) return null
      return { values }
    }

    if (answerType === 'draw' || answerType === 'text') {
      // draw는 DrawProblem 컴포넌트에서 직접 처리
      return null
    }

    // 분수
    const n = parseInt(numerator)
    const d = parseInt(denominator)
    if (isNaN(n) || isNaN(d) || d === 0) return null
    return { numerator: n, denominator: d }
  }

  function getTimeSpent(): number {
    return Math.round((Date.now() - startTime.current) / 1000)
  }

  const isReady = (() => {
    if (answerType === 'integer') return intValue.length > 0
    if (answerType === 'multiple_choice') return selectedChoice !== null
    if (answerType === 'symbol') return selectedSymbol !== null
    if (answerType === 'multi_blank') return blankValues.every(v => v.length > 0)
    if (answerType === 'draw' || answerType === 'text') return false // DrawProblem이 직접 처리
    return numerator.length > 0 && denominator.length > 0
  })()

  return {
    answerType,
    // 분수
    numerator,
    denominator,
    activeField,
    setActiveField,
    // 정수
    intValue,
    // 객관식
    selectedChoice,
    setSelectedChoice,
    // 부등호
    selectedSymbol,
    setSelectedSymbol,
    // 다중 빈칸
    blankValues,
    activeBlankIndex,
    setActiveBlankIndex,
    // 공통
    hintUsed,
    setHintUsed,
    handleKeyPress,
    getAnswer,
    getTimeSpent,
    isReady,
    inputSequence,
  }
}
