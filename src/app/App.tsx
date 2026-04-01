import { Routes, Route } from 'react-router-dom'
import { IndexRoute } from './routes/index'
import { OnboardingRoute } from './routes/onboarding'
import { HomeRoute } from './routes/home'
import { ProblemRoute } from './routes/problem'
import { ResultRoute } from './routes/result'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexRoute />} />
      <Route path="/onboarding" element={<OnboardingRoute />} />
      <Route path="/home" element={<HomeRoute />} />
      <Route path="/problem" element={<ProblemRoute />} />
      <Route path="/result" element={<ResultRoute />} />
    </Routes>
  )
}
