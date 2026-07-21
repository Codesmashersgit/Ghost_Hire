import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Free Trial',
    icon: <Zap size={20} />,
    price: '₹0',
    period: 'forever',
    desc: 'Evaluate GhostHire risk-free with unlimited 10-minute trial periods.',
    features: ['10-minute maximum sessions', 'Unlimited total sessions', 'Access all backend AI models', 'Real-time transcript streams', 'Basic system-design help'],
    cta: 'Start Free',
    popular: false,
    gradient: 'from-white/5 to-white/2',
  },
  {
    name: 'Pro Candidate',
    icon: <Sparkles size={20} className="animate-pulse text-accent" />,
    price: '₹1,499',
    period: '/month',
    desc: 'Uncompromising capabilities built for active, ambitious software job hunters.',
    features: ['Unlimited session length', 'Premium AI models (GPT-4o, Claude 3.5)', 'Real-time code parsing', 'Custom resume contextualization', 'Detailed post-session summary logs', 'Dedicated priority processing queue', '50+ local speech models supported'],
    cta: 'Subscribe Now',
    popular: true,
    gradient: 'from-primary/20 to-accent/10',
  },
  {
    name: 'Lifetime Master',
    icon: <Crown size={20} className="text-warning" />,
    price: '₹9,999',
    period: 'one-time',
    desc: 'Secure your career support for life. The ultimate value across promotions.',
    features: ['Everything included in Pro Candidate', 'Lifetime infinite access', 'Guaranteed access to all updates', 'Exclusive VIP Discord community', '1-on-1 personalized setup call', 'Advanced early beta tool access'],
    cta: 'Get Lifetime',
    popular: false,
    gradient: 'from-warning/10 to-warning/5',
  },
]
import { getCookie } from '../utils/storage'

export default function Pricing() {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!getCookie('token'))
  }, [])

  const handleCtaClick = () => {
    navigate(isLoggedIn ? '/dashboard' : '/signin')
  }

  return (
    <section className="py-24 relative overflow-hidden" id="pricing">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] top-1/3 -right-24" />
        <div className="absolute w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] bottom-10 -left-24" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16" 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[2.5px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">
            💰 Subscriptions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Flexible, <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Value-Driven</span> Plans
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-[600px] mx-auto leading-relaxed">
            Zero hidden constraints. Upgrade to unlock full runtime, resume syncing, and advanced code generation.
          </p>
        </motion.div>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-14">
          <div className="flex items-center bg-bg-tertiary/40 border border-white/[0.06] rounded-full p-1.5 backdrop-blur-md">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-xs font-bold rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Monthly Billing
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 text-xs font-bold rounded-full transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Yearly Saver <span className="text-[0.6rem] bg-success/20 text-success px-2 py-0.5 rounded-full font-black">SAVE 75%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1050px] mx-auto items-stretch">
          {plans.map((plan, i) => {
            const calculatedPrice = billingCycle === 'yearly' && plan.price !== '₹0'
              ? (plan.price === '₹1,499' ? '₹4,499' : plan.price) 
              : plan.price;
            
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-bg-tertiary border-primary-light/50 shadow-[0_20px_50px_rgba(99,102,241,0.15)] scale-[1.04] md:scale-[1.05] z-10'
                    : 'bg-bg-tertiary/40 border-white/[0.05] hover:border-primary-light/30 hover:bg-bg-tertiary/60'
                }`}
              >
                {/* Popular Pill badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-[0.62rem] font-black text-white uppercase tracking-wider shadow-lg">
                    Recommended Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-primary-light">{plan.icon}</div>
                    {plan.popular && <span className="text-[0.65rem] font-bold text-accent tracking-wider uppercase">Best Seller</span>}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1.5 text-text-primary">{plan.name}</h3>
                  <p className="text-[0.72rem] text-text-tertiary leading-relaxed mb-6">{plan.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8 border-b border-white/[0.05] pb-6">
                    <span className="text-4xl font-black text-text-primary tracking-tight">{calculatedPrice}</span>
                    <span className="text-xs text-text-tertiary font-medium">
                      {billingCycle === 'yearly' && plan.period === '/month' ? '/year' : plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                        <Check size={14} className="text-success shrink-0 mt-0.5 bg-success/10 rounded-full p-0.5" /> 
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={handleCtaClick}
                  className={`w-full py-3.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5'
                      : 'bg-white/[0.04] border border-white/[0.08] text-text-primary hover:bg-white/[0.08] hover:border-primary/40'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            )
          })}
        </div>

        <p className="text-center text-[0.68rem] text-text-muted mt-12 font-medium tracking-wide">
          Safe payment integrations • Cancel at any moment • 30-day candidate refund policy
        </p>
      </div>
    </section>
  )
}
