import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, MapPin, Phone, AlertTriangle, Battery, Navigation,
  Clock, Share2, Check, ArrowRight, ShieldCheck, ExternalLink, Radio
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function LiveTracking() {
  const { id } = useParams()
  const [copied, setCopied] = useState(false)
  const [lastPing, setLastPing] = useState('Just now')

  // Sample or dynamic tracking state
  const trackingData = {
    userName: 'Priya Sharma',
    userPhone: '+91 98765 43210',
    battery: 86,
    speed: '18 km/h',
    status: 'In Transit — Monitored',
    from: 'Indiranagar 100ft Road',
    to: 'MG Road Metro Station',
    mode: 'Cab (KA-01-MJ-4921)',
    eta: '12 mins',
    safetyScore: 94,
    coords: [12.9716, 77.5946], // Bangalore center
    destCoords: [12.9756, 77.6066],
    lastUpdated: new Date().toLocaleTimeString(),
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚨 SURAKSHA Live Tracking for ${trackingData.userName}:\nCurrently at ${trackingData.from} heading to ${trackingData.to}.\nLive tracking link: ${window.location.href}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F1A] text-slate-900 dark:text-white flex flex-col">
      {/* Top Banner */}
      <header className="h-16 px-6 bg-slate-900 border-b border-purple-900/30 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-lg gradient-text">SURAKSHA</span>
            <span className="text-[10px] text-gray-400 block -mt-1 font-medium">Secure Trust Circle Live Tracking</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition-all text-gray-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Link'}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 transition-all text-white shadow-lg shadow-emerald-600/20"
          >
            WhatsApp
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column: Tracking Info & Actions */}
        <div className="w-full lg:w-96 p-6 space-y-5 bg-white dark:bg-[#13131F] border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            {/* Live Indicator Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Tracking Active</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{trackingData.userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Battery className="w-4 h-4 text-green-400" />
                <span>{trackingData.battery}%</span>
              </div>
            </div>

            {/* Route Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.05] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Trip Info</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Origin</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{trackingData.from}</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-600 ml-1.5 h-4" />
                <div className="flex items-start gap-3">
                  <MapPin className="w-3.5 h-3.5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Destination</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{trackingData.to}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-white/[0.05] text-xs">
                <div>
                  <span className="text-gray-400">Mode:</span>
                  <p className="font-semibold text-slate-800 dark:text-gray-200">{trackingData.mode}</p>
                </div>
                <div>
                  <span className="text-gray-400">Est. Arrival:</span>
                  <p className="font-semibold text-violet-400">{trackingData.eta}</p>
                </div>
              </div>
            </div>

            {/* Safety Score Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Route Safety Score</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{trackingData.safetyScore}/100</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                Safe Route
              </span>
            </div>
          </div>

          {/* Emergency Actions for Trust Circle */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
            <a
              href={`tel:${trackingData.userPhone}`}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
            >
              <Phone className="w-4 h-4" /> Call {trackingData.userName}
            </a>

            <a
              href="tel:112"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 flex items-center justify-center gap-2 transition-all"
            >
              <AlertTriangle className="w-4 h-4" /> Call Emergency (112)
            </a>

            <p className="text-[11px] text-gray-500 text-center">
              Secured with end-to-end SURAKSHA Trust Circle protocol.
            </p>
          </div>
        </div>

        {/* Right Column: Live Interactive Map */}
        <div className="flex-1 relative h-[500px] lg:h-auto min-h-[400px]">
          <MapContainer
            center={trackingData.coords}
            zoom={14}
            className="w-full h-full z-0"
            style={{ minHeight: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* User current position */}
            <Marker position={trackingData.coords}>
              <Popup>
                <div className="text-xs">
                  <strong>{trackingData.userName}</strong>
                  <br />
                  Current Position: {trackingData.from}
                  <br />
                  Speed: {trackingData.speed}
                </div>
              </Popup>
            </Marker>
            <Circle
              center={trackingData.coords}
              radius={300}
              pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.15 }}
            />

            {/* Destination Marker */}
            <Marker position={trackingData.destCoords}>
              <Popup>
                <div className="text-xs">
                  <strong>Destination</strong>
                  <br />
                  {trackingData.to}
                  <br />
                  ETA: {trackingData.eta}
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Floating Map Status Overlay */}
          <div className="absolute top-4 left-4 z-[400] bg-black/70 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 text-white flex items-center gap-3">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold">Live GPS Signal</span>
              <span className="text-gray-400 block text-[10px]">Updated {trackingData.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
