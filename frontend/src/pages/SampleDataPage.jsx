import { useEffect, useState } from 'react'
import { sampleDataAPI } from '../services/api.js'

export default function SampleDataPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMovies, setFilteredMovies] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' })

  useEffect(() => {
    fetchMovies()
  }, [])

  useEffect(() => {
    filterAndSortMovies()
  }, [movies, searchTerm, sortConfig])

  const fetchMovies = () => {
    setLoading(true)
    sampleDataAPI.getMovies()
      .then(res => {
        setMovies(res.data || [])
        setError(null)
      })
      .catch(err => {
        setError('Failed to load movies: ' + (err.message || 'Unknown error'))
        setMovies([])
      })
      .finally(() => setLoading(false))
  }

  const filterAndSortMovies = () => {
    let filtered = movies
    
    if (searchTerm) {
      filtered = movies.filter(movie =>
        movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genres?.some(g => g?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort movies
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortConfig.direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    setFilteredMovies(sorted)
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="text-cyber-border">⇅</span>
    return sortConfig.direction === 'asc' ? <span className="text-cyber-accent">↑</span> : <span className="text-cyber-accent">↓</span>
  }

  if (loading) return <div className="p-8"><div className="text-cyber-text">Loading movies...</div></div>
  if (error) return <div className="p-8"><div className="text-red-500">{error}</div></div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold mb-4 text-cyber-accent">Sample MFLIX Database</h1>
        <p className="text-cyber-text text-sm mb-4">Displaying movies from MongoDB sample_mflix database</p>
        
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by title, director, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-cyber-panel border border-cyber-border rounded-lg text-cyber-text placeholder-cyber-border focus:outline-none focus:ring-2 focus:ring-cyber-accent"
          />
          <button
            onClick={fetchMovies}
            className="px-4 py-2 bg-cyber-accent text-cyber-bg font-semibold rounded-lg hover:bg-opacity-80 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="panel p-8 rounded-xl border border-cyber-border bg-cyber-panel text-center">
          <p className="text-cyber-text">{searchTerm ? 'No movies found matching your search.' : 'No movies available.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyber-border">
          <table className="w-full text-sm bg-cyber-panel">
            <thead className="bg-cyber-border bg-opacity-20 border-b border-cyber-border">
              <tr>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold cursor-pointer hover:bg-opacity-40" onClick={() => handleSort('title')}>
                  Title <SortIcon column="title" />
                </th>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold cursor-pointer hover:bg-opacity-40" onClick={() => handleSort('year')}>
                  Year <SortIcon column="year" />
                </th>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold cursor-pointer hover:bg-opacity-40" onClick={() => handleSort('imdbRating')}>
                  Rating <SortIcon column="imdbRating" />
                </th>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold">Director</th>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold">Genres</th>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold">Runtime</th>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold">Country</th>
                <th className="px-4 py-3 text-left text-cyber-accent font-semibold">Plot</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie, idx) => (
                <tr key={movie.id || idx} className="border-b border-cyber-border hover:bg-cyber-border hover:bg-opacity-10 transition">
                  <td className="px-4 py-3 text-cyber-accent font-semibold max-w-xs truncate">{movie.title || 'N/A'}</td>
                  <td className="px-4 py-3 text-cyber-text">{movie.year || 'N/A'}</td>
                  <td className="px-4 py-3 text-cyber-text">
                    <span className={`px-2 py-1 rounded ${movie.imdb && typeof movie.imdb.rating === 'number' ? (movie.imdb.rating >= 7 ? 'bg-green-900 text-green-300' : movie.imdb.rating >= 5 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300') : 'text-cyber-border'}`}>
                      {movie.imdb && typeof movie.imdb.rating === 'number' ? movie.imdb.rating.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cyber-text max-w-xs truncate">{movie.director || 'N/A'}</td>
                  <td className="px-4 py-3 text-cyber-text max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {movie.genres && movie.genres.length > 0 ? (
                        movie.genres.slice(0, 2).map((genre, i) => (
                          <span key={i} className="px-2 py-1 bg-cyber-accent bg-opacity-20 text-cyber-accent text-xs rounded">
                            {genre}
                          </span>
                        ))
                      ) : (
                        <span className="text-cyber-border">N/A</span>
                      )}
                      {movie.genres && movie.genres.length > 2 && (
                        <span className="text-cyber-border text-xs">+{movie.genres.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cyber-text">{movie.runtime ? `${movie.runtime}m` : 'N/A'}</td>
                  <td className="px-4 py-3 text-cyber-text">
                    {Array.isArray(movie.countries) && movie.countries.length > 0
                      ? movie.countries[0]
                      : typeof movie.countries === 'string' && movie.countries
                        ? movie.countries
                        : movie.country || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-cyber-text max-w-md text-xs line-clamp-2">{movie.plot || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-sm text-cyber-border">
        Showing {filteredMovies.length} of {movies.length} movies
      </div>
    </div>
  )
}
