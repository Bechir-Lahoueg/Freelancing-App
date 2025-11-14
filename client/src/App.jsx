import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoadingPage from './components/LoadingPage'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import AdminDashboard from './pages/AdminDashboard'
import PrivateRoute from './components/PrivateRoute'
import { usePageLoading } from './hooks/usePageLoading'
import Partner from './pages/Partner'

function AppContent() {
  const isPageLoading = usePageLoading();

  return (
    <>
      {isPageLoading && <LoadingPage />}
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/tasks" element={<Tasks />} />

        {/* Routes privées */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/dashboard" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App