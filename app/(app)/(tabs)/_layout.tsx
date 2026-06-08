import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/constants/theme';
import { TRANSLATIONS } from '@/constants/translations';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { usePreferencesStore } from '@/store/preferences-store';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { language } = usePreferencesStore();
  const t = TRANSLATIONS[language];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceContainer,
          height: 60 + (insets.bottom > 0 ? insets.bottom - 4 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fonts.label,
          fontSize: Typography.sizes.caption,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: t.tabProfile,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
