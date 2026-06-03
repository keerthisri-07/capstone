import client from './client'

export const getDashboardData = async () => {
  const { data } = await client.get('/dashboard')
  return data
}

export const getSafetyScore = async () => {
  const { data } = await client.get('/dashboard/safety-score')
  return data
}

export const getNotifications = async () => {
  const { data } = await client.get('/dashboard/notifications')
  return data
}

export const markNotificationRead = async (notificationId) => {
  const { data } = await client.patch(`/dashboard/notifications/${notificationId}/read`)
  return data
}

export const markAllNotificationsRead = async () => {
  const { data } = await client.patch('/dashboard/notifications/read-all')
  return data
}
