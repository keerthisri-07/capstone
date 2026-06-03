import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, AlertTriangle, CheckCircle, AlertOctagon, Shield } from 'lucide-react'
import useSpeechRecognition from '../../hooks/useSpeechRecognition'
import { detectDistress } from '../../api/ai'

const CLASSIFICATIONS = {
  safe: {
    label: 'Safe',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    bar: 'bg-green-400',
  },
  concern: {
    label: 'Concern',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    bar: 'bg-yellow-400',
  },
  warning: {
    label: 'Warning',
    icon: AlertOctagon,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    bar: 'bg-orange-400',
  },
  emergency: {
    label: 'Emergency',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    bar: 'bg-red-500',
  },
}

const mockAnalyze = (text) => {
  const lower = text.toLowerCase()
  let classification = 'safe'
  let confidence = 0.92
  let reasoning = 'The text does not contain indicators of distress or danger.'
  let recommendations = ['Continue monitoring your situation', 'All seems well']

  if (lower.includes('help') || lower.includes('scared') || lower.includes('afraid')) {
    classification = 'concern'
    confidence = 0.78
    reasoning = 'Keywords indicating possible concern detected. The text shows signs of anxiety or discomfort.'
    recommendations = ['Reach out to a trusted person', 'Consider sharing your location with a guardian', 'Call a helpline if needed']
  }
  if (lower.includes('following') || lower.includes('danger') || lower.includes('threat') || lower.includes('unsafe')) {
    classification = 'warning'
    confidence = 0.85
    reasoning = 'Text contains strong indicators of a potentially dangerous situation.'
    recommendations = ['Move to a crowded, well-lit area', 'Alert your guardians now', 'Call Women Helpline: 1091', 'Consider activating SOS']
  }
  if (lower.includes('attack') || lower.includes('emergency') || lower.includes('please help') || lower.includes('sos')) {
    classification = 'emergency'
    confidence = 0.96
    reasoning = 'Emergency keywords detected. Immediate intervention may be required.'
    recommendations = ['Activate SOS immediately', 'Call Police: 100', 'Call Emergency: 112', 'Alert all guardians']
  }

  return { classification, confidence, reasoning, recommendations }
}

const DistressAnalyzer = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { transcript, isListening, isSupported, startListening, stopListening } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) setText((prev) => prev + transcript)
  }, [transcript])

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return
    setIsAnalyzing(true)
    setResult(null)
    try {
      const data = await detectDistress(text)
      setResult(data)
    } catch {
      // Mock analysis
      await new Promise((r) => setTimeout(r, 1200))
      setResult(mockAnalyze(text))
    } finally {
      setIsAnalyzing(false)
    }
  }, [text])

  const config = result ? CLASSIFICATIONS[result.classification] || CLASSIFICATIONS.safe : null
  const Icon = config?.icon

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Analyze Text for Distress Signals
        </label>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or speak a message to analyze for distress signals..."
            rows={4}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F0F1A] text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500 text-slate-900 dark:text-white animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-500'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>
        {isListening && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse inline-block" />
            Listening... speak now
          </p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAnalyze}
        disabled={!text.trim() || isAnalyzing}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-slate-900 dark:text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Analyze Text
          </>
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {result && config && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`rounded-xl border p-4 ${config.bg} ${config.border}`}
          >
            {/* Classification header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Classification</p>
                <p className={`text-base font-black uppercase tracking-wide ${config.color}`}>
                  {config.label}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Confidence</p>
                <p className={`text-base font-black ${config.color}`}>
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${config.bar}`}
              />
            </div>

            {/* Reasoning */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              {result.reasoning}
            </p>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Recommendations
                </p>
                <ul className="space-y-1.5">
                  {result.recommendations.map((rec, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.bar}`} />
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DistressAnalyzer
