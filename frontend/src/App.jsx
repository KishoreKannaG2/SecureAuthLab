import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage      from './pages/LoginPage.jsx'
import DashboardPage  from './pages/DashboardPage.jsx'
import AttackPage     from './pages/AttackPage.jsx'
import SecurityPage   from './pages/SecurityPage.jsx'
import LogsPage       from './pages/LogsPage.jsx'
import SampleDataPage from './pages/SampleDataPage.jsx'
import Layout         from './components/Layout.jsx'

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index              element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="attack"      element={<AttackPage />} />
          <Route path="security"    element={<SecurityPage />} />
          <Route path="logs"        element={<LogsPage />} />
          <Route path="sample-data"  element={<SampleDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
