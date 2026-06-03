import client from './client'

export const addGuardian = async (payload) => {
  const { data } = await client.post('/guardians', payload)
  return data
}

export const getGuardians = async () => {
  const { data } = await client.get('/guardians')
  return data
}

export const updateGuardian = async (guardianId, payload) => {
  const { data } = await client.patch(`/guardians/${guardianId}`, payload)
  return data
}

export const removeGuardian = async (guardianId) => {
  const { data } = await client.delete(`/guardians/${guardianId}`)
  return data
}

export const resendInvitation = async (guardianId) => {
  const { data } = await client.post(`/guardians/${guardianId}/resend-invite`)
  return data
}

export const acceptGuardianship = async (token) => {
  const { data } = await client.post('/guardians/accept', { token })
  return data
}
