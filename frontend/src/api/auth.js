import client from './client'

export const login = async (email, password) => {
  const formData = new FormData()
  formData.append('username', email)
  formData.append('password', password)
  const { data } = await client.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export const register = async (payload) => {
  const { data } = await client.post('/auth/register', payload)
  return data
}

export const verifyOTP = async (email, otp) => {
  const { data } = await client.post('/auth/verify-otp', { email, otp })
  return data
}

export const forgotPassword = async (email) => {
  const { data } = await client.post('/auth/forgot-password', { email })
  return data
}

export const resetPassword = async (token, newPassword) => {
  const { data } = await client.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  })
  return data
}

export const refreshTokenApi = async (refreshToken) => {
  const { data } = await client.post('/auth/refresh', { refresh_token: refreshToken })
  return data
}

export const logoutApi = async () => {
  const { data } = await client.post('/auth/logout')
  return data
}

export const getMe = async () => {
  const { data } = await client.get('/auth/me')
  return data
}
