import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:  (username, password) => api.post('/auth/login', { username, password }),
  logout: ()                   => api.post('/auth/logout'),
}

export const monitorAPI = {
  getStats:    () => api.get('/monitor/stats'),
  getAttempts: () => api.get('/monitor/attempts'),
}

export const attackAPI = {
  start:     (payload) => api.post('/attack/start', payload),
  stop:      ()        => api.post('/attack/stop'),
  getStatus: ()        => api.get('/attack/status'),
}

export const securityAPI = {
  getConfig:    ()       => api.get('/security/config'),
  updateConfig: (config) => api.put('/security/config', config),
}

export default api
