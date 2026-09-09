import client from './client'

export const detectDistress = async (text, audioBase64 = null) => {
  const { data } = await client.post('/ai/detect-distress', {
    text,
    audio: audioBase64,
  })
  return data
}

export const analyzeJourney = async (journeyData) => {
  const { data } = await client.post('/ai/analyze-journey', journeyData)
  return data
}

export const getSafetyRecommendations = async (context = {}) => {
  const { data } = await client.post('/ai/recommendations', context)
  return data
}

export const analyzeIncident = async (incidentData) => {
  const { data } = await client.post('/ai/analyze-incident', incidentData)
  return data
}

export const chatWithAssistant = async (message, conversationHistory = [], language = 'en') => {
  const { data } = await client.post('/ai/chat', {
    message,
    conversation_history: conversationHistory,
    language,
  })
  return data
}

export const getAIUsageStats = async () => {
  const { data } = await client.get('/ai/usage-stats')
  return data
}
