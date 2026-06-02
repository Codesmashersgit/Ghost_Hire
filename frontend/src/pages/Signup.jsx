import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
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
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Make sure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Cyber Grid & Slow Moving Neon Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 cyber-grid" />
        <div className="absolute w-[420px] h-[420px] bg-primary/8 rounded-full blur-[90px] top-10 left-10 animate-aura-1" />
        <div className="absolute w-[360px] h-[360px] bg-accent/8 rounded-full blur-[80px] bottom-10 right-10 animate-aura-2" />
      </div>

      <div className="absolute top-8 left-8 z-10">
        <Link to="/" className="flex items-center gap-2.5 font-black text-xl group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,58,237,0.25)] group-hover:scale-105 transition-all">
            <Sparkles size={16} />
          </div>
          <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent font-extrabold">GhostHire</span>
        </Link>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black mb-2 text-text-primary">Create Account</h2>
          <p className="text-text-secondary text-xs font-semibold">Join GhostHire and unlock real-time interview suggestions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[0.62rem] font-bold text-text-tertiary uppercase tracking-[2px] mb-2">Candidate Name</label>
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:border-primary-light/50 focus:bg-black/[0.05] transition-all outline-none"
              />
            </div>
          </div>

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
                className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:border-primary-light/50 focus:bg-black/[0.05] transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.62rem] font-bold text-text-tertiary uppercase tracking-[2px] mb-2">Account Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:border-primary-light/50 focus:bg-black/[0.05] transition-all outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-sheen w-full py-3.5 mt-6 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-[0_4px_25px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Create Candidate Profile <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center text-xs text-text-secondary mt-6 font-medium">
          Already registered?{' '}
          <Link to="/signin" className="text-primary-light hover:underline font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
