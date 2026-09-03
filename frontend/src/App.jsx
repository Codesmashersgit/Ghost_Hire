import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Overlay from './pages/Overlay'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import AdminDashboard from './pages/AdminDashboard'
import MicOverlay from './pages/MicOverlay'

function App() {
  console.log('App component rendering');
  
  if (window.location.href.includes('mic-overlay')) {
    return <MicOverlay />;
  }
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
