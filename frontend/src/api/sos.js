import client from './client'

export const triggerSOS = async (payload) => {
  const { data } = await client.post('/sos/trigger', payload)
  return data
}

export const getSOSHistory = async (params = {}) => {
  const { data } = await client.get('/sos/history', { params })
  return data
}

export const resolveSOSEvent = async (eventId, payload = {}) => {
  const { data } = await client.patch(`/sos/${eventId}/resolve`, payload)
  return data
}

export const getActiveSOSEvents = async () => {
  const { data } = await client.get('/sos/active')
  return data
}

export const sendSOSUpdate = async (eventId, message) => {
  const { data } = await client.post(`/sos/${eventId}/update`, { message })
  return data
}
