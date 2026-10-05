import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Maintenance from './pages/Maintenance'
import Requests from './pages/Requests'
import RequestDetail from './pages/RequestDetail'
import AdminRequests from './pages/AdminRequests'
import AdminRequestDetail from './pages/AdminRequestDetail'
import History from './pages/History'

function HomeRedirect() {
  const user = localStorage.getItem('user')
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Pages with common Layout (Header + Sidebar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:request_id" element={<RequestDetail />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/requests/:request_id" element={<AdminRequestDetail />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App