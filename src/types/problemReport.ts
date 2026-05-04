export type ReportType = 'wrong_answer' | 'wrong_question'
export type ReportStatus = 'pending' | 'fixed' | 'dismissed'

export interface ProblemReport {
  reportId: string
  userId: string
  problemId: string
  problemUnit: string
  reportType: ReportType
  userAnswer: string
  correctAnswer: string
  timestamp: number
  status: ReportStatus
}
