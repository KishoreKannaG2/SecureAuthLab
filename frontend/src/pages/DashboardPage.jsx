import { useEffect, useState } from 'react'
import { monitorAPI } from '../services/api.js'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'
import { Activity, ShieldOff, ShieldCheck, Cpu, AlertCircle } from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="panel panel-glow p-5 rounded-xl flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-cyber-text uppercase tracking-wider">{label}</span>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={13} />
      </div>
    </div>
    <div>
      <div className="text-2xl font-display font-semibold text-cyber-bright tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <div className="text-xs font-mono text-cyber-text mt-0.5">{sub}</div>}
    </div>
  </div>
)

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="panel border-cyber-border px-3 py-2 text-xs font-mono">
      <div className="text-cyber-text mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await monitorAPI.getStats()
      setStats(res.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t) }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-cyber-accent font-mono text-sm animate-pulse">Loading...</div>
    </div>
  )

  const pie = [
    { name: 'Failed',  value: stats?.failedAttempts    || 0, color: '#ff3b6b' },
    { name: 'Success', value: stats?.successfulLogins  || 0, color: '#00ff88' },
    { name: 'Sim',     value: stats?.simulationAttempts|| 0, color: '#ffd060' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-cyber-bright">Security Dashboard</h1>
          <p className="text-xs font-mono text-cyber-text mt-0.5">Live authentication monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-green">
          <span className="status-dot bg-cyber-green animate-pulse-slow" />
          System Active
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Attempts"  value={stats?.totalAttempts || 0}      icon={Activity}    color="bg-cyber-accent/15 text-cyber-accent" />
        <StatCard label="Failed Logins"   value={stats?.failedAttempts || 0}     icon={ShieldOff}   color="bg-cyber-red/15 text-cyber-red" />
        <StatCard label="Successful"      value={stats?.successfulLogins || 0}   icon={ShieldCheck} color="bg-cyber-green/15 text-cyber-green" />
        <StatCard label="Locked Accounts" value={stats?.lockedAccounts || 0}     icon={AlertCircle} color="bg-cyber-yellow/15 text-cyber-yellow"
                  sub={stats?.lockedAccounts > 0 ? 'Brute force detected' : 'No active lockouts'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart — attempts over time */}
        <div className="xl:col-span-2 panel panel-glow p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider">Attempts Over Last 12h</h2>
            <div className="flex gap-3 text-xs font-mono">
              <span className="text-cyber-red">● Failed</span>
              <span className="text-cyber-green">● Success</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats?.attemptsOverTime || []}>
              <defs>
                <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff3b6b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff3b6b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="okGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2535" />
              <XAxis dataKey="time" tick={{ fill: '#a8bbd4', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a8bbd4', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip} />
              <Area type="monotone" dataKey="failed"  name="Failed"  stroke="#ff3b6b" fill="url(#failGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="success" name="Success" stroke="#00ff88" fill="url(#okGrad)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="panel panel-glow p-5 rounded-xl">
          <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider mb-4">Attempt Breakdown</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                {pie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={customTooltip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pie.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono">
                <span style={{ color: p.color }}>● {p.name}</span>
                <span className="text-cyber-bright">{p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent logs */}
      <div className="panel panel-glow p-5 rounded-xl">
        <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider mb-3">Live Log Feed</h2>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {(stats?.recentLogs || []).map((line, i) => {
            const isSuccess = line.includes('SUCCESS')
            return (
              <div key={i} className={`terminal-text px-2 py-0.5 rounded ${
                isSuccess ? 'text-cyber-green bg-cyber-green/5' : 'text-cyber-red/80 bg-cyber-red/5'
              }`}>
                {line}
              </div>
            )
          })}
          {!stats?.recentLogs?.length && (
            <div className="terminal-text text-cyber-border">No attempts logged yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
