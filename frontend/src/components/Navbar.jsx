import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles, LogOut, ArrowRight } from 'lucide-react'
import { getCookie, removeCookie } from '../utils/storage'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(!!getCookie('token'))
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    removeCookie('token')
    removeCookie('user')
    setIsLoggedIn(false)
    navigate('/')
  }

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Privacy', id: 'privacy' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ]

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-panel !border-x-0 !border-t-0 !rounded-none py-3 shadow-lg' : 'py-5'}`} id="navbar">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between gap-6">
        {/* Logo (Left) */}
        <div className="flex-1 flex justify-start">
          <a href="/" className="flex items-center font-black text-2xl z-[1001] group" id="logo-link">
            <span className="text-primary tracking-tight font-extrabold">GhostHire</span>
          </a>
        </div>

        {/* Desktop Nav Links (Center) */}
        <div className="hidden lg:flex flex-none items-center gap-2 bg-black/[0.02] border border-black/[0.05] rounded-full p-1.5 backdrop-blur-md shadow-sm">
          {navLinks.map((link) => (
            <button key={link.label} onClick={(e) => handleScrollTo(e, link.id)} className="px-5 py-2 text-sm font-bold text-text-secondary rounded-full hover:text-primary hover:bg-primary/10 transition-all duration-200">
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Actions (Right) */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-2.5">
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="px-5 py-2 text-xs font-bold text-text-primary bg-black/[0.04] border border-black/[0.08] rounded-xl hover:bg-black/[0.08] hover:border-primary-light/40 transition-all duration-300">
                Dashboard
              </button>
              <button onClick={handleLogout} className="btn-sheen px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(124,58,237,0.4)] transition-all duration-300 flex items-center gap-1.5">
                Logout <LogOut size={13} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/signin')} className="px-5 py-2 text-xs font-bold text-text-primary bg-black/[0.04] border border-black/[0.08] rounded-xl hover:bg-black/[0.08] hover:border-primary-light/40 transition-all duration-300" id="signin-btn">
                Sign In
              </button>
              <button onClick={() => navigate('/signup')} className="btn-sheen px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(124,58,237,0.4)] transition-all duration-300 flex items-center gap-1.5" id="try-free-btn">
                Try Free <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-text-primary z-[1001] w-9 h-9 bg-black/[0.04] border border-black/[0.08] rounded-lg flex items-center justify-center hover:bg-black/[0.08]" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" id="menu-toggle">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-bg-primary/95 backdrop-blur-2xl z-[1000] flex flex-col items-center justify-center gap-6 md:hidden">
            {navLinks.map((link) => (
              <button key={link.label} onClick={(e) => handleScrollTo(e, link.id)} className="text-lg font-bold text-text-secondary hover:text-text-primary transition-all">
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-3.5 pt-8 w-64">
              {isLoggedIn ? (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/dashboard'); }} className="w-full py-3 text-sm font-bold text-text-primary bg-black/[0.04] border border-black/[0.08] rounded-xl">Dashboard</button>
                  <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/signin'); }} className="w-full py-3 text-sm font-bold text-text-primary bg-black/[0.04] border border-black/[0.08] rounded-xl">Sign In</button>
                  <button onClick={() => { setMenuOpen(false); navigate('/signup'); }} className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl">Try Free</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
