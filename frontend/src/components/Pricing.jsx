import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Free Trial',
    icon: <Zap size={22} />,
    price: '₹0',
    period: 'forever',
    desc: 'Try GhostHire risk-free with unlimited 10-min sessions.',
    features: ['10-min sessions', 'Unlimited trial sessions', 'All AI models', 'Real-time answers', 'Basic coding support'],
    cta: 'Start Free',
    popular: false,
    gradient: 'from-white/5 to-white/2',
  },
  {
    name: 'Monthly',
    icon: <Sparkles size={22} />,
    price: '₹1,499',
    period: '/month',
    desc: 'Full-power access for active job seekers.',
    features: ['Unlimited call duration', 'All AI models (GPT-4, Claude, Gemini)', 'Full coding support', 'Resume context upload', 'Post-call summaries', 'Priority support', '50+ languages'],
    cta: 'Subscribe',
    popular: true,
    gradient: 'from-primary/15 to-accent/8',
  },
  {
    name: 'Lifetime',
    icon: <Crown size={22} />,
    price: '₹9,999',
    period: 'one-time',
    desc: 'Pay once, use forever. Best value for your career.',
    features: ['Everything in Monthly', 'Lifetime access', 'All future updates', 'Priority queue', 'Exclusive Discord', '1-on-1 onboarding'],
    cta: 'Get Lifetime',
    popular: false,
    gradient: 'from-warning/10 to-warning/3',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly')

  return (
    <section className="py-24" id="pricing">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">💰 Pricing</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Simple, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Transparent</span> Pricing
          </h2>
          <p className="text-base text-text-secondary max-w-[600px] mx-auto">No hidden fees. No surprises. Start free, upgrade when ready.</p>
        </motion.div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center bg-bg-tertiary/60 border border-black/10 rounded-full p-1">
            <button onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-primary to-accent text-text-primary shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}>
              Monthly
            </button>
            <button onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-primary to-accent text-text-primary shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}>
              Yearly <span className="text-[0.65rem] bg-success/20 text-success px-2 py-0.5 rounded-full font-bold">-75%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${plan.popular
                ? 'bg-gradient-to-b from-primary/15 to-accent/5 border-primary/40 shadow-[0_0_60px_rgba(108,92,231,0.15)] scale-[1.03]'
                : 'bg-bg-tertiary/40 border-black/10 hover:border-primary/30'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-[0.7rem] font-bold text-text-primary uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="text-primary mb-4">{plan.icon}</div>
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-text-tertiary mb-5">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">{billingCycle === 'yearly' && plan.price !== '₹0' ? (plan.price === '₹1,499' ? '₹4,499' : plan.price) : plan.price}</span>
                <span className="text-sm text-text-tertiary">{billingCycle === 'yearly' && plan.period === '/month' ? '/year' : plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-success shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/dashboard')}
                className={`w-full py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 ${plan.popular
                  ? 'bg-gradient-to-r from-primary to-accent text-text-primary shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:shadow-[0_6px_25px_rgba(108,92,231,0.4)] hover:-translate-y-0.5'
                  : 'bg-black/5 border border-black/10 text-text-primary hover:bg-black/5 hover:border-primary/30'}`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-text-muted mt-8">30-day money-back guarantee • Cancel anytime • No questions asked</p>
      </div>
    </section>
  )
}
