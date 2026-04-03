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
        <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 bg-white">
          <div className="text-5xl">😵</div>
          <h2 className="text-xl font-bold text-gray-800">앗, 문제가 생겼어요!</h2>
          <p className="text-sm text-gray-500 text-center">{this.state.message}</p>
          <button
            onClick={this.handleRetry}
            className="mt-2 min-h-[48px] w-full max-w-xs rounded-2xl bg-indigo-500 text-white font-bold"
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
