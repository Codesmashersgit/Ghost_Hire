import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('💥 App Crash:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0f0f0f', color: '#ff4444', minHeight: '100vh' }}>
          <h1 style={{ color: '#fff', marginBottom: '16px' }}>💥 App Crash — Error Found!</h1>
          <pre style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', color: '#ff6b6b', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error?.toString()}
          </pre>
          {this.state.info && (
            <pre style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', color: '#ffa500', marginTop: '16px', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {this.state.info.componentStack}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
