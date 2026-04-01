import { Routes, Route } from 'react-router-dom'
import { IndexRoute } from './routes/index'
import { OnboardingRoute } from './routes/onboarding'
import { HomeRoute } from './routes/home'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexRoute />} />
      <Route path="/onboarding" element={<OnboardingRoute />} />
      <Route path="/home" element={<HomeRoute />} />
    </Routes>
  )
}
