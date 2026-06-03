import { create } from 'zustand'

export const useSosStore = create((set, get) => ({
  isSOSActive: false,
  location: null,
  currentJourney: null,
  sosEventId: null,

  activateSOS: (location, eventId) =>
    set({ isSOSActive: true, location, sosEventId: eventId }),

  deactivateSOS: () =>
    set({ isSOSActive: false, sosEventId: null }),

  setCurrentJourney: (journey) => set({ currentJourney: journey }),

  clearJourney: () => set({ currentJourney: null }),
}))
