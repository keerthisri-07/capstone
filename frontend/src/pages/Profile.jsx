import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Bell, Settings, Shield, Trash2, Camera } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('personal')

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <AppLayout>
      <div>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account preferences</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-64 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-white/[0.03]'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 max-w-2xl">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center gap-6">
                    <div className="relative group cursor-pointer">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name ? user.name.charAt(0) : 'U'}
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-semibold">Profile Picture</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-2">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-sm">
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Full Name</label>
                      <input type="text" defaultValue={user?.name || ''} className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Email</label>
                      <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500 transition-colors" />
                    </div>
                    <button className="px-6 py-2 bg-violet-600 text-white rounded-xl font-medium mt-2 hover:bg-violet-500 transition-colors">Save Changes</button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-4">
                   <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Change Password</h3>
                   <input type="password" placeholder="Current Password" className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500 transition-colors" />
                   <input type="password" placeholder="New Password" className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500 transition-colors" />
                   <button className="px-6 py-2 bg-violet-600 text-white rounded-xl font-medium mt-2 hover:bg-violet-500 transition-colors">Update Password</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
