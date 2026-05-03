import { useEffect, useState } from 'react'
import { monitorAPI } from '../services/api.js'
import { RefreshCw, CheckCircle, XCircle, Terminal } from 'lucide-react'

export default function LogsPage() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  const load = async () => {
    try {
      const res = await monitorAPI.getAttempts()
      setLogs(res.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 3000); return () => clearInterval(t) }, [])

  const filtered = logs.filter(l => {
    if (filter === 'failed')  return !l.success
    if (filter === 'success') return  l.success
    if (filter === 'sim')     return  l.source === 'SIMULATION'
    return true
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-cyber-bright">Login Attempt Logs</h1>
          <p className="text-xs font-mono text-cyber-text mt-0.5">All authentication events from MongoDB</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyber-text">{filtered.length} records</span>
          <button onClick={load} className="p-2 rounded-lg border border-cyber-border text-cyber-text hover:text-cyber-bright transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all','failed','success','sim'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-cyber-accent/15 border border-cyber-accent/40 text-cyber-accent'
                : 'border border-cyber-border text-cyber-text hover:text-cyber-bright'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="panel panel-glow rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-3 px-4 py-3 border-b border-cyber-border">
          {['Time','Username','IP Address','Source','Status'].map(h => (
            <span key={h} className="text-xs font-mono text-cyber-text uppercase tracking-wider">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-cyber-border/50 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-cyber-text font-mono text-sm animate-pulse">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Terminal size={24} className="text-cyber-border mx-auto mb-2" />
              <div className="text-cyber-border font-mono text-sm">No records yet.</div>
            </div>
          ) : filtered.map((log) => (
            <div key={log.id} className={`grid grid-cols-5 gap-3 px-4 py-3 text-xs font-mono hover:bg-white/[0.02] transition-colors ${
              !log.success && log.source === 'SIMULATION' ? 'bg-cyber-red/[0.03]' : ''
            }`}>
              <span className="text-cyber-text">{log.timestamp}</span>
              <span className="text-cyber-bright">{log.username}</span>
              <span className="text-cyber-text">{log.ip}</span>
              <span className={log.source === 'SIMULATION' ? 'text-cyber-yellow' : 'text-cyber-text'}>
                {log.source}
              </span>
              <span className={`flex items-center gap-1 ${log.success ? 'text-cyber-green' : 'text-cyber-red'}`}>
                {log.success
                  ? <><CheckCircle size={11} /> SUCCESS</>
                  : <><XCircle    size={11} /> FAILED</>
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
