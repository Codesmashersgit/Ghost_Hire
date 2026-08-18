import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Overlay from './pages/Overlay'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  console.log('App component rendering');
  
  // Directly render Overlay if URL indicates it (bypasses BrowserRouter issues in Electron file:// protocol)
  if (window.location.href.includes('overlay')) {
    return <Overlay />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
