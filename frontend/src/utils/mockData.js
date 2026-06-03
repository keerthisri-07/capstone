import { subDays, format } from 'date-fns'

// ─── Users ──────────────────────────────────────────────────────────
export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543210',
    role: 'user',
    safetyScore: 87,
    status: 'active',
    avatar: null,
    joinedAt: '2025-01-15T08:00:00Z',
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Ananya Reddy',
    email: 'ananya@example.com',
    phone: '9876543211',
    role: 'user',
    safetyScore: 72,
    status: 'active',
    avatar: null,
    joinedAt: '2025-02-20T10:00:00Z',
    lastSeen: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'u3',
    name: 'Meera Nair',
    email: 'meera@example.com',
    phone: '9876543212',
    role: 'user',
    safetyScore: 95,
    status: 'active',
    avatar: null,
    joinedAt: '2025-03-05T09:00:00Z',
    lastSeen: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'u4',
    name: 'Rahul Gupta',
    email: 'rahul@example.com',
    phone: '9876543213',
    role: 'guardian',
    safetyScore: null,
    status: 'active',
    avatar: null,
    joinedAt: '2025-01-20T11:00:00Z',
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'u5',
    name: 'Admin User',
    email: 'admin@safeher.ai',
    phone: '9876500000',
    role: 'admin',
    safetyScore: null,
    status: 'active',
    avatar: null,
    joinedAt: '2024-12-01T00:00:00Z',
    lastSeen: new Date().toISOString(),
  },
]

export const CURRENT_USER = MOCK_USERS[0]

// ─── Journeys ────────────────────────────────────────────────────────
export const MOCK_JOURNEYS = [
  {
    id: 'j1',
    userId: 'u1',
    source: 'Home, Koramangala',
    destination: 'Office, MG Road',
    travelMode: 'bus',
    status: 'completed',
    startedAt: subDays(new Date(), 0).toISOString(),
    completedAt: new Date().toISOString(),
    duration: 3240,
    distanceKm: 8.5,
    riskLevel: 'low',
    checkpoints: 3,
    safetyScore: 92,
    aiAnalysis: { riskLevel: 'low', recommendations: ['Preferred route appears safe', 'High footfall area'] },
  },
  {
    id: 'j2',
    userId: 'u1',
    source: 'Office, MG Road',
    destination: 'Mall, Indiranagar',
    travelMode: 'auto',
    status: 'active',
    startedAt: new Date().toISOString(),
    completedAt: null,
    duration: null,
    distanceKm: 4.2,
    riskLevel: 'medium',
    checkpoints: 1,
    safetyScore: 74,
    aiAnalysis: null,
  },
  {
    id: 'j3',
    userId: 'u1',
    source: 'Friend\'s place, Jayanagar',
    destination: 'Home, Koramangala',
    travelMode: 'walking',
    status: 'completed',
    startedAt: subDays(new Date(), 1).toISOString(),
    completedAt: subDays(new Date(), 1).toISOString(),
    duration: 1800,
    distanceKm: 2.1,
    riskLevel: 'high',
    checkpoints: 2,
    safetyScore: 58,
    aiAnalysis: {
      riskLevel: 'high',
      recommendations: ['Avoid this route after 9 PM', 'Low lighting observed', 'Consider auto/cab instead'],
    },
  },
  {
    id: 'j4',
    userId: 'u1',
    source: 'College, JP Nagar',
    destination: 'Home, Koramangala',
    travelMode: 'bus',
    status: 'completed',
    startedAt: subDays(new Date(), 2).toISOString(),
    completedAt: subDays(new Date(), 2).toISOString(),
    duration: 2700,
    distanceKm: 6.0,
    riskLevel: 'low',
    checkpoints: 4,
    safetyScore: 88,
    aiAnalysis: null,
  },
  {
    id: 'j5',
    userId: 'u1',
    source: 'Metro Station, Silk Board',
    destination: 'Home, Koramangala',
    travelMode: 'walking',
    status: 'completed',
    startedAt: subDays(new Date(), 3).toISOString(),
    completedAt: subDays(new Date(), 3).toISOString(),
    duration: 900,
    distanceKm: 1.2,
    riskLevel: 'low',
    checkpoints: 1,
    safetyScore: 91,
    aiAnalysis: null,
  },
]

// ─── SOS Events ──────────────────────────────────────────────────────
export const MOCK_SOS_EVENTS = [
  {
    id: 's1',
    userId: 'u1',
    triggeredAt: subDays(new Date(), 5).toISOString(),
    resolvedAt: subDays(new Date(), 5).toISOString(),
    status: 'resolved',
    location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bengaluru' },
    respondedBy: ['Rahul Gupta', 'Emergency Services'],
    responseTime: 28,
    notes: 'Felt unsafe near parking lot. Resolved quickly.',
  },
  {
    id: 's2',
    userId: 'u1',
    triggeredAt: subDays(new Date(), 12).toISOString(),
    resolvedAt: subDays(new Date(), 12).toISOString(),
    status: 'resolved',
    location: { lat: 12.9719, lng: 77.5937, address: 'MG Road, Bengaluru' },
    respondedBy: ['Ananya Reddy'],
    responseTime: 45,
    notes: 'Accidental trigger.',
  },
  {
    id: 's3',
    userId: 'u1',
    triggeredAt: subDays(new Date(), 20).toISOString(),
    resolvedAt: subDays(new Date(), 20).toISOString(),
    status: 'resolved',
    location: { lat: 12.9081, lng: 77.6476, address: 'BTM Layout, Bengaluru' },
    respondedBy: ['Rahul Gupta'],
    responseTime: 62,
    notes: 'Suspicious person following. Safely reached home.',
  },
]

// ─── Incidents ───────────────────────────────────────────────────────
export const MOCK_INCIDENTS = [
  {
    id: 'i1',
    userId: 'u1',
    title: 'Verbal harassment at bus stop',
    description: 'Was verbally harassed by a group of men while waiting for the bus at Silk Board junction around 9 PM.',
    type: 'harassment',
    severity: 'HIGH',
    status: 'under_review',
    location: { address: 'Silk Board, Bengaluru', lat: 12.9177, lng: 77.6226 },
    occurredAt: subDays(new Date(), 2).toISOString(),
    reportedAt: subDays(new Date(), 2).toISOString(),
    aiAnalysis: {
      timeline: ['9:00 PM - Left office', '9:15 PM - Reached bus stop', '9:20 PM - Incident began', '9:35 PM - Bus arrived, left safely'],
      recommendations: ['File complaint at Silk Board police station', 'Download evidence from CCTV (request within 72 hours)', 'Contact Women Helpline 1091'],
      legalOptions: ['IPC Section 354A - Sexual harassment', 'IPC Section 509 - Word/gesture to insult modesty'],
    },
    evidenceFiles: [],
  },
  {
    id: 'i2',
    userId: 'u1',
    title: 'Suspicious person following on route',
    description: 'Noticed a person following me from the metro station to my street. Took a detour and they persisted for about 10 minutes.',
    type: 'stalking',
    severity: 'HIGH',
    status: 'open',
    location: { address: 'Koramangala 4th Block, Bengaluru', lat: 12.9352, lng: 77.6245 },
    occurredAt: subDays(new Date(), 5).toISOString(),
    reportedAt: subDays(new Date(), 5).toISOString(),
    aiAnalysis: null,
    evidenceFiles: [],
  },
  {
    id: 'i3',
    userId: 'u1',
    title: 'Phone snatching attempt',
    description: 'Someone on a bike attempted to snatch my phone near Forum Mall. Managed to hold on and they fled.',
    type: 'theft',
    severity: 'CRITICAL',
    status: 'resolved',
    location: { address: 'Forum Mall, Koramangala, Bengaluru', lat: 12.9356, lng: 77.6101 },
    occurredAt: subDays(new Date(), 10).toISOString(),
    reportedAt: subDays(new Date(), 10).toISOString(),
    aiAnalysis: {
      timeline: ['7:30 PM - Exiting mall', '7:35 PM - Two-wheeler approached from behind', '7:36 PM - Attempted snatch', '7:37 PM - Perpetrators fled'],
      recommendations: ['File FIR at police station', 'Note bike number if possible', 'Report to mall security for CCTV footage'],
      legalOptions: ['IPC Section 379 - Theft', 'IPC Section 392 - Robbery'],
    },
    evidenceFiles: ['cctv_footage.mp4'],
  },
  {
    id: 'i4',
    userId: 'u1',
    title: 'Cyber harassment on social media',
    description: 'Receiving threatening messages from an unknown Instagram account. Multiple messages over 3 days.',
    type: 'cyber_crime',
    severity: 'MEDIUM',
    status: 'under_review',
    location: { address: 'Online', lat: null, lng: null },
    occurredAt: subDays(new Date(), 7).toISOString(),
    reportedAt: subDays(new Date(), 6).toISOString(),
    aiAnalysis: null,
    evidenceFiles: ['screenshot1.png', 'screenshot2.png'],
  },
]

// ─── Guardians ───────────────────────────────────────────────────────
export const MOCK_GUARDIANS = [
  {
    id: 'g1',
    userId: 'u1',
    guardianId: 'u4',
    name: 'Rahul Gupta',
    relation: 'Brother',
    email: 'rahul@example.com',
    phone: '9876543213',
    status: 'active',
    isOnline: true,
    notifications: { sos: true, journey: true, incidents: false },
    addedAt: subDays(new Date(), 60).toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: 'g2',
    userId: 'u1',
    guardianId: null,
    name: 'Sunita Sharma',
    relation: 'Mother',
    email: 'sunita@example.com',
    phone: '9876543214',
    status: 'active',
    isOnline: false,
    notifications: { sos: true, journey: true, incidents: true },
    addedAt: subDays(new Date(), 30).toISOString(),
    lastActive: subDays(new Date(), 3).toISOString(),
  },
  {
    id: 'g3',
    userId: 'u1',
    guardianId: null,
    name: 'Ananya Reddy',
    relation: 'Friend',
    email: 'ananya@example.com',
    phone: '9876543211',
    status: 'active',
    isOnline: true,
    notifications: { sos: true, journey: false, incidents: false },
    addedAt: subDays(new Date(), 45).toISOString(),
    lastActive: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'g4',
    userId: 'u1',
    guardianId: null,
    name: 'Kiran Kumar',
    relation: 'Colleague',
    email: 'kiran@example.com',
    phone: '9876543215',
    status: 'pending',
    isOnline: false,
    notifications: { sos: true, journey: false, incidents: false },
    addedAt: subDays(new Date(), 2).toISOString(),
    lastActive: null,
  },
]

// ─── Analytics Data ──────────────────────────────────────────────────
const generateDailyData = (days) =>
  Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i)
    return {
      date: format(date, 'MMM d'),
      safetyScore: Math.floor(65 + Math.random() * 30),
      journeys: Math.floor(Math.random() * 3),
      incidents: Math.random() > 0.85 ? 1 : 0,
      sosEvents: Math.random() > 0.95 ? 1 : 0,
    }
  })

export const MOCK_ANALYTICS = {
  safetyHistory: generateDailyData(30),
  weeklyJourneys: [
    { day: 'Mon', journeys: 2, safetyScore: 88 },
    { day: 'Tue', journeys: 1, safetyScore: 76 },
    { day: 'Wed', journeys: 3, safetyScore: 91 },
    { day: 'Thu', journeys: 2, safetyScore: 83 },
    { day: 'Fri', journeys: 2, safetyScore: 79 },
    { day: 'Sat', journeys: 1, safetyScore: 87 },
    { day: 'Sun', journeys: 1, safetyScore: 92 },
  ],
  incidentsByType: [
    { name: 'Harassment', value: 3, color: '#7C3AED' },
    { name: 'Stalking', value: 2, color: '#4338CA' },
    { name: 'Theft', value: 1, color: '#EC4899' },
    { name: 'Cyber Crime', value: 2, color: '#3B82F6' },
  ],
  monthlySOS: [
    { month: 'Jan', events: 1 },
    { month: 'Feb', events: 0 },
    { month: 'Mar', events: 2 },
    { month: 'Apr', events: 1 },
    { month: 'May', events: 3 },
    { month: 'Jun', events: 1 },
  ],
  heatmapPoints: [
    { lat: 12.9352, lng: 77.6245, intensity: 0.9, label: 'Koramangala' },
    { lat: 12.9719, lng: 77.5937, intensity: 0.4, label: 'MG Road' },
    { lat: 12.9177, lng: 77.6226, intensity: 0.7, label: 'Silk Board' },
    { lat: 12.9356, lng: 77.6101, intensity: 0.5, label: 'Forum Mall' },
    { lat: 12.9081, lng: 77.6476, intensity: 0.6, label: 'BTM Layout' },
    { lat: 12.9614, lng: 77.5855, intensity: 0.3, label: 'Cubbon Park' },
    { lat: 12.9698, lng: 77.7500, intensity: 0.8, label: 'Whitefield' },
    { lat: 12.9279, lng: 77.6271, intensity: 0.45, label: 'HSR Layout' },
  ],
  aiUsage: {
    totalChats: 47,
    distressAnalyses: 23,
    journeyAnalyses: 18,
    incidentAnalyses: 6,
    tokensUsed: 124500,
  },
}

// ─── Activity Feed ───────────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { id: 'a1', type: 'journey_completed', message: 'Completed journey to MG Road', time: subDays(new Date(), 0).toISOString(), icon: 'MapPin', color: 'text-green-400' },
  { id: 'a2', type: 'incident_created', message: 'Reported incident: Verbal harassment', time: subDays(new Date(), 2).toISOString(), icon: 'FileWarning', color: 'text-orange-400' },
  { id: 'a3', type: 'sos_triggered', message: 'SOS activated in Koramangala', time: subDays(new Date(), 5).toISOString(), icon: 'AlertOctagon', color: 'text-red-400' },
  { id: 'a4', type: 'guardian_added', message: 'Rahul Gupta added as Guardian', time: subDays(new Date(), 10).toISOString(), icon: 'Users', color: 'text-purple-400' },
  { id: 'a5', type: 'journey_started', message: 'Started journey to Forum Mall', time: subDays(new Date(), 12).toISOString(), icon: 'Navigation', color: 'text-blue-400' },
  { id: 'a6', type: 'ai_analysis', message: 'AI analyzed incident report', time: subDays(new Date(), 15).toISOString(), icon: 'Bot', color: 'text-indigo-400' },
]

// ─── AI Recommendations ──────────────────────────────────────────────
export const MOCK_RECOMMENDATIONS = [
  {
    id: 'r1',
    title: 'Avoid Silk Board after 9 PM',
    description: 'Based on your recent incident report, the Silk Board area has elevated risk after 9 PM. Consider using cab services.',
    priority: 'high',
    icon: 'AlertTriangle',
    color: 'text-orange-400',
  },
  {
    id: 'r2',
    title: 'Share journey more frequently',
    description: 'Your guardian response rate improves 40% when journeys are shared. Enable auto-share for evening journeys.',
    priority: 'medium',
    icon: 'Share2',
    color: 'text-blue-400',
  },
  {
    id: 'r3',
    title: 'Update emergency contacts',
    description: 'Your emergency contact list was last updated 60 days ago. Keeping it current ensures faster response.',
    priority: 'low',
    icon: 'Users',
    color: 'text-purple-400',
  },
  {
    id: 'r4',
    title: 'Enable voice activation',
    description: 'Setting up the "Help me SafeHer" voice command allows hands-free SOS activation in emergencies.',
    priority: 'medium',
    icon: 'Mic',
    color: 'text-green-400',
  },
]

// ─── Chat Messages ───────────────────────────────────────────────────
export const MOCK_AI_RESPONSES = {
  'what to do if followed': `If you suspect someone is following you, here's what to do immediately:

1. **Stay calm and aware** — Don't panic. Walk confidently to a public, well-lit area.
2. **Change your route** — Make 3-4 turns. If they still follow, they're likely targeting you.
3. **Enter a safe space** — Go into a shop, restaurant, or police station. Tell staff you need help.
4. **Call for help** — Contact a guardian on this app, call 100 (Police) or 1091 (Women Helpline).
5. **Don't go home directly** — You don't want them to know where you live.
6. **Document evidence** — Try to note description, clothing, or photograph if safe to do so.

**Activate your SOS** button on this app for immediate guardian alerts.`,

  'legal rights in india': `As a woman in India, you have strong legal protections:

**Under IPC:**
- **Section 354** — Assault or criminal force to outrage modesty (up to 5 years)
- **Section 354A** — Sexual harassment (up to 3 years)
- **Section 354D** — Stalking (up to 3 years first offence, 5 years repeat)
- **Section 509** — Word/gesture to insult modesty

**Under Special Laws:**
- **POSH Act 2013** — Workplace sexual harassment
- **IT Act Section 66E** — Cyber stalking/voyeurism
- **Protection of Women from Domestic Violence Act 2005**

**Your Rights:**
- File FIR at any police station — they cannot refuse
- Request woman officer presence during statement
- Zero FIR — file at any station regardless of jurisdiction
- Victim identity protection in media`,

  default: `I'm your SafeHer AI assistant, here to help with safety advice, legal information, and emergency guidance. 

I can help you with:
- 🛡️ **Safety tips** for different situations
- ⚖️ **Legal rights** and complaint procedures  
- 🚨 **Emergency response** guidance
- 💻 **Cyber safety** best practices
- 📞 **Helpline numbers** across India

What would you like to know?`,
}

// ─── Notifications ───────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'sos', message: 'Guardian Rahul responded to your SOS', time: subDays(new Date(), 5).toISOString(), read: false, icon: 'AlertOctagon', color: 'text-red-400' },
  { id: 'n2', type: 'journey', message: 'Your journey to MG Road was completed safely', time: subDays(new Date(), 0).toISOString(), read: false, icon: 'MapPin', color: 'text-green-400' },
  { id: 'n3', type: 'incident', message: 'Incident report status updated to Under Review', time: subDays(new Date(), 2).toISOString(), read: true, icon: 'FileWarning', color: 'text-yellow-400' },
  { id: 'n4', type: 'guardian', message: 'Kiran Kumar accepted guardian invitation', time: subDays(new Date(), 3).toISOString(), read: true, icon: 'Users', color: 'text-purple-400' },
  { id: 'n5', type: 'system', message: 'Your safety score improved to 87', time: subDays(new Date(), 7).toISOString(), read: true, icon: 'TrendingUp', color: 'text-blue-400' },
]

// ─── Admin Data ──────────────────────────────────────────────────────
export const MOCK_ADMIN_STATS = {
  totalUsers: 10847,
  activeToday: 1243,
  activeSOS: 3,
  openIncidents: 28,
  systemHealth: 99.7,
  avgResponseTime: 27,
  tokensUsedToday: 284500,
  resolvedThisWeek: 52,
}
