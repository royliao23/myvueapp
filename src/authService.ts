// src/services/authService.ts
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const API_BASE_URL = import.meta.env.VITE_API_NODE
if (!API_BASE_URL) {
  throw new Error('VITE_API_NODE is not defined in .env')
}

const REFRESH_URL = `${API_BASE_URL}/auth/refresh`

interface JwtPayload {
  exp: number
  // Add other JWT payload properties if needed
}

/**
 * Gets a valid access token, refreshing if necessary
 * @returns Promise<string | null> - Valid access token or null if not available
 */
export async function getValidAccessToken(): Promise<string | null> {
  let token = localStorage.getItem('authToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (!token || !refreshToken) return null

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const now = Math.floor(Date.now() / 1000)

    // Refresh token if expired or will expire within 5 minutes
    if (!decoded.exp || decoded.exp < now + 300) {
      const response = await axios.post(REFRESH_URL, {
        refresh_token: refreshToken
      })

      if (response.data.access_token) {
        token = String(response.data.access_token)
        localStorage.setItem('authToken', token)
        
        // Update refresh token if a new one was provided
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token)
        }
      } else {
        console.error('Failed to refresh access token: No token in response')
        return null
      }
    }

    return token
  } catch (error) {
    console.error('Error validating or refreshing token:', error)
    
    // Clear invalid tokens
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    
    return null
  }
}

/**
 * Axios interceptor that automatically refreshes tokens
 */
export function setupAxiosInterceptor() {
  axios.interceptors.request.use(async (config) => {
    const token = await getValidAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }, (error) => {
    return Promise.reject(error)
  })
}

// Helper function to clear auth data
export function clearAuthData() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('username')
  localStorage.removeItem('email')
  localStorage.removeItem('id')
}

// Initialize the interceptor when this module is loaded
setupAxiosInterceptor()