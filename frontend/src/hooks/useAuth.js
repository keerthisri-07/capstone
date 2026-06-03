import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { login as loginApi, logoutApi } from '../api/auth'
import toast from 'react-hot-toast'

const useAuth = () => {
  const { user, token, isAuthenticated, role, login, logout, updateUser } = useAuthStore()

  const handleLogin = useCallback(async (email, password) => {
    try {
      const data = await loginApi(email, password)
      login(data.user, data.access_token, data.refresh_token)
      return { success: true, user: data.user }
    } catch (error) {
      // Mock login for demo
      const DEMO = {
        'admin@safeher.ai': { id: 'u5', name: 'Admin User', email: 'admin@safeher.ai', role: 'admin', safetyScore: null },
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

  return {
    user,
    token,
    isAuthenticated,
    role,
    isAdmin: role === 'admin',
    login: handleLogin,
    logout: handleLogout,
    updateUser,
  }
}

export default useAuth
