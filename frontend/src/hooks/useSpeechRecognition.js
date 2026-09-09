import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguageStore } from '../store/languageStore'

const useSpeechRecognition = (options = {}) => {
  const { language, getLanguageObj } = useLanguageStore()
  const activeLang = options.lang || getLanguageObj().bcp47 || 'en-IN'
  const keywords = options.keywords || ['help', 'suraksha', 'emergency', 'bachao', 'save me', 'police']
  const onKeywordMatch = options.onKeywordMatch

  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = options.continuous !== undefined ? options.continuous : true
      recognition.interimResults = true
      recognition.lang = activeLang

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += t + ' '
          } else {
            interimTranscript += t
          }
        }
        const currentText = (finalTranscript || interimTranscript).toLowerCase()
        setTranscript((prev) => (finalTranscript ? prev + finalTranscript : prev))

        if (onKeywordMatch && currentText) {
          for (const kw of keywords) {
            if (currentText.includes(kw.toLowerCase())) {
              onKeywordMatch(kw, currentText)
              break
            }
          }
        }
      }

      recognition.onerror = (event) => {
        setError(event.error || 'Speech recognition error')
        if (event.error !== 'no-speech') {
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        // If continuous voice SOS is desired and still flagged, auto-restart
        if (options.autoRestart && isListening) {
          try {
            recognition.start()
          } catch {
            setIsListening(false)
          }
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [activeLang, options.autoRestart, options.continuous])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript('')
    setError(null)
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setError('Could not start speech recognition.')
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch {
      // ignore
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  // Text-to-Speech Helper
  const speak = useCallback((text, langCode) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode || activeLang
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }, [activeLang])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return {
    transcript,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    stopSpeaking,
  }
}

export default useSpeechRecognition
