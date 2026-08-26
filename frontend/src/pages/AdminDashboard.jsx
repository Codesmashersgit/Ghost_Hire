import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Users, Clock, ShieldAlert, CreditCard, ArrowLeft, Trash2, Shield, RotateCcw, Search, BarChart3, Receipt, FileText } from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { fetchWithAuth } from '../utils/api'
import { getCookie } from '../utils/storage'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalInvoices: 0,
    totalMinutesUsed: 0,
    totalRevenue: '$0.00'
  })
  
  const [users, setUsers] = useState([])
  const [invoices, setInvoices] = useState([])
  const [sessions, setSessions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubTab, setActiveSubTab] = useState('users')
  const [loading, setLoading] = useState(true)

  // Verify Admin role and fetch initial data
  const loadAdminData = async () => {
    const token = getCookie('token')
    const userData = getCookie('user')
    
    if (!token || !userData) {
      navigate('/signin')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      
      const hasAdminRights = parsedUser.isAdmin || parsedUser.email === 'sudhanshu.ok1802@gmail.com'
      
      if (!hasAdminRights) {
        navigate('/dashboard')
        return
      }

      setLoading(true)
      
      // Fetch stats
      const statsRes = await fetchWithAuth(`${API_BASE_URL}/api/admin/stats`)
      const statsData = await statsRes.json()
      if (statsData.success) setStats(statsData.stats)

      // Fetch users
      const usersRes = await fetchWithAuth(`${API_BASE_URL}/api/admin/users`)
      const usersData = await usersRes.json()
      if (usersData.success) setUsers(usersData.data)

      // Fetch invoices
      const invoicesRes = await fetchWithAuth(`${API_BASE_URL}/api/admin/invoices`)
      const invoicesData = await invoicesRes.json()
      if (invoicesData.success) setInvoices(invoicesData.data)

      // Fetch sessions
      const sessionsRes = await fetchWithAuth(`${API_BASE_URL}/api/admin/sessions`)
      const sessionsData = await sessionsRes.json()
      if (sessionsData.success) setSessions(sessionsData.data)

    } catch (err) {
      console.error('Failed to load admin panel data. Showing mock data for standalone mode.', err)
      // Populate mock data if backend fails
      setStats({ totalUsers: 142, totalSessions: 1492, totalInvoices: 34, totalMinutesUsed: 9482, totalRevenue: '$4,290.00' })
      setUsers([{ _id: '1', name: 'Desktop User', email: 'test@ghosthire.app', isAdmin: true, createdAt: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Admin Actions
  const handleToggleAdmin = async (userId, currentName) => {
    if (!window.confirm(`Are you sure you want to change the Admin role status for ${currentName}?`)) return
    
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/${userId}/toggle-admin`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        loadAdminData()
      } else {
        alert(data.message || 'Action failed')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleResetUsage = async (userId, currentName) => {
    if (!window.confirm(`Are you sure you want to reset the daily 10-minute timer for ${currentName}?`)) return
    
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/${userId}/reset-usage`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        loadAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteUser = async (userId, currentName) => {
    if (!window.confirm(`⚠️ WARNING: Deleting user "${currentName}" will permanently remove their account, sessions list, and invoices. This action CANNOT be undone!\n\nDo you want to proceed?`)) return
    
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        loadAdminData()
      } else {
        alert(data.message || 'Action failed')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Filtered Users List based on Search Bar
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg-primary relative flex flex-col items-center justify-center gap-6 overflow-hidden">
        {/* Futuristic Background */}
        <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-aura-1"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-aura-2"></div>
        
        {/* Loading Widget */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-black/5 bg-bg-tertiary/40 backdrop-blur-md flex items-center justify-center neon-glow-primary">
            <Shield size={32} className="text-primary animate-pulse-glow" />
          </div>
          {/* Orbiting spinner ring */}
          <div className="absolute -inset-2 rounded-full border-2 border-t-primary border-r-accent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        
        <div className="text-center space-y-2 z-10">
          <h2 className="text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Initializing Command Center</h2>
          <p className="text-xs text-text-secondary font-mono animate-pulse">Securing Admin Credentials & decrypting logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative overflow-hidden flex flex-col selection:bg-primary/30 selection:text-white">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-60 z-0"></div>
      
      {/* Glowing Ambient Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] pointer-events-none z-0 animate-aura-1"></div>
      <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none z-0 animate-aura-2"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-black/5 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-black/5 hover:bg-black/10 hover:border-black/20 border border-black/5 rounded-xl transition-all duration-300 flex items-center gap-2 text-xs font-semibold text-text-secondary group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Exit Dashboard</span>
          </button>
          <div className="w-px h-6 bg-black/10" />
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white neon-glow-primary">
              <Shield size={16} />
            </span>
            <span className="gradient-text font-extrabold tracking-wide uppercase text-sm md:text-base">GhostHire Administrative Control Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center px-3 py-1 bg-black/5 border border-black/10 rounded-full text-[11px] font-mono text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            System Live: Decrypted
          </div>
          <span className="px-3.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary-light flex items-center gap-1.5 shadow-sm">
            <Sparkles size={12} className="animate-pulse" /> Master Control
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 z-10 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
        
        {/* Stats Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* Card 1: Total Users */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Total Registered</span>
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-text-primary tracking-tight">{stats.totalUsers}</h3>
              <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold flex items-center">↑ 100%</span> active accounts
              </p>
            </div>
          </div>

          {/* Card 2: Active Sessions */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Active Sessions</span>
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary-light rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldAlert size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-text-primary tracking-tight">{stats.totalSessions}</h3>
              <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold flex items-center">↑ Dynamic</span> interview helper
              </p>
            </div>
          </div>

          {/* Card 3: Usage Today */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Usage Today</span>
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-text-primary tracking-tight">
                {stats.totalMinutesUsed} <span className="text-xs font-semibold text-text-secondary">min</span>
              </h3>
              <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                <span className="text-amber-400 font-semibold">Real-time</span> audio processing
              </p>
            </div>
          </div>

          {/* Card 4: Paid Upgrades */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Premium Upgrades</span>
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-text-primary tracking-tight">{stats.totalInvoices}</h3>
              <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold">Simulated</span> stripe gateway
              </p>
            </div>
          </div>

          {/* Card 5: Total Revenue */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/10 transition-colors"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Total Revenue</span>
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 text-accent rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <BarChart3 size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-accent tracking-tight">{stats.totalRevenue}</h3>
              <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold">↑ Stable</span> premium growth
              </p>
            </div>
          </div>

        </section>

        {/* Tab Selection */}
        <div className="flex border-b border-black/5 gap-1 shrink-0 p-1 bg-black/[0.02] rounded-xl max-w-fit">
          <button 
            onClick={() => setActiveSubTab('users')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'users' 
                ? 'bg-primary text-white shadow-md shadow-primary/20 neon-glow-primary' 
                : 'text-text-tertiary hover:text-text-primary hover:bg-black/5'
            }`}
          >
            <Users size={14} /> <span>User Management</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('sessions')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'sessions' 
                ? 'bg-primary text-white shadow-md shadow-primary/20 neon-glow-primary' 
                : 'text-text-tertiary hover:text-text-primary hover:bg-black/5'
            }`}
          >
            <FileText size={14} /> <span>Transcript Logs</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('invoices')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'invoices' 
                ? 'bg-primary text-white shadow-md shadow-primary/20 neon-glow-primary' 
                : 'text-text-tertiary hover:text-text-primary hover:bg-black/5'
            }`}
          >
            <Receipt size={14} /> <span>Revenue & Invoices</span>
          </button>
        </div>

        {/* Tab Contents Panel */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Subtle grid backing for the panel */}
          <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20"></div>
          
          {/* USER MANAGEMENT TAB */}
          {activeSubTab === 'users' && (
            <div className="p-6 space-y-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-text-primary tracking-tight">Registered Developer Accounts</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Perform administrative overrides, grant privileges, or reset daily usage counters.</p>
                </div>
                <div className="relative max-w-sm w-full">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full bg-bg-tertiary/60 border border-black/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary outline-none focus:border-primary-light/50 focus:ring-1 focus:ring-primary-light/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 text-text-tertiary font-bold uppercase tracking-wider bg-bg-tertiary/40">
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Usage Today</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(user => {
                      const minsUsed = Math.round((user.dailyUsage?.secondsUsed || 0) / 60);
                      return (
                        <tr key={user._id} className="hover:bg-black/[0.02] transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="font-bold text-text-primary text-sm">{user.name}</div>
                            <div className="text-[11px] text-text-secondary mt-0.5 font-mono">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              user.isAdmin 
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {user.isAdmin ? 'Admin' : 'Standard'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.isAdmin ? (
                              <span className="text-[11px] font-semibold text-text-muted italic">Unlimited Access</span>
                            ) : (
                              <div className="flex flex-col gap-1.5 w-32">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                                  <span>{minsUsed} / 10 min</span>
                                </div>
                                <div className="w-full bg-black/10 rounded-full h-1">
                                  <div 
                                    className="bg-gradient-to-r from-primary to-accent h-1 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                                    style={{ width: `${Math.min(100, (minsUsed / 10) * 100)}%` }} 
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-text-secondary">
                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleAdmin(user._id, user.name)}
                                title={user.isAdmin ? "Revoke Admin Status" : "Grant Admin Privilege"}
                                className="p-2 text-text-secondary bg-black/5 hover:bg-purple-500/10 border border-black/5 hover:border-purple-500/20 rounded-lg hover:text-purple-400 transition-all duration-300"
                              >
                                <Shield size={13} />
                              </button>
                              {!user.isAdmin && (
                                <button
                                  onClick={() => handleResetUsage(user._id, user.name)}
                                  title="Reset Daily Timer"
                                  className="p-2 text-text-secondary bg-black/5 hover:bg-amber-500/10 border border-black/5 hover:border-amber-500/20 rounded-lg hover:text-amber-400 transition-all duration-300"
                                >
                                  <RotateCcw size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                title="Delete User Account"
                                className="p-2 text-text-secondary bg-black/5 hover:bg-red-500/10 border border-black/5 hover:border-red-500/20 rounded-lg hover:text-red-400 transition-all duration-300"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-xs text-text-tertiary">
                          No developer accounts found matching that query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SESSIONS TRANSCRIPT LOG TAB */}
          {activeSubTab === 'sessions' && (
            <div className="p-6 space-y-6 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-text-primary tracking-tight">Decrypted Transcript Logs</h2>
                <p className="text-xs text-text-secondary mt-0.5">Monitor system transcript logs, AI assistant notes, and metadata generated across all user live feeds.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 text-text-tertiary font-bold uppercase tracking-wider bg-bg-tertiary/40">
                      <th className="px-6 py-4">Title / Context</th>
                      <th className="px-6 py-4">Owner Account</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4 text-right">Dialogues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sessions.map(sess => (
                      <tr key={sess._id} className="hover:bg-black/[0.02] transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-primary text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping"></span>
                            {sess.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {sess.userId ? (
                            <>
                              <div className="font-bold text-text-primary">{sess.userId.name}</div>
                              <div className="text-[11px] text-text-secondary mt-0.5 font-mono">{sess.userId.email}</div>
                            </>
                          ) : (
                            <span className="text-text-muted italic">Anonymous Session</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-black/5 rounded-md font-mono text-[11px] text-text-secondary border border-black/5">
                            {sess.duration || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-mono">
                          {new Date(sess.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-2.5 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent">
                            {sess.transcript?.length || 0} messages
                          </span>
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-xs text-text-tertiary">
                          No audio transcript records found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVENUE & INVOICES TAB */}
          {activeSubTab === 'invoices' && (
            <div className="p-6 space-y-6 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-text-primary tracking-tight">Revenue & Simulated Payments</h2>
                <p className="text-xs text-text-secondary mt-0.5">Track real-time upgrade logs, stripe events, and simulated customer conversions.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 text-text-tertiary font-bold uppercase tracking-wider bg-bg-tertiary/40">
                      <th className="px-6 py-4">Invoice Hash</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Settled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.map(invoice => (
                      <tr key={invoice._id} className="hover:bg-black/[0.02] transition-colors duration-200">
                        <td className="px-6 py-4 font-mono font-bold text-primary-light text-xs">
                          {invoice.invoiceId}
                        </td>
                        <td className="px-6 py-4">
                          {invoice.userId ? (
                            <>
                              <div className="font-bold text-text-primary">{invoice.userId.name}</div>
                              <div className="text-[11px] text-text-secondary mt-0.5 font-mono">{invoice.userId.email}</div>
                            </>
                          ) : (
                            <span className="text-text-muted italic">Unknown Customer</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-400 text-sm">
                          {invoice.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-mono text-right">
                          {new Date(invoice.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-xs text-text-tertiary">
                          No paid upgrades or invoices logged in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  )
}
