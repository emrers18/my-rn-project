import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LanguageMode = 'tr' | 'en';
export type CurrencyMode = 'TRY' | 'USD' | 'EUR';
export type TravelStyleMode = 'budget' | 'standard' | 'luxury';

interface PreferencesState {
  language: LanguageMode;
  currency: CurrencyMode;
  travelStyle: TravelStyleMode;
  notificationsEnabled: boolean;
  setLanguage: (language: LanguageMode) => void;
  setCurrency: (currency: CurrencyMode) => void;
  setTravelStyle: (travelStyle: TravelStyleMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'tr',
      currency: 'TRY',
      travelStyle: 'standard',
      notificationsEnabled: true,
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setTravelStyle: (travelStyle) => set({ travelStyle }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
