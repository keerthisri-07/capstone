import { useState, useEffect, useCallback } from 'react'

const useGeolocation = (options = {}) => {
  const [state, setState] = useState({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: false,
    timestamp: null,
  })

  const [watchId, setWatchId] = useState(null)

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by this browser.', loading: false }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        setState((s) => ({
          ...s,
          error: error.message || 'Unable to retrieve location.',
          loading: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
        ...options,
      }
    )
  }, [])

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return
    if (watchId) return

    setState((s) => ({ ...s, loading: true }))

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        setState((s) => ({
          ...s,
          error: error.message || 'Unable to watch location.',
          loading: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        ...options,
      }
    )

    setWatchId(id)
  }, [watchId])

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    isWatching: watchId !== null,
  }
}

export default useGeolocation
