import { useMemo } from 'react';

import { useThemeColors } from './use-theme-colors';
import { Colors } from '@/constants/theme';

export function useThemedStyles<T>(stylesFactory: (colors: typeof Colors.light) => T): T {
  const colors = useThemeColors();
  return useMemo(() => stylesFactory(colors), [colors, stylesFactory]);
}
