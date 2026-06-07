import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useThemeStore, ThemeMode } from '@/store/theme-store';

export function getThemeColors(themeMode: ThemeMode, systemScheme: 'light' | 'dark' | null) {
  const activeTheme = themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;
  return Colors[activeTheme];
}

export function useThemeColors() {
  const { themeMode } = useThemeStore();
  const systemScheme = useColorScheme();
  return getThemeColors(themeMode, systemScheme ?? null);
}
