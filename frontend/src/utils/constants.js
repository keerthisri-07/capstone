export const API_URL = '/api/v1'

export const ROLES = {
  USER: 'user',
  GUARDIAN: 'guardian',
  ADMIN: 'admin',
}

export const SEVERITY_LEVELS = {
  LOW: { label: 'Low', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  HIGH: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  CRITICAL: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
}

export const INCIDENT_TYPES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'stalking', label: 'Stalking' },
  { value: 'theft', label: 'Theft / Robbery' },
  { value: 'assault', label: 'Physical Assault' },
  { value: 'cyber_crime', label: 'Cyber Crime' },
  { value: 'domestic_violence', label: 'Domestic Violence' },
  { value: 'eve_teasing', label: 'Eve Teasing' },
  { value: 'other', label: 'Other' },
]

export const TRAVEL_MODES = [
  { value: 'walking', label: 'Walking', icon: 'Footprints' },
  { value: 'driving', label: 'Driving', icon: 'Car' },
  { value: 'bus', label: 'Bus / Metro', icon: 'Bus' },
  { value: 'auto', label: 'Auto / Cab', icon: 'Truck' },
]

export const HELPLINES = [
  { name: 'Women Helpline', number: '1091', icon: 'Phone', color: 'text-pink-400' },
  { name: 'Police', number: '100', icon: 'Shield', color: 'text-blue-400' },
  { name: 'Ambulance', number: '102', icon: 'Ambulance', color: 'text-red-400' },
  { name: 'Emergency', number: '112', icon: 'AlertTriangle', color: 'text-orange-400' },
  { name: 'Anti-Stalking', number: '1096', icon: 'Eye', color: 'text-purple-400' },
  { name: 'Cyber Crime', number: '1930', icon: 'Monitor', color: 'text-cyan-400' },
  { name: 'Child Helpline', number: '1098', icon: 'Heart', color: 'text-yellow-400' },
  { name: 'Domestic Violence', number: '181', icon: 'Home', color: 'text-green-400' },
]

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@suraksha.ai', password: 'demo123', role: 'admin' },
  user: { email: 'priya@example.com', password: 'demo123', role: 'user' },
  guardian: { email: 'guardian@example.com', password: 'demo123', role: 'guardian' },
}

export const DISTRESS_CLASSIFICATIONS = {
  safe: { label: 'Safe', color: 'text-green-400', bg: 'bg-green-400/15', border: 'border-green-400/30' },
  concern: { label: 'Concern', color: 'text-yellow-400', bg: 'bg-yellow-400/15', border: 'border-yellow-400/30' },
  warning: { label: 'Warning', color: 'text-orange-400', bg: 'bg-orange-400/15', border: 'border-orange-400/30' },
  emergency: { label: 'Emergency', color: 'text-red-400', bg: 'bg-red-400/15', border: 'border-red-400/30' },
}

export const JOURNEY_STATUS = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EMERGENCY: 'emergency',
}

export const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/journey', label: 'Journey Monitor', icon: 'MapPin' },
  { path: '/sos', label: 'SOS Center', icon: 'AlertOctagon' },
  { path: '/assistant', label: 'AI Assistant', icon: 'Bot' },
  { path: '/incidents', label: 'Incident Reports', icon: 'FileWarning' },
  { path: '/guardians', label: 'Guardians', icon: 'Users' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/profile', label: 'Profile', icon: 'UserCircle' },
]

export const CHART_COLORS = {
  primary: '#7C3AED',
  secondary: '#4338CA',
  accent: '#C4B5FD',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  pink: '#EC4899',
}
