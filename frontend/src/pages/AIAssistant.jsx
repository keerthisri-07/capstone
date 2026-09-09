import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Mic, MicOff, Shield, Bot, User, Sparkles, Volume2, VolumeX,
  Globe, ChevronDown, Check, Languages
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { chatWithAssistant } from '../api/ai'
import toast from 'react-hot-toast'
import useSpeechRecognition from '../hooks/useSpeechRecognition'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore'

const INITIAL_MESSAGES = {
  en: 'Hello! I am Chitti, your AI Safety Companion for SURAKSHA. How can I help you today?',
  hi: 'नमस्ते! मैं चिट्टी हूँ, सुरक्षा (SURAKSHA) के लिए आपका एआई सुरक्षा साथी। आज मैं आपकी कैसे मदद कर सकता हूँ?',
  ta: 'வணக்கம்! நான் சிட்டி, சுரக்ஷாவின் (SURAKSHA) உங்கள் AI பாதுகாப்பு தோழன். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
  te: 'నమస్కారం! నేను చిట్టి, సురక్ష (SURAKSHA) కోసం మీ AI భద్రతా సహచరుడిని. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?',
  kn: 'ನಮಸ್ಕಾರ! ನಾನು ಚಿಟ್ಟಿ, ಸುರಕ್ಷಾ (SURAKSHA) ಗಾಗಿ ನಿಮ್ಮ ಎಐ ಸುರಕ್ಷತಾ ಒಡನಾಡಿ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
  bn: 'নমস্কার! আমি চিট্টি, সুরক্ষা (SURAKSHA)-র জন্য আপনার এআই সুরক্ষা সঙ্গী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
  mr: 'नमस्कार! मी चिट्टी आहे, सुरक्षा (SURAKSHA) साठी आपला एआय सुरक्षा साथीदार. आज मी तुम्हाला कशी मदत करू शकेन?',
}

const LANG_SWITCH_ANNOUNCEMENTS = {
  en: '🌐 Language switched to English. You can chat or speak in English.',
  hi: '🌐 भाषा बदलकर हिन्दी कर दी गई है। आप हिंदी में बोल या टाइप कर सकते हैं।',
  ta: '🌐 மொழி தமிழுக்கு மாற்றப்பட்டது. நீங்கள் தமிழில் பேசலாம் அல்லது தட்டச்சு செய்யலாம்.',
  te: '🌐 భాష తెలుగుకి మార్చబడింది. మీరు తెలుగులో మాట్లాడవచ్చు లేదా టైప్ చేయవచ్చు.',
  kn: '🌐 ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನೀವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಬಹುದು ಅಥವಾ ಟೈಪ್ ಮಾಡಬಹುದು.',
  bn: '🌐 ভাষা বাংলায় পরিবর্তন করা হয়েছে। আপনি বাংলায় কথা বলতে বা লিখতে পারেন।',
  mr: '🌐 भाषा मराठीत बदलली आहे. आपण मराठीत बोलू किंवा टाईप करू शकता.',
}

const PLACEHOLDERS_BY_LANG = {
  en: 'Ask a question or speak in English...',
  hi: 'सुरक्षा सवाल पूछें या हिन्दी में बोलें...',
  ta: 'பாதுகாப்பு கேள்வி கேட்கவும் அல்லது தமிழில் பேசவும்...',
  te: 'భద్రతా ప్రశ్న అడగండి లేదా తెలుగులో మాట్లాడండి...',
  kn: 'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ...',
  bn: 'নিরাপত্তা প্রশ্ন জিজ্ঞাসা করুন বা বাংলায় বলুন...',
  mr: 'सुरक्षा प्रश्न विचारा किंवा मराठीत बोला...',
}

const TOPICS_BY_LANG = {
  en: [
    "What are my legal rights against harassment?",
    "How to stay safe in a cab?",
    "Emergency helplines in India",
    "Self-defense basics",
    "How to report cyberstalking?"
  ],
  hi: [
    "उत्पीड़न के खिलाफ मेरे कानूनी अधिकार क्या हैं?",
    "कैब में सुरक्षित कैसे रहें?",
    "भारत में आपातकालीन हेल्पलाइन नंबर",
    "आत्मरक्षा की बुनियादी बातें",
    "साइबर स्टॉकिंग की रिपोर्ट कैसे करें?"
  ],
  ta: [
    "துன்புறுத்தலுக்கு எதிரான எனது சட்டப்பூர்வ உரிமைகள் என்ன?",
    "கேப்பில் பாதுகாப்பாக இருப்பது எப்படி?",
    "இந்தியாவில் அவசர உதவி எண்கள்",
    "தற்காப்பு அடிப்படைகள்",
    "சைபர் ஸ்டாக்கிங் புகார் செய்வது எப்படி?"
  ],
  te: [
    "వేధింపులకు వ్యతిరేకంగా నా చట్టపరమైన హక్కులు ఏమిటి?",
    "క్యాబ్‌లో సురక్షితంగా ఎలా ఉండాలి?",
    "భారతదేశంలో అత్యవసర హెల్ప్‌లైన్ నంబర్లు",
    "ఆత్మరక్షణ ప్రాథమిక అంశాలు",
    "సైబర్ స్టాకింగ్‌ను ఎలా నివేదించాలి?"
  ],
  kn: [
    "ಕಿರುಕುಳದ ವಿರುದ್ಧ ನನ್ನ ಕಾನೂನು ಹಕ್ಕುಗಳು ಯಾವುವು?",
    "ಕ್ಯಾಬ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿರುವುದು ಹೇಗೆ?",
    "ಭಾರತದಲ್ಲಿ ತುರ್ತು ಹೆಲ್ಪ್‌ಲೈನ್ ಸಂಖ್ಯೆಗಳು",
    "ಆತ್ಮರಕ್ಷಣೆಯ ಮೂಲಭೂತ ವಿಷಯಗಳು",
    "ಸೈಬರ್ ಸ್ಟಾಕಿಂಗ್ ವರದಿ ಮಾಡುವುದು ಹೇಗೆ?"
  ],
  bn: [
    "হয়রানির বিরুদ্ধে আমার আইনি অধিকার কী?",
    "ক্যাব বা ট্যাক্সিতে নিরাপদ থাকার উপায় কী?",
    "ভারতে জরুরি হেল্পলাইন নম্বরসমূহ",
    "আত্মরক্ষার প্রাথমিক কৌশল",
    "সাইবার স্টকিং কীভাবে রিপোর্ট করবেন?"
  ],
  mr: [
    "छळाविरुद्ध माझे कायदेशीर हक्क काय आहेत?",
    "कॅबमध्ये सुरक्षित कसे राहावे?",
    "भारतातील आपत्कालीन हेल्पलाइन क्रमांक",
    "स्वसंरक्षणाच्या मूलभूत गोष्टी",
    "सायबर स्टॉकिंगची तक्रार कशी करावी?"
  ]
}

export default function AIAssistant() {
  const { language, setLanguage, getLanguageObj } = useLanguageStore()
  const currentLang = getLanguageObj()

  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: INITIAL_MESSAGES[language] || INITIAL_MESSAGES.en }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState(null)
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false)
  const [showInputDropdown, setShowInputDropdown] = useState(false)

  const headerLangRef = useRef(null)
  const inputLangRef = useRef(null)
  const messagesEndRef = useRef(null)

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    speak,
    stopSpeaking
  } = useSpeechRecognition({
    lang: currentLang.bcp47,
  })

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (headerLangRef.current && !headerLangRef.current.contains(e.target)) {
        setShowHeaderDropdown(false)
      }
      if (inputLangRef.current && !inputLangRef.current.contains(e.target)) {
        setShowInputDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Whenever speech recognition transcribes words, put them into input
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  // Update initial message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 1) {
      setMessages([{ id: 1, role: 'ai', text: INITIAL_MESSAGES[language] || INITIAL_MESSAGES.en }])
    }
  }, [language])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Central language switch function
  const handleLanguageChange = (newCode) => {
    if (newCode === language) {
      setShowHeaderDropdown(false)
      setShowInputDropdown(false)
      return
    }

    setLanguage(newCode)
    setShowHeaderDropdown(false)
    setShowInputDropdown(false)

    if (isListening) {
      stopListening()
      resetTranscript()
    }
    stopSpeaking()
    setSpeakingMsgId(null)

    const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === newCode) || SUPPORTED_LANGUAGES[0]
    toast.success(`Language switched to ${targetLang.native} (${targetLang.name})`, {
      icon: '🌐',
      duration: 3000,
    })

    // If chat only has initial welcome, replace with localized welcome; otherwise append system bubble
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 1) {
        return [{ id: 1, role: 'ai', text: INITIAL_MESSAGES[newCode] || INITIAL_MESSAGES.en }]
      }
      return [
        ...prev,
        {
          id: Date.now(),
          role: 'system',
          text: LANG_SWITCH_ANNOUNCEMENTS[newCode] || `Language switched to ${targetLang.name}`
        }
      ]
    })
  }

  const handleSend = async (text) => {
    if (!text || !text.trim()) return
    if (isListening) {
      stopListening()
      resetTranscript()
    }
    const newMsg = { id: Date.now(), role: 'user', text: text.trim() }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsTyping(true)

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.text }))
      const promptWithLang = language !== 'en' 
        ? `${text.trim()} (Please reply in ${currentLang.name} language)` 
        : text.trim()
      const data = await chatWithAssistant(promptWithLang, history, language)
      const aiResponseText = data.message || "I'm Chitti, your SURAKSHA safety companion. Ensure you are in a safe public place."
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: aiResponseText }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error("AI Chat error:", error)
      toast.error("Failed to reach AI Assistant.")
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: "I'm Chitti. For immediate danger, please use the SOS button. For general advice, stay in a well-lit area and share your live tracking link with your Trust Circle." }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleMic = () => {
    if (!isSupported) {
      toast.error("Speech Recognition is not supported in this browser.")
      return
    }
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
      toast.success(`Listening in ${currentLang.native} (${currentLang.name})...`)
    }
  }

  const handleToggleSpeak = (msgId, text) => {
    if (speakingMsgId === msgId) {
      stopSpeaking()
      setSpeakingMsgId(null)
    } else {
      speak(text, currentLang.bcp47)
      setSpeakingMsgId(msgId)
    }
  }

  const suggestedTopics = TOPICS_BY_LANG[language] || TOPICS_BY_LANG.en

  return (
    <AppLayout noPadding={true}>
      <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0F0F1A]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-white/[0.06]">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-400" />
                Chitti — AI Safety Assistant
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Multilingual AI safety guidance with Voice Recognition & Audio Playback
              </p>
            </div>

            {/* Language Selector in Chat Header */}
            <div className="relative" ref={headerLangRef}>
              <button
                onClick={() => setShowHeaderDropdown(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/20 transition-all cursor-pointer"
                title="Change Language"
              >
                <Languages className="w-3.5 h-3.5 text-violet-500" />
                <span>{currentLang.native}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">({currentLang.name})</span>
                <ChevronDown className="w-3 h-3 text-violet-500" />
              </button>

              <AnimatePresence>
                {showHeaderDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-purple-900/30 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 text-slate-800 dark:text-gray-200"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-gray-800">
                      Select Chat Language
                    </div>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                          language === lang.code
                            ? 'bg-violet-600/15 text-violet-600 dark:text-violet-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {language === lang.code && <Check className="w-3.5 h-3.5 text-violet-500 stroke-[2.5]" />}
                          <span>{lang.native}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              if (msg.role === 'system') {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center my-3"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-500/25 shadow-sm">
                      <Globe className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                      <span>{msg.text}</span>
                    </div>
                  </motion.div>
                )
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 shadow-md shadow-indigo-500/30'
                        : 'bg-violet-900/50 border border-violet-500/30'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Shield className="w-4 h-4 text-violet-400" />
                    )}
                  </div>
                  <div className="max-w-[75%] space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                          : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === 'ai' && (
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.text)}
                        className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors px-1 font-medium cursor-pointer"
                        title="Listen to response"
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                            <span className="text-violet-600 dark:text-violet-400 font-semibold">Stop audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen in {currentLang.native}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-900/50 border border-violet-500/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-violet-400" />
                </div>
                <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Speech Listening Banner */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-2 bg-violet-600/10 border-t border-violet-500/20 flex items-center justify-between text-xs text-violet-600 dark:text-violet-300"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-semibold">Speech Recognition Active ({currentLang.native} - {currentLang.name}) — Speak now...</span>
                </div>
                <button
                  onClick={stopListening}
                  className="px-2 py-0.5 rounded bg-violet-500/20 hover:bg-violet-500/30 font-bold cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Topic Suggestions in Selected Language */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Suggested Topics ({currentLang.native}):</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => handleSend(topic)}
                  className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-500 dark:hover:text-white transition-all text-xs text-left shadow-xs cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Language Switcher Bar directly attached to Chat Box */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-[#121224] border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
              <Languages className="w-3.5 h-3.5 text-violet-500" />
              <span>Switch Language:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    language === lang.code
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-2 ring-violet-400/40'
                      : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/[0.1]'
                  }`}
                  title={`Switch to ${lang.name} (${lang.native})`}
                >
                  <span>{lang.native}</span>
                  {language === lang.code && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Box Input Area */}
          <div className="p-4 bg-white dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/[0.06]">
            <div className="relative flex items-center">
              {/* Inside-input language button */}
              <div className="relative" ref={inputLangRef}>
                <button
                  type="button"
                  onClick={() => setShowInputDropdown(v => !v)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-500/15 hover:bg-violet-500/25 text-violet-700 dark:text-violet-300 border border-violet-500/20 transition-all cursor-pointer"
                  title="Change chat language"
                >
                  <Globe className="w-3 h-3 text-violet-500" />
                  <span>{currentLang.native}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Upward-popping dropdown for in-input switcher */}
                <AnimatePresence>
                  {showInputDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute left-2 bottom-full mb-2 w-48 bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-purple-900/30 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 text-slate-800 dark:text-gray-200"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-gray-800">
                        Select Chat Language
                      </div>
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                            language === lang.code
                              ? 'bg-violet-600/15 text-violet-600 dark:text-violet-300 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {language === lang.code && <Check className="w-3.5 h-3.5 text-violet-500 stroke-[2.5]" />}
                            <span className={language === lang.code ? 'font-bold' : ''}>{lang.native}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500">{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text input with left padding for language button */}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder={PLACEHOLDERS_BY_LANG[language] || `Ask a question or speak in ${currentLang.native}...`}
                className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] rounded-full pl-28 pr-24 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500/50 shadow-inner"
              />

              {/* Actions: Mic & Send */}
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                  title={isListening ? 'Stop Speech Recognition' : `Speak in ${currentLang.native} (${currentLang.name})`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="p-2 bg-violet-600 rounded-full text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-violet-600/25 cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Knowledge Base Stats & Multilingual Info */}
        <div className="w-80 hidden lg:flex flex-col p-6 bg-white dark:bg-white/[0.02]">
          <h2 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Chitti's Memory Bank
          </h2>
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex-1 space-y-4">
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                50
              </div>
              <p className="text-slate-900 dark:text-white font-medium text-sm mt-1">Verified Documents</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                RAG-powered safety intelligence scanning legal codes, emergency response manuals, and self-defense guidelines across 7 Indian languages.
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Supported Languages
                </h3>
                <span className="text-[10px] text-violet-400 font-bold">Click to switch</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left cursor-pointer ${
                      language === l.code
                        ? 'bg-violet-600/15 border border-violet-500/30 text-violet-600 dark:text-violet-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {language === l.code && <Check className="w-3 h-3 text-violet-500 stroke-[2.5]" />}
                      <span>{l.native}</span>
                      <span className="text-[10px] text-slate-400">({l.name})</span>
                    </span>
                    <span className="text-[10px] text-emerald-500 font-medium">Voice & Text</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
