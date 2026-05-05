import { useState, useEffect } from 'react'
import { securityAPI } from '../services/api.js'
import { Shield, Lock, Gauge, Clock, Save, RotateCcw } from 'lucide-react'

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-cyber-border last:border-0">
    <div>
      <div className="text-sm font-display text-cyber-bright">{label}</div>
      <div className="text-xs font-mono text-cyber-text mt-0.5">{desc}</div>
    </div>
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-cyber-accent/30 border border-cyber-accent/50' : 'bg-cyber-bg border border-cyber-border'
      }`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${
        checked ? 'left-[22px] bg-cyber-accent' : 'left-0.5 bg-cyber-border'
      }`} />
    </button>
  </div>
)

const NumInput = ({ label, desc, icon: Icon, value, onChange, min, max, unit }) => (
  <div className="flex items-center justify-between py-4 border-b border-cyber-border last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-cyber-accent/10 border border-cyber-accent/20 flex items-center justify-center">
        <Icon size={13} className="text-cyber-accent" />
      </div>
      <div>
        <div className="text-sm font-display text-cyber-bright">{label}</div>
        <div className="text-xs font-mono text-cyber-text mt-0.5">{desc}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <input type="number" value={value} min={min} max={max}
        onChange={e => onChange(+e.target.value)}
        className="w-20 bg-cyber-bg border border-cyber-border rounded-lg px-3 py-1.5
                   text-cyber-bright font-mono text-sm text-right
                   focus:outline-none focus:border-cyber-accent/60" />
      {unit && <span className="text-xs font-mono text-cyber-text">{unit}</span>}
    </div>
  </div>
)

export default function SecurityPage() {
  const [cfg, setCfg]       = useState(null)
  const [saved, setSaved]   = useState(false)
  const [loading, setLoad]  = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    securityAPI.getConfig()
      .then(r => { 
        setCfg(r.data); 
        setLoad(false);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load security settings: ' + (err.message || 'Unknown error'));
        setLoad(false);
        console.error('Security config error:', err);
      })
  }, [])

  const save = async () => {
    try {
      await securityAPI.updateConfig(cfg)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError('Failed to save settings: ' + (err.message || 'Unknown error'));
    }
  }

  const reset = () => setCfg({ lockoutEnabled: true, maxAttempts: 5, lockoutSeconds: 60, rateLimitEnabled: true, delayMs: 0 })

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-cyber-accent font-mono text-sm animate-pulse">Loading...</div>
    </div>
  )

  if (error) return (
    <div className="p-6 max-w-2xl">
      <div className="rounded-xl border border-cyber-red/30 bg-cyber-red/10 p-6">
        <div className="text-cyber-red font-display font-semibold mb-2">Error Loading Settings</div>
        <div className="text-cyber-text text-sm font-mono">{error}</div>
        <button 
          onClick={() => {
            setLoad(true);
            setError(null);
            securityAPI.getConfig()
              .then(r => { 
                setCfg(r.data); 
                setLoad(false);
                setError(null);
              })
              .catch(err => {
                setError('Failed to load security settings: ' + (err.message || 'Unknown error'));
                setLoad(false);
              })
          }}
          className="mt-4 px-4 py-2 bg-cyber-accent/15 border border-cyber-accent/40 text-cyber-accent rounded-lg text-sm font-display hover:bg-cyber-accent/25 transition"
        >
          Retry
        </button>
      </div>
    </div>
  )

  if (!cfg) return null

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-cyber-bright">Security Settings</h1>
          <p className="text-xs font-mono text-cyber-text mt-0.5">Configure authentication defence mechanisms</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cyber-border
                       text-cyber-text text-xs font-display hover:text-cyber-bright transition-colors">
            <RotateCcw size={12} /> Reset
          </button>
          <button onClick={save}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                       bg-cyber-accent/15 border border-cyber-accent/40 text-cyber-accent
                       text-xs font-display font-semibold hover:bg-cyber-accent/25 transition-all">
            <Save size={12} />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Lockout settings */}
      <div className="panel panel-glow p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={14} className="text-cyber-accent" />
          <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider">Account Lockout</h2>
        </div>
        <Toggle
          label="Enable Account Lockout"
          desc="Lock account after N failed login attempts"
          checked={cfg.lockoutEnabled}
          onChange={v => setCfg(c => ({ ...c, lockoutEnabled: v }))}
        />
        <NumInput label="Max Failed Attempts" desc="Attempts before lockout triggers"
          icon={Shield} value={cfg.maxAttempts} min={1} max={20} unit="tries"
          onChange={v => setCfg(c => ({ ...c, maxAttempts: v }))} />
        <NumInput label="Lockout Duration" desc="How long account stays locked"
          icon={Clock} value={cfg.lockoutSeconds} min={10} max={3600} unit="seconds"
          onChange={v => setCfg(c => ({ ...c, lockoutSeconds: v }))} />
      </div>

      {/* Rate limiting */}
      <div className="panel panel-glow p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={14} className="text-cyber-accent" />
          <h2 className="text-xs font-mono text-cyber-text uppercase tracking-wider">Rate Limiting</h2>
        </div>
        <Toggle
          label="Enable IP Rate Limiting"
          desc="Limit login requests per minute from same IP"
          checked={cfg.rateLimitEnabled}
          onChange={v => setCfg(c => ({ ...c, rateLimitEnabled: v }))}
        />
        <NumInput label="Response Delay" desc="Add artificial delay to each login response"
          icon={Clock} value={cfg.delayMs} min={0} max={5000} unit="ms"
          onChange={v => setCfg(c => ({ ...c, delayMs: v }))} />
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-cyber-accent/20 bg-cyber-accent/5 p-4">
        <div className="text-xs font-mono text-cyber-accent mb-2 font-semibold">HOW TO DEMO</div>
        <ol className="text-xs font-mono text-cyber-text space-y-1 list-decimal list-inside">
          <li>Disable lockout → run attack on Attack page → password cracks fast</li>
          <li>Enable lockout (5 attempts) → run attack → blocked immediately</li>
          <li>Increase delay to 500ms → attack speed drops dramatically</li>
        </ol>
      </div>
    </div>
  )
}
