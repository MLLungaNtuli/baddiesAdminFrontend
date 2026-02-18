// services/auth.js
import axios from 'axios'

export const auth = {
  get token() {
    return localStorage.getItem('admin_token')
  },

  get refreshToken() {
    return localStorage.getItem('refresh_token')
  },

  get user() {
    const userStr = localStorage.getItem('admin_user')
    return userStr ? JSON.parse(userStr) : null
  },

  setTokens({ accessToken, refreshToken }) {
    localStorage.setItem('admin_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    
    // Decode and store user info
    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const user = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        permissions: payload.permissions ? payload.permissions.split(',') : []
      }
      localStorage.setItem('admin_user', JSON.stringify(user))
    }
  },

  clear() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('admin_user')
  },

  async logout() {
    try {
      if (this.token) {
        await api.post('/api/admin/auth/logout', {
          refreshToken: this.refreshToken
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clear()
      window.location.href = '/login'
    }
  },

  async logoutAll() {
    try {
      await api.post('/api/admin/auth/logout-all')
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      this.clear()
      window.location.href = '/login'
    }
  },

  async getSessions() {
    const response = await api.get('/api/admin/auth/sessions')
    return response.data
  },

  async revokeSession(sessionId) {
    await api.delete(`/api/admin/auth/sessions/${sessionId}`)
  }
}

// Enhanced Axios interceptor
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5068',
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.request.use(
  config => {
    const token = auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/refresh')) {
        // Refresh token failed, logout
        auth.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      
      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const refreshToken = auth.refreshToken
        const response = await axios.post(
          `${api.defaults.baseURL}/api/admin/auth/refresh`,
          {
            accessToken: auth.token,
            refreshToken: refreshToken
          }
        )
        
        // Update tokens
        auth.setTokens(response.data)
        
        // Update Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
        
        // Process queued requests
        processQueue(null, response.data.accessToken)
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        auth.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    if (error.response?.status === 403) {
      // Permission denied
      console.error('Permission denied:', error.response.data)
      // You can redirect to dashboard or show permission error
    }
    
    return Promise.reject(error)
  }
)

export default api