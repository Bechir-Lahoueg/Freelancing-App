import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoadingPage from './components/LoadingPage'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Categories from './pages/Categories'
import Services from './pages/Services'
import ServiceRequest from './pages/ServiceRequest'
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
        <Route path="/categories" element={<Categories />} />
        <Route path="/services" element={<Services />} />
        <Route path="/service-request" element={
          <PrivateRoute>
            <ServiceRequest />
          </PrivateRoute>
        } />

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