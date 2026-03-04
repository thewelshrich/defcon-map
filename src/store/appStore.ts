import { create } from "zustand";

import { defaultEventFilterState, type EventFilterState } from "../domain/filters";

type AppStoreState = {
  selectedCountryCode: string | null;
  hoveredCountryCode: string | null;
  selectedEventId: string | null;
  filters: EventFilterState;
  setSelectedCountryCode: (countryCode: string | null) => void;
  setHoveredCountryCode: (countryCode: string | null) => void;
  setSelectedEventId: (eventId: string | null) => void;
  setFilters: (filters: EventFilterState) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  selectedCountryCode: null,
  hoveredCountryCode: null,
  selectedEventId: null,
  filters: defaultEventFilterState,
  setSelectedCountryCode: (selectedCountryCode) => set({ selectedCountryCode }),
  setHoveredCountryCode: (hoveredCountryCode) => set({ hoveredCountryCode }),
  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
  setFilters: (filters) => set({ filters })
}));
