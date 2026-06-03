import client from './client'

export const createIncident = async (payload) => {
  const { data } = await client.post('/incidents', payload)
  return data
}

export const getIncidents = async (params = {}) => {
  const { data } = await client.get('/incidents', { params })
  return data
}

export const getIncident = async (incidentId) => {
  const { data } = await client.get(`/incidents/${incidentId}`)
  return data
}

export const updateIncident = async (incidentId, payload) => {
  const { data } = await client.patch(`/incidents/${incidentId}`, payload)
  return data
}

export const deleteIncident = async (incidentId) => {
  const { data } = await client.delete(`/incidents/${incidentId}`)
  return data
}

export const exportIncident = async (incidentId, format = 'pdf') => {
  const response = await client.get(`/incidents/${incidentId}/export`, {
    params: { format },
    responseType: 'blob',
  })
  return response
}

export const analyzeIncidentAI = async (incidentId) => {
  const { data } = await client.post(`/incidents/${incidentId}/analyze`)
  return data
}
