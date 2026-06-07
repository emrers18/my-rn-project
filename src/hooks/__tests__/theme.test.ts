import { Colors } from '../../../constants/theme';
import { getThemeColors } from '../../../hooks/use-theme-colors';
import { useThemeStore } from '../../../store/theme-store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Theme System', () => {
  beforeEach(() => {
    useThemeStore.getState().setThemeMode('system');
  });

  it('default theme mode is system', () => {
    expect(useThemeStore.getState().themeMode).toBe('system');
  });

  it('updates theme mode correctly', () => {
    useThemeStore.getState().setThemeMode('dark');
    expect(useThemeStore.getState().themeMode).toBe('dark');
  });

  describe('getThemeColors', () => {
    it('resolves correct colors when mode is light', () => {
      const colors = getThemeColors('light', 'dark');
      expect(colors).toEqual(Colors.light);
    });

    it('resolves correct colors when mode is dark', () => {
      const colors = getThemeColors('dark', 'light');
      expect(colors).toEqual(Colors.dark);
    });

    it('resolves system light colors when mode is system and system is light', () => {
      const colors = getThemeColors('system', 'light');
      expect(colors).toEqual(Colors.light);
    });

    it('resolves system dark colors when mode is system and system is dark', () => {
      const colors = getThemeColors('system', 'dark');
      expect(colors).toEqual(Colors.dark);
    });

    it('resolves light colors as default when system scheme is null', () => {
      const colors = getThemeColors('system', null);
      expect(colors).toEqual(Colors.light);
    });
  });
});
