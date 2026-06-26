import axios from 'axios'

const api = axios.create({
  baseURL: 'https://secureauthlab.onrender.com',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401 only for authenticated requests (not on login page)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('token')
      // Only redirect if user was already logged in (session expired)
      if (token) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:  (username, password) => api.post('/api/auth/login', { username, password }),
  logout: ()                   => api.post('/api/auth/logout'),
}

export const monitorAPI = {
  getStats:    () => api.get('/api/monitor/stats'),
  getAttempts: () => api.get('/api/monitor/attempts'),
}

export const attackAPI = {
  start:     (payload) => api.post('/api/attack/start', payload),
  stop:      ()        => api.post('/api/attack/stop'),
  getStatus: ()        => api.get('/api/attack/status'),
}

export const securityAPI = {
  getConfig:    ()       => api.get('/api/security/config'),
  updateConfig: (config) => api.put('/api/security/config', config),
}

export const sampleDataAPI = {
  getAll: () => api.get('/api/auth/data'),
  getMovies: () => api.get('/api/auth/sample-movies'),
  searchMovies: (title) => api.get('/api/auth/sample-movies/search', { params: { title } }),
}

export default api
