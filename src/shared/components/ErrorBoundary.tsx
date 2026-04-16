import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.'
    return { hasError: true, message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 p-6"
             style={{ backgroundColor: '#0f172a' }}>
          <div className="text-5xl">😵</div>
          <h2 className="text-xl font-bold" style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>앗, 문제가 생겼어요!</h2>
          <p className="text-sm text-center" style={{ color: '#aaa8c3' }}>{this.state.message}</p>
          <div className="mt-2 w-full max-w-xs" style={{ backgroundColor: '#005762' }}>
            <button
              onClick={this.handleRetry}
              className="w-full min-h-[48px] font-bold -translate-y-1"
              style={{ backgroundColor: '#38bdf8', color: '#0f172a', fontFamily: 'var(--font-game)', border: '2px solid #005762' }}
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
