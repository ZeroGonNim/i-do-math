export type Difficulty = 'basic' | 'applied' | 'challenge'
export type ProblemType = 'calculation' | 'concept'
export type MistakeType =
  | 'denominator_error'
  | 'numerator_error'
  | 'concept_error'
  | 'precision_error'
  | 'guess_error'
  | 'hint_dependent_error'
  | null

export interface FractionAnswer {
  numerator: number
  denominator: number
}

export interface ProblemStep {
  desc: string
  expression: string
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
  answer: FractionAnswer
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
