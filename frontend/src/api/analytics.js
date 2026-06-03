import client from './client'

export const getDashboardAnalytics = async (range = '30d') => {
  const { data } = await client.get('/analytics/dashboard', { params: { range } })
  return data
}

export const getSafetyHistory = async (days = 30) => {
  const { data } = await client.get('/analytics/safety-history', { params: { days } })
  return data
}

export const getJourneyStats = async (range = '7d') => {
  const { data } = await client.get('/analytics/journeys', { params: { range } })
  return data
}

export const getHeatmapData = async () => {
  const { data } = await client.get('/analytics/heatmap')
  return data
}

export const getSOSStats = async (range = '30d') => {
  const { data } = await client.get('/analytics/sos', { params: { range } })
  return data
}

export const exportAnalyticsReport = async (range = '30d') => {
  const response = await client.get('/analytics/export', {
    params: { range },
    responseType: 'blob',
  })
  return response
}
