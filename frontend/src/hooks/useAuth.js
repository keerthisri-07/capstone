import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { login as loginApi, logoutApi, googleLogin as googleLoginApi, getMe } from '../api/auth'
import toast from 'react-hot-toast'

const useAuth = () => {
  const { user, token, isAuthenticated, role, login, logout, updateUser } = useAuthStore()

  const handleLogin = useCallback(async (email, password) => {
    try {
      const data = await loginApi(email, password)
      useAuthStore.getState().setToken(data.access_token)
      const userData = await getMe()
      login(userData, data.access_token, data.refresh_token)
      return { success: true, user: userData }
    } catch (error) {
      // Mock login for demo
      const DEMO = {
        'admin@suraksha.ai': { id: 'u5', name: 'Admin User', email: 'admin@suraksha.ai', role: 'admin', safetyScore: null },
        'admin@safeher.ai': { id: 'u5', name: 'Admin User', email: 'admin@suraksha.ai', role: 'admin', safetyScore: null },
        'priya@example.com': { id: 'u1', name: 'Priya Sharma', email: 'priya@example.com', role: 'user', safetyScore: 87 },
        'guardian@example.com': { id: 'u4', name: 'Rahul Gupta', email: 'guardian@example.com', role: 'guardian', safetyScore: null },
      }
      if (DEMO[email] && password === 'demo123') {
        const mockUser = DEMO[email]
        login(mockUser, 'mock_token_' + Date.now(), 'mock_refresh_token')
        return { success: true, user: mockUser }
      }
      throw error
    }
  }, [login])

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {}
    logout()
    toast.success('Logged out successfully')
  }, [logout])

  const handleGoogleLogin = useCallback(async (credential) => {
    try {
      const data = await googleLoginApi(credential)
      useAuthStore.getState().setToken(data.access_token)
      const userData = await getMe()
      login(userData, data.access_token, data.refresh_token)
      return { success: true, user: userData }
    } catch (error) {
      try {
        // Fallback for mock google login
        const base64Url = credential.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        // Handle utf-8 characters properly
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const payload = JSON.parse(jsonPayload)
        
        if (payload.email) {
          const mockUser = {
            id: 'u1',
            name: payload.name || 'Priya Sharma',
            email: payload.email,
            role: 'user',
            safetyScore: 87,
            picture: payload.picture
          }
          login(mockUser, 'mock_token_' + Date.now(), 'mock_refresh_token')
          return { success: true, user: mockUser }
        }
      } catch (e) {
        // Ignore parse error and proceed to throw original error
        console.error('Failed to parse mock token', e)
      }
      toast.error('Google login failed')
      throw error
    }
  }, [login])

  return {
    user,
    token,
    isAuthenticated,
    role,
    isAdmin: role === 'admin',
    login: handleLogin,
    googleLogin: handleGoogleLogin,
    logout: handleLogout,
    updateUser,
  }
}

export default useAuth
