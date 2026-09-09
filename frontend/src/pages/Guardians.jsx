import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Phone, Shield, Bell, X, Check, Share2,
  ExternalLink, Copy, Radio, Mail, MessageSquare, ShieldCheck
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const initialTrustCircle = [
  { id: 1, name: 'Sunita Sharma', relation: 'Mother', phone: '+91 98765 43210', email: 'sunita@example.com', status: 'Active', online: true, alertTypes: ['SMS', 'Call', 'WhatsApp'] },
  { id: 2, name: 'Rahul Verma', relation: 'Brother', phone: '+91 98765 43211', email: 'rahul@example.com', status: 'Active', online: false, alertTypes: ['SMS', 'Email'] },
  { id: 3, name: 'Ananya Roy', relation: 'Roommate', phone: '+91 98765 43212', email: 'ananya@example.com', status: 'Active', online: true, alertTypes: ['WhatsApp'] },
]

export default function Guardians() {
  const [trustCircle, setTrustCircle] = useState(initialTrustCircle)
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // New member form
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRelation, setNewRelation] = useState('Family')

  const trackingUrl = `${window.location.origin}/track/suraksha-live-session`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl)
    setCopiedLink(true)
    toast.success('Secure tracking link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🛡️ SURAKSHA Trust Circle Tracking Link:\nYou have been added as a trusted guardian. You can track my live journey and emergency alerts here: ${trackingUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleAddMember = (e) => {
    e.preventDefault()
    if (!newName || !newPhone) {
      toast.error('Please enter name and phone number')
      return
    }
    const newMember = {
      id: Date.now(),
      name: newName,
      relation: newRelation,
      phone: newPhone,
      email: newEmail || 'contact@example.com',
      status: 'Active',
      online: true,
      alertTypes: ['SMS', 'Call', 'WhatsApp']
    }
    setTrustCircle(prev => [...prev, newMember])
    setShowAddModal(false)
    setNewName('')
    setNewPhone('')
    setNewEmail('')
    toast.success(`${newName} added to your Trust Circle!`)
  }

  const handleRemoveMember = (id) => {
    setTrustCircle(prev => prev.filter(m => m.id !== id))
    toast('Contact removed from Trust Circle.')
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-violet-400" />
              Trust Circle Module
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Guardian Dashboard & Secure Live Tracking Link for emergency contacts
            </p>
          </motion.div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" /> Add Trust Contact
          </button>
        </div>

        {/* Guardian Dashboard Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-black text-xl">
              {trustCircle.length}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Trust Circle Size</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">Active Guardians</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xl">
              100%
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Alert Reachability</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">SMS, Call & Push</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xl">
              &lt;5s
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Emergency Dispatch</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">Instant Sync</p>
            </div>
          </div>
        </div>

        {/* Secure Tracking Link Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-900/30 via-purple-900/20 to-slate-900/40 border border-violet-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold mb-1">
              <Radio className="w-3 h-3 animate-pulse" /> Secure Tracking Link
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Live Status with Trust Circle</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Share a secure link that allows contacts to track your live journey, coordinates, and safe arrival status in real-time without login.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white text-xs font-bold border border-white/20 flex items-center gap-2 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied' : 'Copy Tracking Link'}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
            >
              <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
            </button>
            <Link
              to="/track/suraksha-live-session"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-violet-600/30"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Preview
            </Link>
          </div>
        </div>

        {/* Contacts Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Trust Circle Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustCircle.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-3xl bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg relative shadow-md shadow-violet-500/20">
                        {g.name[0]}
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#13131F] ${
                          g.online ? 'bg-emerald-400' : 'bg-slate-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-base">{g.name}</h3>
                        <p className="text-violet-500 dark:text-violet-400 text-xs font-semibold">{g.relation}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                      {g.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{g.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{g.email}</span>
                    </div>
                  </div>

                  {/* Notification Channels */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/[0.05] mb-5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Alert Protocols</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.alertTypes.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-[10px] text-slate-700 dark:text-slate-300 font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${g.phone}`}
                    className="flex-1 py-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-xs font-bold text-center border border-violet-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <button
                    onClick={() => handleRemoveMember(g.id)}
                    className="py-2 px-3 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Guardian Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-[#13131f] border border-slate-200 dark:border-white/[0.1] rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-violet-400" /> Add to Trust Circle
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Relationship</label>
                  <select
                    value={newRelation}
                    onChange={e => setNewRelation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#1A1A2E] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25"
                  >
                    Add Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
