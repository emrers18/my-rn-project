import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
  useFonts as useManrope,
} from '@expo-google-fonts/manrope';
import {
  PlusJakartaSans_700Bold,
  useFonts as useJakarta,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGuard() {
  const { session, isInitialized, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/home');
    }
  }, [session, isInitialized, segments, router]);

  return null;
}

export default function RootLayout() {
  const { themeMode } = useThemeStore();
  const systemScheme = useColorScheme();
  const activeTheme = themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;

  const [jakartaLoaded] = useJakarta({
    PlusJakartaSans_700Bold,
  });

  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (jakartaLoaded && manropeLoaded) {
      SplashScreen.hideAsync();
    }
  }, [jakartaLoaded, manropeLoaded]);

  if (!jakartaLoaded || !manropeLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGuard />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='(app)' />
          </Stack>
          <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
