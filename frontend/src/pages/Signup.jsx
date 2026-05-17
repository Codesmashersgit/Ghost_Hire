import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
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
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GhostHire</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-bg-secondary/50 backdrop-blur-xl border border-black/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Create an Account</h2>
          <p className="text-text-secondary text-sm">Join GhostHire and ace your next interview.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full bg-black/5 border border-black/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:bg-black/5 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="w-full bg-black/5 border border-black/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:bg-black/5 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full bg-black/5 border border-black/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:bg-black/5 transition-all outline-none"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 mt-4 text-sm font-bold text-text-primary bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
            Sign Up <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary-light hover:underline font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
