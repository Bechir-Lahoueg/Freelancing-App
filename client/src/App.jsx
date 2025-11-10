import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NewHome from './pages/NewHome'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import NewTask from './pages/NewTask'
import TaskHistory from './pages/TaskHistory'
import Profile from './pages/Profile'
import AuthSuccess from './pages/AuthSuccess'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<NewHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

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
        <Route path="/new-task" element={
          <PrivateRoute>
            <NewTask />
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute>
            <TaskHistory />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App