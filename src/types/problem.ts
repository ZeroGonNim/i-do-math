export type Difficulty = 'basic' | 'applied' | 'challenge'
export type ProblemType = 'calculation' | 'concept'
export type MistakeType =
  | 'denominator_error'
  | 'numerator_error'
  | 'concept_error'
  | 'precision_error'
  | 'guess_error'
  | 'hint_dependent_error'
  | 'calculation_error'
  | null

export type AnswerType = 'fraction' | 'integer'

export interface FractionAnswer {
  numerator: number
  denominator: number
}

export interface IntegerAnswer {
  value: number
}

export type Answer = FractionAnswer | IntegerAnswer

export function isIntegerAnswer(a: Answer): a is IntegerAnswer {
  return 'value' in a
}

export function isFractionAnswer(a: Answer): a is FractionAnswer {
  return 'numerator' in a
}

export interface ProblemStep {
  desc: string
  expression: string
  narrative?: string  // "피자 한 판 8조각 중 처음 먹은 3조각" 형태의 스토리 연결 문장
}

export interface Problem {
  id: string
  grade: number
  semester: number
  unit: string
  subUnit: string
  type: ProblemType
  difficulty: Difficulty
  concept: string
  skills: string[]
  mistakeTypes: MistakeType[]
  question: string
  answerType?: AnswerType  // 생략 시 'fraction'으로 간주
  answer: Answer
  steps: ProblemStep[]
  animationAsset: string
  conceptExplanation: string
}

export interface ProblemTemplate {
  templateId: string
  grade: number
  semester: number
  unit: string
  type: ProblemType
  difficulty: Difficulty
  concept: string
  skills: string[]
  mistakeTypes: MistakeType[]
  template: string
  variables: Record<string, number[]>
  constraints: string[]
  animationAsset: string
  conceptExplanation: string
}

export type ProblemData = Problem | ProblemTemplate

export function isProblemTemplate(p: ProblemData): p is ProblemTemplate {
  return 'templateId' in p
}
