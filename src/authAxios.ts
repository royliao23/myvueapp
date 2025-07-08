// src/services/authAxios.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getValidAccessToken } from './authService'

const API_BASE_URL = import.meta.env.VITE_API_NODE
if (!API_BASE_URL) {
  throw new Error('VITE_API_NODE is not defined in .env')
}

// Create axios instance with TypeScript typing
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor with async token refresh
import type { InternalAxiosRequestConfig } from 'axios'

instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await getValidAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  } catch (error) {
    console.error('Error setting authorization header:', error)
    return Promise.reject(error)
  }
}, (error) => {
  return Promise.reject(error)
})

// Optional: Response interceptor for handling 401 errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const newToken = await getValidAccessToken()
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return instance(originalRequest)
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError)
        // You might want to redirect to login here
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default instance