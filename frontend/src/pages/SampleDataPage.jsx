import { useEffect, useState } from 'react'
import { sampleDataAPI } from '../services/api.js'

export default function SampleDataPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    sampleDataAPI.getAll()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load sample data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading sample data...</div>
  if (error)   return <div className="p-8 text-red-500">{error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-display font-bold mb-6">Sample Data</h1>
      {data.length === 0 ? (
        <div className="text-cyber-text">No sample data found.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data.map(item => (
            <div key={item.id} className="panel p-5 rounded-xl border border-cyber-border bg-cyber-panel">
              <div className="font-bold text-cyber-accent mb-2">{item.title}</div>
              <div className="text-cyber-text mb-2">{item.secret}</div>
              <div className="text-xs text-cyber-border">Created: {new Date(item.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
