import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';

export default function Signin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        alert(data.message || 'Signin failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Make sure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid & Slow Moving Neon Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 cyber-grid" />
        <div className="absolute w-[400px] h-[400px] bg-primary/8 rounded-full blur-[90px] top-10 left-10 animate-aura-1" />
        <div className="absolute w-[350px] h-[350px] bg-accent/8 rounded-full blur-[80px] bottom-10 right-10 animate-aura-2" />
      </div>

      <div className="absolute top-8 left-8 z-10">
        <Link to="/" className="flex items-center gap-2.5 font-black text-xl group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-all">
            <Sparkles size={16} />
          </div>
          <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent font-extrabold">GhostHire</span>
        </Link>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-bg-tertiary/60 border border-white/[0.06] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black mb-2 text-text-primary">Welcome Back</h2>
          <p className="text-text-secondary text-xs font-semibold">Sign in to resume your stealth interview sessions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[0.62rem] font-bold text-text-tertiary uppercase tracking-[2px] mb-2">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:border-primary-light/50 focus:bg-white/[0.05] transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[0.62rem] font-bold text-text-tertiary uppercase tracking-[2px]">Security Password</label>
              <a href="#" className="text-[0.68rem] text-primary-light hover:underline font-bold">Forgot?</a>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:border-primary-light/50 focus:bg-white/[0.05] transition-all outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 mt-6 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Authenticate Portal <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center text-xs text-text-secondary mt-6 font-medium">
          New candidate?{' '}
          <Link to="/signup" className="text-primary-light hover:underline font-bold">Register Session Account</Link>
        </p>
      </div>
    </div>
  );
}
