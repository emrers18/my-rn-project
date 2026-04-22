const tintColorLight = '#0052CC';
const tintColorDark = '#b2c5ff';

export const Colors = {
  light: {
    text: '#181C1E',
    background: '#F7FAFD',
    tint: tintColorLight,
    icon: '#434654',
    tabIconDefault: '#737685',
    tabIconSelected: tintColorLight,
    primary: '#003D9B',
    primaryContainer: '#0052CC',
    secondary: '#3D5CA2',
    surface: '#F7FAFD',
    surfaceContainer: '#EBEEF1',
    surfaceContainerLow: '#F1F4F7',
    outline: '#737685',
    error: '#BA1A1A',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#0040A2', // Düşük kontrast için ayarlanmış koyu primeri
    primaryContainer: '#0052CC',
    secondary: '#B1C5FF',
    surface: '#0F172A',
    surfaceContainer: '#1E293B',
    surfaceContainerLow: '#1E293B',
    outline: '#434654',
    error: '#FFDAD6',
  },
};

export const Typography = {
  fonts: {
    heading: 'PlusJakartaSans_700Bold',
    body: 'Manrope_400Regular',
    bodyBold: 'Manrope_700Bold',
    label: 'Manrope_500Medium',
  },
  sizes: {
    display: 34,
    h1: 26,
    h2: 20,
    body: 15,
    label: 13,
    caption: 12,
  },
};

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Roundness = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
