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

export type AnswerType =
  | 'fraction'
  | 'integer'
  | 'multiple_choice'
  | 'symbol'
  | 'multi_blank'
  | 'text'
  | 'draw'

export interface FractionAnswer {
  numerator: number
  denominator: number
}

export interface IntegerAnswer {
  value: number
}

export interface MultipleChoiceAnswer {
  choice: number // 1~5
}

export interface SymbolAnswer {
  symbol: '>' | '=' | '<'
}

export interface MultiBlankAnswer {
  values: number[]
  labels?: string[] // 각 빈칸 레이블 (예: ["만이", "일이"])
}

export interface TextAnswer {
  text: string
}

export interface DrawAnswer {
  referenceImage: string // 정답 이미지 경로 (해설지에서 추출)
}

export type Answer =
  | FractionAnswer
  | IntegerAnswer
  | MultipleChoiceAnswer
  | SymbolAnswer
  | MultiBlankAnswer
  | TextAnswer
  | DrawAnswer

export function isIntegerAnswer(a: Answer): a is IntegerAnswer {
  return 'value' in a
}

export function isFractionAnswer(a: Answer): a is FractionAnswer {
  return 'numerator' in a
}

export function isMultipleChoiceAnswer(a: Answer): a is MultipleChoiceAnswer {
  return 'choice' in a
}

export function isSymbolAnswer(a: Answer): a is SymbolAnswer {
  return 'symbol' in a
}

export function isMultiBlankAnswer(a: Answer): a is MultiBlankAnswer {
  return 'values' in a
}

export function isTextAnswer(a: Answer): a is TextAnswer {
  return 'text' in a
}

export function isDrawAnswer(a: Answer): a is DrawAnswer {
  return 'referenceImage' in a
}

export interface ProblemStep {
  desc: string
  expression: string
  narrative?: string
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
  questionImage?: string   // 문제 본문에 표시할 이미지 (워크시트 문제 이미지 등)
  choices?: string[]       // multiple_choice 텍스트 선택지
  choiceImages?: string[]  // multiple_choice 이미지 선택지 (텍스트 대신 이미지로 표시)
  answerType?: AnswerType  // 생략 시 'fraction'으로 간주
  answer: Answer
  steps: ProblemStep[]
  animationAsset: string
  conceptExplanation: string
  answerUnit?: string      // 답의 단위 (예: "개", "원", "분", "°")
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
