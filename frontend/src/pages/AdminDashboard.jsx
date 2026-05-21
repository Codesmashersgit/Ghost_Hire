import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Users, Clock, ShieldAlert, CreditCard, ArrowLeft, Trash2, Shield, RotateCcw, Search, BarChart3, Receipt, FileText } from 'lucide-react'

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
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      navigate('/signin')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser.isAdmin) {
        navigate('/dashboard')
        return
      }

      setLoading(true)
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      if (statsData.success) setStats(statsData.stats)

      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const usersData = await usersRes.json()
      if (usersData.success) setUsers(usersData.data)

      // Fetch invoices
      const invoicesRes = await fetch('http://localhost:5000/api/admin/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const invoicesData = await invoicesRes.json()
      if (invoicesData.success) setInvoices(invoicesData.data)

      // Fetch sessions
      const sessionsRes = await fetch('http://localhost:5000/api/admin/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const sessionsData = await sessionsRes.json()
      if (sessionsData.success) setSessions(sessionsData.data)

    } catch (err) {
      console.error('Failed to load admin panel data', err)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Admin Actions
  const handleToggleAdmin = async (userId, currentName) => {
    const token = localStorage.getItem('token')
    if (!window.confirm(`Are you sure you want to change the Admin role status for ${currentName}?`)) return
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('token')
    if (!window.confirm(`Are you sure you want to reset the daily 10-minute timer for ${currentName}?`)) return
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset-usage`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('token')
    if (!window.confirm(`⚠️ WARNING: Deleting user "${currentName}" will permanently remove their account, sessions list, and invoices. This action CANNOT be undone!\n\nDo you want to proceed?`)) return
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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
      <div className="h-screen w-screen bg-bg-primary flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-text-primary">Securing Admin Credentials...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-black/10 bg-bg-secondary px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-black/5 hover:bg-black/10 border border-black/10 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-sm font-medium text-text-secondary"
          >
            <ArrowLeft size={16} /> User Panel
          </button>
          <div className="w-px h-6 bg-black/10" />
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <span className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white"><Shield size={14} /></span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GhostHire Admin Control Room</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary flex items-center gap-1">
            <Sparkles size={12} /> Master Mode
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
        
        {/* Stats Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          <div className="p-6 bg-gradient-to-br from-white to-bg-secondary border border-black/10 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Total Users</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-bg-secondary border border-black/10 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Active Sessions</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.totalSessions}</h3>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-bg-secondary border border-black/10 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Usage Today</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.totalMinutesUsed} <span className="text-xs font-normal text-text-secondary">min</span></h3>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-bg-secondary border border-black/10 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Paid Upgrades</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.totalInvoices}</h3>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-white to-bg-secondary border border-black/10 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.totalRevenue}</h3>
            </div>
          </div>

        </section>

        {/* Tab Selection */}
        <div className="flex border-b border-black/10 gap-2 shrink-0">
          <button 
            onClick={() => setActiveSubTab('users')}
            className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users size={16} /> User Management
          </button>
          <button 
            onClick={() => setActiveSubTab('sessions')}
            className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'sessions' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText size={16} /> Sessions Transcript Log
          </button>
          <button 
            onClick={() => setActiveSubTab('invoices')}
            className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Receipt size={16} /> Revenue & Invoices
          </button>
        </div>

        {/* Tab Contents */}
        <section className="bg-white border border-black/10 rounded-3xl overflow-hidden shadow-sm">
          
          {/* USER MANAGEMENT TAB */}
          {activeSubTab === 'users' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-text-primary">Registered Accounts</h2>
                  <p className="text-xs text-text-secondary">Perform administrative overrides, grant privileges, or reset daily usage counters.</p>
                </div>
                <div className="relative max-w-sm w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full bg-black/5 border border-black/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 text-text-tertiary font-bold text-xs uppercase bg-bg-secondary">
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Usage Today</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredUsers.map(user => {
                      const minsUsed = Math.round((user.dailyUsage?.secondsUsed || 0) / 60);
                      const isFreeTrial = !user.isAdmin;
                      return (
                        <tr key={user._id} className="hover:bg-bg-secondary/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-text-primary">{user.name}</div>
                            <div className="text-xs text-text-secondary mt-0.5">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              user.isAdmin 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {user.isAdmin ? 'Admin' : 'Standard User'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.isAdmin ? (
                              <span className="text-xs font-semibold text-text-muted">Unlimited Access</span>
                            ) : (
                              <div className="flex flex-col gap-1 w-28">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span>{minsUsed} / 10 min</span>
                                </div>
                                <div className="w-full bg-black/10 rounded-full h-1.5">
                                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (minsUsed / 10) * 100)}%` }} />
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-text-secondary">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleAdmin(user._id, user.name)}
                                title={user.isAdmin ? "Revoke Admin Status" : "Grant Admin Privilege"}
                                className="p-2 text-text-secondary bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg hover:text-purple-600 transition-all cursor-pointer"
                              >
                                <Shield size={14} />
                              </button>
                              {!user.isAdmin && (
                                <button
                                  onClick={() => handleResetUsage(user._id, user.name)}
                                  title="Reset Daily Timer"
                                  className="p-2 text-text-secondary bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg hover:text-orange-600 transition-all cursor-pointer"
                                >
                                  <RotateCcw size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                title="Delete User Account"
                                className="p-2 text-text-secondary bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg hover:text-red-600 transition-all cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-text-tertiary">No users found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SESSIONS TRANSCRIPT LOG TAB */}
          {activeSubTab === 'sessions' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-text-primary">Sessions Transcript Log</h2>
                <p className="text-xs text-text-secondary">Monitor transcript summaries and logs generated across all users.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 text-text-tertiary font-bold text-xs uppercase bg-bg-secondary">
                      <th className="px-6 py-4">Title / Language</th>
                      <th className="px-6 py-4">Owner Account</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Session Date</th>
                      <th className="px-6 py-4 text-right">Dialogues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {sessions.map(sess => (
                      <tr key={sess._id} className="hover:bg-bg-secondary/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-primary">{sess.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          {sess.userId ? (
                            <>
                              <div className="font-semibold text-text-primary">{sess.userId.name}</div>
                              <div className="text-[11px] text-text-secondary mt-0.5">{sess.userId.email}</div>
                            </>
                          ) : (
                            <span className="text-text-muted italic">Unknown User</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-semibold text-text-secondary">
                          {sess.duration || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-xs text-text-secondary">
                          {new Date(sess.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-2.5 py-1 bg-black/5 border border-black/10 rounded-lg text-xs font-semibold text-text-secondary">
                            {sess.transcript?.length || 0} messages
                          </span>
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-text-tertiary">No transcripts recorded yet in the database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVENUE & INVOICES TAB */}
          {activeSubTab === 'invoices' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-text-primary">Revenue & Invoices History</h2>
                <p className="text-xs text-text-secondary">Track upgrade logs and revenue statistics generated via Simulated Payments.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 text-text-tertiary font-bold text-xs uppercase bg-bg-secondary">
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {invoices.map(invoice => (
                      <tr key={invoice._id} className="hover:bg-bg-secondary/40 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono font-bold text-text-primary">
                          {invoice.invoiceId}
                        </td>
                        <td className="px-6 py-4">
                          {invoice.userId ? (
                            <>
                              <div className="font-semibold text-text-primary">{invoice.userId.name}</div>
                              <div className="text-[11px] text-text-secondary mt-0.5">{invoice.userId.email}</div>
                            </>
                          ) : (
                            <span className="text-text-muted italic">Unknown Customer</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          {invoice.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-secondary text-right">
                          {new Date(invoice.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-text-tertiary">No premium billing logs recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>

      </main>
    </div>
  )
}
