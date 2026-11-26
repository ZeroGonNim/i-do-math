import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'
import { AppProviders } from './app/providers/AppProviders'

// Recharts v3 ResponsiveContainer가 초기 측정 전 width(-1) 경고를 발생시키는 알려진 이슈.
// 실제 렌더링엔 영향 없으므로 dev 모드에서만 해당 경고를 필터링.
if (import.meta.env.DEV) {
  const originalWarn = console.warn
  console.warn = (...args: unknown[]) => {
    const first = args[0]
    if (typeof first === 'string' && first.includes('width(-1) and height(-1)')) return
    originalWarn(...args)
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
