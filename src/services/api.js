import axios from 'axios'
import { auth } from './auth'

const api = axios.create({
  baseURL: 'http://localhost:5068',
  headers: {
    'Content-Type': 'application/json'
  }
})

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')

    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }

    console.log('➡️ API REQUEST', {
      method: config.method,
      url: config.url,
      auth: !!token
    })

    return config
  },
  (error) => Promise.reject(error)
)

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      try {
        const refresh = await axios.post(
          'http://localhost:5068/api/admin/auth/refresh',
          {
            accessToken: auth.token,
            refreshToken: localStorage.getItem('refresh_token')
          }
        )

        auth.setTokens(refresh.data)
        err.config.headers.Authorization =
          `Bearer ${refresh.data.accessToken}`

        return api(err.config)
      } catch {
        auth.clear()
        window.location = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ===============================
// ESCORT API ENDPOINTS
// ===============================

// GET all escorts
export const getAllEscorts = () => {
  return api.get('/api/admin/escorts')
}

// GET single escort profile
export const getEscortProfile = (id) => {
  return api.get(`/api/admin/escorts/${id}/profile`)
}

// UPDATE escort profile
export const updateEscortProfile = (id, data) => {
  return api.put(`/api/admin/escorts/${id}/profile`, data)
}

// CREATE new escort
export const createEscort = (data) => {
  return api.post('/api/admin/escorts', data)
}

// SET active status
export const setEscortActive = (id, active) => {
  return api.patch(`/api/admin/escorts/${id}/active`, { active })
}

// VERIFY escort
export const verifyEscort = (id) => {
  return api.patch(`/api/admin/escorts/${id}/verify`)
}

// SOFT DELETE escort
export const softDeleteEscort = (id, reason = '') => {
  return api.delete(`/api/admin/escorts/${id}`, { 
    data: reason 
  })
}

// SET profile image
export const setProfileImage = (id, imageUrl) => {
  return api.patch(`/api/admin/escorts/${id}/profile-image`, { imageUrl })
}

// GET escort stats
export const getEscortStats = () => {
  return api.get('/api/admin/escorts/stats')
}

// GET options
export const getBodyTypes = () => api.get('/api/admin/escorts/options/body-types')
export const getHairColors = () => api.get('/api/admin/escorts/options/hair-colors')
export const getEyeColors = () => api.get('/api/admin/escorts/options/eye-colors')
export const getEthnicities = () => api.get('/api/admin/escorts/options/ethnicities')
export const getLanguages = () => api.get('/api/admin/escorts/options/languages')
export const getServices = () => api.get('/api/admin/escorts/options/services')

// ===============================
// IMAGE UPLOAD
// ===============================
export const uploadEscortImage = (escortId, file) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post(
    `/api/admin/images/escort/${escortId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

export default api