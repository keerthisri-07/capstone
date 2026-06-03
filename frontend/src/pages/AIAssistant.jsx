import AppLayout from '../components/layout/AppLayout'
import { motion } from 'framer-motion'
import { Send, Mic, Shield, Bot, User, ShieldAlert, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'



const INITIAL_MESSAGES = [
  { id: 1, role: 'ai', text: 'Hello! I am Chitti, your AI Safety Companion. How can I help you today?' },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (text) => {
    if (!text.trim()) return
    const newMsg = { id: Date.now(), role: 'user', text }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsTyping(true)

    // Mock response delay
    setTimeout(() => {
      let aiText = "I'm Chitti. For immediate danger, please use the SOS button. For general advice, ensure you are in a safe public place."
      if (text.toLowerCase().includes('followed')) {
        aiText = "If you think you're being followed:\n1. Change your pace and direction.\n2. Head to a crowded, well-lit area.\n3. Call a friend or family member and tell them your location.\n4. If the person persists, locate the nearest police station or use the SOS button."
      } else if (text.toLowerCase().includes('rights')) {
        aiText = "Key legal rights for women in India:\n1. Right against workplace harassment.\n2. Right to free legal aid.\n3. Right to untimeled FIR registration (Zero FIR).\n4. Right to privacy during statements."
      }
      setMessages(prev => [...prev, { id: Date.now()+1, role: 'ai', text: aiText }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <AppLayout noPadding={true}>
      <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0F0F1A]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-white/[0.06]">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01]">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-violet-400" />
              Chitti
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Ask Chitti about safety tips, legal rights, or emergency procedures.</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-violet-900/50 border border-violet-500/30'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-slate-900 dark:text-white" /> : <Shield className="w-4 h-4 text-violet-400" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-slate-900 dark:text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-200 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-900/50 border border-violet-500/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-violet-400" />
                </div>
                <div className="bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Topic Suggestions */}
          <div className="px-6 pb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Suggested Topics:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "What are my legal rights against harassment?",
                "How to stay safe in a cab?",
                "Emergency helplines in India",
                "Self-defense basics",
                "How to report cyberstalking?"
              ].map(topic => (
                <button
                  key={topic}
                  onClick={() => handleSend(topic)}
                  className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 hover:text-slate-900 dark:text-white transition-colors text-xs text-left"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/[0.06]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask a question or describe a situation..."
                className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] rounded-full pl-4 pr-24 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"><Mic className="w-4 h-4" /></button>
                <button onClick={() => handleSend(input)} disabled={!input.trim()} className="p-2 bg-violet-600 rounded-full text-slate-900 dark:text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Knowledge Base Stats */}
        <div className="w-80 hidden lg:flex flex-col p-6 bg-white dark:bg-white/[0.02]">
          <h2 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Chitti's Memory Bank
          </h2>
          <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex-1 space-y-4">
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                50
              </div>
              <p className="text-slate-900 dark:text-white font-medium text-sm mt-1">Verified Documents</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                Chitti uses Retrieval-Augmented Generation (RAG) to scan 50 verified legal and safety documents before answering.
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08]">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Knowledge Topics</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Legal Rights (India)', count: 10, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { name: 'Emergency Helplines', count: 10, color: 'text-red-400', bg: 'bg-red-500/10' },
                  { name: 'Travel & Transport', count: 10, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { name: 'Cyber Safety', count: 10, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { name: 'Self-Defense Basics', count: 10, color: 'text-purple-400', bg: 'bg-purple-500/10' }
                ].map(topic => (
                  <li key={topic.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${topic.bg} ${topic.color} flex-shrink-0 border border-current`} />
                      {topic.name}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{topic.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
