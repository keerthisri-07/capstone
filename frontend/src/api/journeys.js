import client from './client'

export const createJourney = async (payload) => {
  const { data } = await client.post('/journeys', payload)
  return data
}

export const getJourneys = async (params = {}) => {
  const { data } = await client.get('/journeys', { params })
  return data
}

export const getJourney = async (journeyId) => {
  const { data } = await client.get(`/journeys/${journeyId}`)
  return data
}

export const updateJourney = async (journeyId, payload) => {
  const { data } = await client.patch(`/journeys/${journeyId}`, payload)
  return data
}

export const addCheckpoint = async (journeyId, payload) => {
  const { data } = await client.post(`/journeys/${journeyId}/checkpoint`, payload)
  return data
}

export const completeJourney = async (journeyId) => {
  const { data } = await client.post(`/journeys/${journeyId}/complete`)
  return data
}

export const reportEmergency = async (journeyId, payload) => {
  const { data } = await client.post(`/journeys/${journeyId}/emergency`, payload)
  return data
}

export const analyzeJourneyRoute = async (payload) => {
  const { data } = await client.post('/journeys/analyze', payload)
  return data
}
