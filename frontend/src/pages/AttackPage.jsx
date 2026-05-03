import { useState, useEffect, useRef } from 'react'
import { attackAPI } from '../services/api.js'
import { Play, Square, Zap, Clock, Hash, Target } from 'lucide-react'

export default function AttackPage() {
  const [config, setConfig] = useState({ targetUsername: 'admin', mode: 'dictionary', delayMs: 100, maxAttempts: 50 })
  const [status, setStatus] = useState({ running: false, attempts: 0, currentPassword: '', cracked: false, status: 'idle', elapsedMs: 0 })
  const [feed, setFeed]     = useState([])
  const feedRef             = useRef(null)
  const pollRef             = useRef(null)

  const poll = async () => {
    try {
      const res = await attackAPI.getStatus()
      const s   = res.data
      setStatus(s)
      if (s.currentPassword) {
        setFeed(f => {
          const line = { pw: s.currentPassword, success: s.cracked && s.crackedPassword === s.currentPassword, t: Date.now() }
          const next = [line, ...f].slice(0, 80)
          return next
        })
      }
      if (!s.running) clearInterval(pollRef.current)
    } catch {}
  }

  const start = async () => {
    setFeed([])
    await attackAPI.start(config)
    pollRef.current = setInterval(poll, 150)
  }

  const stop = async () => {
    clearInterval(pollRef.current)
    await attackAPI.stop()
    await poll()
  }

  useEffect(() => { poll(); return () => clearInterval(pollRef.current) }, [])
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = 0 }, [feed])

  const elapsed = (status.elapsedMs / 1000).toFixed(1)
  const speed   = status.elapsedMs > 0 ? Math.round(status.attempts / (status.elapsedMs / 1000)) : 0

  const statusColor = {
    idle:      'text-cyber-text',
    running:   'text-cyber-accent',
    cracked:   'text-cyber-green',
    blocked:   'text-cyber-yellow',
    stopped:   'text-cyber-text',
    exhausted: 'text-cyber-red',
  }[status.status] || 'text-cyber-text'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-cyber-bright">Attack Simulation</h1>
        <p className="text-xs font-mono text-cyber-text mt-0.5">Simulates automated login attacks against the server</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Config panel */}
        <div className="panel panel-glow p-6 rounded-xl space-y-5">
          <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider">Configuration</h2>

          <div>
            <label className="block text-xs font-mono text-cyber-text mb-1.5 uppercase">Target Username</label>
            <input value={config.targetUsername}
              onChange={e => setConfig(c => ({ ...c, targetUsername: e.target.value }))}
              disabled={status.running}
              className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-4 py-2.5
                         text-cyber-bright font-mono text-sm focus:outline-none focus:border-cyber-accent/60
                         disabled:opacity-40"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-cyber-text mb-1.5 uppercase">Attack Mode</label>
            <select value={config.mode}
              onChange={e => setConfig(c => ({ ...c, mode: e.target.value }))}
              disabled={status.running}
              className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-4 py-2.5
                         text-cyber-bright font-mono text-sm focus:outline-none focus:border-cyber-accent/60
                         disabled:opacity-40"
            >
              <option value="dictionary">Dictionary Attack</option>
              <option value="charset">Charset Brute Force</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyber-text mb-1.5 uppercase">
              Delay Between Attempts: {config.delayMs}ms
            </label>
            <input type="range" min={50} max={1000} step={50} value={config.delayMs}
              onChange={e => setConfig(c => ({ ...c, delayMs: +e.target.value }))}
              disabled={status.running}
              className="w-full accent-cyan-400 disabled:opacity-40"
            />
            <div className="flex justify-between text-xs font-mono text-cyber-border mt-1">
              <span>50ms (Fast)</span>
              <span>1000ms (Slow)</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={start} disabled={status.running}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                         bg-cyber-red/15 border border-cyber-red/40 text-cyber-red
                         font-display font-semibold text-sm
                         hover:bg-cyber-red/25 disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all">
              <Play size={14} /> Start Attack
            </button>
            <button onClick={stop} disabled={!status.running}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                         bg-cyber-border/30 border border-cyber-border text-cyber-text
                         font-display font-semibold text-sm
                         hover:text-cyber-bright hover:border-cyber-text/50
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all">
              <Square size={14} /> Stop
            </button>
          </div>
        </div>

        {/* Stats panel */}
        <div className="space-y-4">
          {/* Status */}
          <div className="panel panel-glow p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider">Status</h2>
              <span className={`text-xs font-mono uppercase font-bold tracking-widest ${statusColor}`}>
                {status.status}
                {status.running && <span className="animate-blink ml-1">_</span>}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Hash,   label: 'Attempts',   value: status.attempts.toLocaleString() },
                { icon: Clock,  label: 'Elapsed',     value: `${elapsed}s`                   },
                { icon: Zap,    label: 'Speed',       value: `${speed}/s`                    },
                { icon: Target, label: 'Target',      value: config.targetUsername            },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-cyber-bg rounded-lg p-3 flex items-start gap-2">
                  <Icon size={12} className="text-cyber-accent mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-mono text-cyber-text">{label}</div>
                    <div className="text-sm font-mono text-cyber-bright tabular-nums">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cracked banner */}
          {status.cracked && (
            <div className="rounded-xl border border-cyber-green/40 bg-cyber-green/10 p-4">
              <div className="text-cyber-green font-mono text-sm font-bold mb-1">PASSWORD CRACKED</div>
              <div className="text-cyber-green/70 font-mono text-xs">
                Found: <span className="text-cyber-green font-bold">{status.crackedPassword}</span>
              </div>
              <div className="text-cyber-green/70 font-mono text-xs">
                After {status.attempts} attempts in {elapsed}s
              </div>
            </div>
          )}

          {status.status === 'blocked' && (
            <div className="rounded-xl border border-cyber-yellow/40 bg-cyber-yellow/10 p-4">
              <div className="text-cyber-yellow font-mono text-sm font-bold mb-1">ATTACK BLOCKED</div>
              <div className="text-cyber-yellow/70 font-mono text-xs">
                Lockout policy stopped the attack after {status.attempts} attempts.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live feed */}
      <div className="panel panel-glow p-5 rounded-xl">
        <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider mb-3">
          Live Attempt Feed
          {status.running && <span className="ml-2 text-cyber-accent animate-pulse">● LIVE</span>}
        </h2>
        <div ref={feedRef} className="h-52 overflow-y-auto space-y-0.5">
          {feed.map((line, i) => (
            <div key={i} className={`terminal-text px-2 py-0.5 rounded ${
              line.success ? 'text-cyber-green bg-cyber-green/10' : 'text-cyber-red/70'
            }`}>
              {line.success ? '✓' : '✗'} Trying: {line.pw}
            </div>
          ))}
          {!feed.length && (
            <div className="terminal-text text-cyber-border">
              Start an attack to see live password attempts here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
