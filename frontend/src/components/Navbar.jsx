import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles, LogOut, ArrowRight } from 'lucide-react'

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-bg-secondary/75 backdrop-blur-xl border-b border-border/60 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]' : 'py-5'}`} id="navbar">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 font-black text-xl z-[1001] group" id="logo-link">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-all duration-300">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent tracking-wide font-extrabold">GhostHire</span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] rounded-full p-1.5 backdrop-blur-md">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="px-4 py-1.5 text-xs font-semibold text-text-secondary rounded-full hover:text-text-primary hover:bg-white/[0.06] transition-all duration-200">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="px-5 py-2 text-xs font-bold text-text-primary bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] hover:border-primary-light/40 transition-all duration-300">
                Dashboard
              </button>
              <button onClick={handleLogout} className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-1.5">
                Logout <LogOut size={13} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/signin')} className="px-5 py-2 text-xs font-bold text-text-primary bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] hover:border-primary-light/40 transition-all duration-300" id="signin-btn">
                Sign In
              </button>
              <button onClick={() => navigate('/signup')} className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-1.5" id="try-free-btn">
                Try Free <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-text-primary z-[1001] w-9 h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg flex items-center justify-center hover:bg-white/[0.08]" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" id="menu-toggle">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-bg-primary/95 backdrop-blur-2xl z-[1000] flex flex-col items-center justify-center gap-6 md:hidden">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="text-lg font-bold text-text-secondary hover:text-text-primary transition-all">
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3.5 pt-8 w-64">
              {isLoggedIn ? (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/dashboard'); }} className="w-full py-3 text-sm font-bold text-text-primary bg-white/[0.04] border border-white/[0.08] rounded-xl">Dashboard</button>
                  <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/signin'); }} className="w-full py-3 text-sm font-bold text-text-primary bg-white/[0.04] border border-white/[0.08] rounded-xl">Sign In</button>
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
