import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    navigate('/')
  }

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg-primary/85 backdrop-blur-xl shadow-sm shadow-black/5 py-2.5' : 'py-4'}`} id="navbar">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 font-extrabold text-xl z-[1001]" id="logo-link">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GhostHire</span>
        </a>

        {/* Desktop Nav Links */}
        <div className={`hidden md:flex items-center gap-1`}>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="px-3.5 py-2 text-sm font-medium text-text-secondary rounded-lg hover:text-text-primary hover:bg-black/5 transition-all duration-150">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="px-5 py-2 text-sm font-semibold text-text-primary bg-black/5 border border-black/10 rounded-xl hover:bg-black/5 hover:border-primary/40 transition-all duration-300">
                Dashboard
              </button>
              <button onClick={handleLogout} className="px-5 py-2 text-sm font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,92,231,0.4)] transition-all duration-300">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/signin')} className="px-5 py-2 text-sm font-semibold text-text-primary bg-black/5 border border-black/10 rounded-xl hover:bg-black/5 hover:border-primary/40 transition-all duration-300" id="signin-btn">
                Sign In
              </button>
              <button onClick={() => navigate('/signup')} className="px-5 py-2 text-sm font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,92,231,0.4)] transition-all duration-300 flex items-center gap-1.5" id="try-free-btn">
                <Sparkles size={15} /> Try Free
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-text-primary z-[1001]" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" id="menu-toggle">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-bg-primary z-[1000] flex flex-col items-center justify-center gap-4 md:hidden">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="text-xl font-medium text-text-secondary hover:text-text-primary py-3 px-6 transition-colors">
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-6 w-60">
              {isLoggedIn ? (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/dashboard'); }} className="w-full py-3 text-sm font-semibold text-text-primary bg-black/5 border border-black/10 rounded-xl">Dashboard</button>
                  <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full py-3 text-sm font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-xl">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/signin'); }} className="w-full py-3 text-sm font-semibold text-text-primary bg-black/5 border border-black/10 rounded-xl">Sign In</button>
                  <button onClick={() => { setMenuOpen(false); navigate('/signup'); }} className="w-full py-3 text-sm font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-xl">Try Free</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
