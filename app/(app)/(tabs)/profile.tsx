import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Roundness, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { uploadAvatar } from '@/lib/storage';
import { useChatHistory } from '@/src/hooks/use-chat-history';
import { useProfile, useUpdateProfile } from '@/src/hooks/use-profile';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { usePreferencesStore } from '@/store/preferences-store';

const TRANSLATIONS = {
  tr: {
    profile: 'Profil',
    chats: 'Sohbet',
    membership: 'Üyelik',
    account: 'Hesap',
    editProfile: 'Profili Düzenle',
    about: 'Hakkında',
    appearance: 'Arayüz / Tema',
    language: 'Dil',
    currency: 'Para Birimi',
    travelStyle: 'Seyahat Tarzı',
    notifications: 'Bildirimler',
    signOut: 'Çıkış Yap',
    signingOut: 'Çıkış yapılıyor…',
    confirmSignOutTitle: 'Çıkış Yap',
    confirmSignOutMessage: 'Çıkış yapmak istediğinden emin misin?',
    cancel: 'İptal',
    save: 'Kaydet',
    successTitle: 'Başarılı ✅',
    profileUpdated: 'Profil bilgilerin güncellendi.',
    avatarUpdated: 'Profil fotoğrafınız güncellendi.',
    permissionRequired: 'İzin Gerekli',
    galleryPermission: 'Galeriye erişmek için izin vermeniz gerekmektedir.',
    errorTitle: 'Hata',
    avatarUploadError: 'Profil fotoğrafı kaydedilemedi.',
    photoUploadError: 'Fotoğraf yüklenirken bir hata oluştu.',
    profileUpdateError: 'Profil güncellenemedi. Lütfen tekrar dene.',
    signOutError: 'Çıkış yapılırken bir sorun oluştu.',
    nameCannotBeEmpty: 'İsim boş bırakılamaz.',
    loadingProfile: 'Profil yükleniyor…',
    profileLoadError: 'Profil yüklenemedi.',
    retry: 'Tekrar Dene →',
    fullNamePlaceholder: 'Adın Soyadın',
    systemTheme: 'Sistem',
    lightTheme: 'Açık',
    darkTheme: 'Koyu',
    budgetStyle: 'Ekonomik',
    standardStyle: 'Standart',
    luxuryStyle: 'Lüks',
    appName: 'TravelBot',
  },
  en: {
    profile: 'Profile',
    chats: 'Chats',
    membership: 'Membership',
    account: 'Account',
    editProfile: 'Edit Profile',
    about: 'About',
    appearance: 'Theme / Mode',
    language: 'Language',
    currency: 'Currency',
    travelStyle: 'Travel Style',
    notifications: 'Notifications',
    signOut: 'Sign Out',
    signingOut: 'Signing out...',
    confirmSignOutTitle: 'Sign Out',
    confirmSignOutMessage: 'Are you sure you want to sign out?',
    cancel: 'Cancel',
    save: 'Save',
    successTitle: 'Success ✅',
    profileUpdated: 'Profile settings updated.',
    avatarUpdated: 'Profile photo updated.',
    permissionRequired: 'Permission Required',
    galleryPermission: 'Permission to access gallery is required.',
    errorTitle: 'Error',
    avatarUploadError: 'Could not save profile photo.',
    photoUploadError: 'An error occurred while uploading photo.',
    profileUpdateError: 'Could not update profile. Please try again.',
    signOutError: 'An error occurred while signing out.',
    nameCannotBeEmpty: 'Name cannot be empty.',
    loadingProfile: 'Loading profile...',
    profileLoadError: 'Could not load profile.',
    retry: 'Retry →',
    fullNamePlaceholder: 'Full Name',
    systemTheme: 'System',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    budgetStyle: 'Budget',
    standardStyle: 'Standard',
    luxuryStyle: 'Luxury',
    appName: 'TravelBot',
  },
};

// ─── Avatar Placeholder ───────────────────────────────────────────────────────

function AvatarPlaceholder({ name, size = 96 }: { name: string; size?: number }) {
  const styles = useThemedStyles(createStyles);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <LinearGradient
      colors={['#003D9B', '#0052CC', '#00B4FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials || '?'}</Text>
    </LinearGradient>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────

function MenuItem({
  icon,
  label,
  onPress,
  isDestructive = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}) {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconBg, isDestructive && styles.menuIconBgDestructive]}>
          <Ionicons name={icon} size={18} color={isDestructive ? colors.error : colors.primary} />
        </View>
        <Text style={[styles.menuLabel, isDestructive && styles.menuLabelDestructive]}>
          {label}
        </Text>
      </View>
      <Ionicons name='chevron-forward' size={18} color={colors.outline} />
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, signOut, isLoading: isSigningOut } = useAuthStore();
  const userId = user?.id ?? null;
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const { themeMode, setThemeMode } = useThemeStore();
  const {
    language,
    currency,
    travelStyle,
    notificationsEnabled,
    setLanguage,
    setCurrency,
    setTravelStyle,
    setNotificationsEnabled,
  } = usePreferencesStore();

  const t = TRANSLATIONS[language];

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfile(userId);
  const { data: chats } = useChatHistory(userId);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handlePickImage = useCallback(async () => {
    if (!userId) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.galleryPermission);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedUri = result.assets[0].uri;
      setIsUploadingImage(true);

      const publicUrl = await uploadAvatar(userId, selectedUri);

      updateProfile(
        { userId, data: { avatarUrl: publicUrl } },
        {
          onSuccess: () => {
            Alert.alert(t.successTitle, t.avatarUpdated);
          },
          onError: (err) => {
            console.error('Profile update error:', err);
            Alert.alert(t.errorTitle, t.avatarUploadError);
          },
        }
      );
    } catch (err) {
      console.error('Image picking/upload error:', err);
      Alert.alert(t.errorTitle, t.photoUploadError);
    } finally {
      setIsUploadingImage(false);
    }
  }, [userId, updateProfile, t]);

  const displayName =
    profile?.fullName ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Gezgin';

  const displayEmail = profile?.email ?? user?.email ?? '';

  const chatCount = chats?.length ?? 0;

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const handleStartEdit = useCallback(() => {
    setEditName(displayName);
    setIsEditing(true);
  }, [displayName]);

  const handleSaveEdit = useCallback(() => {
    if (!userId) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert(t.errorTitle, t.nameCannotBeEmpty);
      return;
    }
    if (trimmed === displayName) {
      setIsEditing(false);
      return;
    }
    updateProfile(
      { userId, data: { fullName: trimmed } },
      {
        onSuccess: () => {
          setIsEditing(false);
          Alert.alert(t.successTitle, t.profileUpdated);
        },
        onError: () => {
          Alert.alert(t.errorTitle, t.profileUpdateError);
        },
      }
    );
  }, [userId, editName, displayName, updateProfile, t]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditName('');
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert(t.confirmSignOutTitle, t.confirmSignOutMessage, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.signOut,
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert(t.errorTitle, t.signOutError);
          }
        },
      },
    ]);
  }, [signOut, t]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.profile}</Text>
      </View>

      {isProfileLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size='large' />
          <Text style={styles.loadingText}>{t.loadingProfile}</Text>
        </View>
      ) : profileError ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😞</Text>
          <Text style={styles.errorText}>{t.profileLoadError}</Text>
          <Pressable onPress={() => refetchProfile()} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.profileCard}>
            <Pressable
              onPress={handlePickImage}
              style={styles.avatarContainer}
              disabled={isUploadingImage}
            >
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <AvatarPlaceholder name={displayName} />
              )}
              <View style={styles.editAvatarOverlay}>
                {isUploadingImage ? (
                  <ActivityIndicator color='#FFFFFF' size='small' />
                ) : (
                  <Ionicons name='camera' size={14} color='#FFFFFF' />
                )}
              </View>
            </Pressable>

            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t.fullNamePlaceholder}
                  placeholderTextColor={colors.icon + '80'}
                  autoFocus
                  maxLength={50}
                />
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editBtn, styles.editBtnCancel]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.editBtnCancelText}>{t.cancel}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.editBtn, styles.editBtnSave]}
                    onPress={handleSaveEdit}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator color='#fff' size='small' />
                    ) : (
                      <Text style={styles.editBtnSaveText}>{t.save}</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.displayName}>{displayName}</Text>
                <Text style={styles.displayEmail}>{displayEmail}</Text>
              </>
            )}
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
            <StatCard icon='💬' value={String(chatCount)} label={t.chats} />
            <StatCard icon='📅' value={memberSince} label={t.membership} />
          </Animated.View>

          {/* Menu */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{t.account}</Text>

            <View style={styles.menuGroup}>
              <MenuItem icon='create-outline' label={t.editProfile} onPress={handleStartEdit} />
              <View style={styles.menuDivider} />
              <MenuItem
                icon='information-circle-outline'
                label={t.about}
                onPress={() => Alert.alert(t.appName)}
              />
            </View>

            <Text style={[styles.menuSectionTitle, { marginTop: Spacing.md }]}>{t.appearance}</Text>
            <View style={styles.menuGroup}>
              {/* Tema Seçici */}
              <View style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                <Text style={styles.menuLabel}>{t.appearance}</Text>
                <View style={styles.themeSelectorContainer}>
                  {(['system', 'light', 'dark'] as const).map((mode) => {
                    const isActive = themeMode === mode;
                    const labels = {
                      system: t.systemTheme,
                      light: t.lightTheme,
                      dark: t.darkTheme,
                    };
                    return (
                      <Pressable
                        key={mode}
                        style={[styles.themeOption, isActive && styles.themeOptionActive]}
                        onPress={() => setThemeMode(mode)}
                      >
                        <Text
                          style={[styles.themeOptionText, isActive && styles.themeOptionTextActive]}
                        >
                          {labels[mode]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.menuDivider} />

              {/* Dil Seçici */}
              <View style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                <Text style={styles.menuLabel}>{t.language}</Text>
                <View style={styles.themeSelectorContainer}>
                  {[
                    { code: 'tr', label: 'TR' },
                    { code: 'en', label: 'EN' },
                  ].map((lang) => {
                    const isActive = language === lang.code;
                    return (
                      <Pressable
                        key={lang.code}
                        style={[styles.themeOption, isActive && styles.themeOptionActive]}
                        onPress={() => setLanguage(lang.code as 'tr' | 'en')}
                      >
                        <Text
                          style={[styles.themeOptionText, isActive && styles.themeOptionTextActive]}
                        >
                          {lang.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.menuDivider} />

              {/* Para Birimi Seçici */}
              <View style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                <Text style={styles.menuLabel}>{t.currency}</Text>
                <View style={styles.themeSelectorContainer}>
                  {(['TRY', 'USD', 'EUR'] as const).map((curr) => {
                    const isActive = currency === curr;
                    return (
                      <Pressable
                        key={curr}
                        style={[styles.themeOption, isActive && styles.themeOptionActive]}
                        onPress={() => setCurrency(curr)}
                      >
                        <Text
                          style={[styles.themeOptionText, isActive && styles.themeOptionTextActive]}
                        >
                          {curr}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.menuDivider} />

              {/* Seyahat Tarzı Seçici */}
              <View style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                <Text style={styles.menuLabel}>{t.travelStyle}</Text>
                <View style={styles.themeSelectorContainer}>
                  {[
                    { code: 'budget', label: t.budgetStyle },
                    { code: 'standard', label: t.standardStyle },
                    { code: 'luxury', label: t.luxuryStyle },
                  ].map((styleOpt) => {
                    const isActive = travelStyle === styleOpt.code;
                    return (
                      <Pressable
                        key={styleOpt.code}
                        style={[styles.themeOption, isActive && styles.themeOptionActive]}
                        onPress={() =>
                          setTravelStyle(styleOpt.code as 'budget' | 'standard' | 'luxury')
                        }
                      >
                        <Text
                          style={[styles.themeOptionText, isActive && styles.themeOptionTextActive]}
                        >
                          {styleOpt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.menuDivider} />

              {/* Bildirim Anahtarı */}
              <View style={styles.switchRow}>
                <Text style={styles.menuLabel}>{t.notifications}</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.surfaceContainer, true: colors.primaryContainer }}
                  thumbColor={notificationsEnabled ? colors.primary : colors.outline}
                  ios_backgroundColor={colors.surfaceContainer}
                />
              </View>
            </View>

            <View style={[styles.menuGroup, { marginTop: Spacing.md }]}>
              <MenuItem
                icon='log-out-outline'
                label={isSigningOut ? t.signingOut : t.signOut}
                onPress={handleSignOut}
                isDestructive
              />
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
            <Text style={styles.footerText}>{t.appName} v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      height: 48,
    },
    headerTitle: {
      fontFamily: Typography.fonts.heading,
      fontSize: Typography.sizes.h2,
      color: colors.text,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.md,
    },
    loadingText: {
      fontFamily: Typography.fonts.body,
      color: colors.icon,
      fontSize: Typography.sizes.label,
    },
    errorEmoji: {
      fontSize: 48,
    },
    errorText: {
      fontFamily: Typography.fonts.body,
      color: colors.error,
      fontSize: Typography.sizes.body,
      textAlign: 'center',
    },
    retryBtn: {
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Roundness.full,
      backgroundColor: colors.surfaceContainer,
    },
    retryText: {
      fontFamily: Typography.fonts.label,
      color: colors.primary,
      fontSize: Typography.sizes.body,
    },
    scrollContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },

    // ── Profile Card ──────────────────────────
    profileCard: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      gap: Spacing.sm,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: Spacing.sm,
    },
    avatarImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    editAvatarOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    avatar: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.sm,
      // Subtle shadow
      shadowColor: '#0052CC',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    avatarText: {
      color: '#FFFFFF',
      fontFamily: Typography.fonts.heading,
      fontWeight: '700',
    },
    displayName: {
      fontFamily: Typography.fonts.heading,
      fontSize: Typography.sizes.h1,
      color: colors.text,
      textAlign: 'center',
    },
    displayEmail: {
      fontFamily: Typography.fonts.body,
      fontSize: Typography.sizes.body,
      color: colors.icon,
      textAlign: 'center',
    },

    // ── Edit Mode ─────────────────────────────
    editContainer: {
      width: '100%',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    editInput: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Roundness.xl,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontFamily: Typography.fonts.body,
      fontSize: Typography.sizes.body,
      color: colors.text,
      textAlign: 'center',
      height: 52,
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    editBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Roundness.full,
      minWidth: 100,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
    },
    editBtnCancel: {
      backgroundColor: colors.surfaceContainer,
    },
    editBtnCancelText: {
      fontFamily: Typography.fonts.label,
      color: colors.icon,
      fontSize: Typography.sizes.body,
    },
    editBtnSave: {
      backgroundColor: colors.primaryContainer,
    },
    editBtnSaveText: {
      fontFamily: Typography.fonts.bodyBold,
      color: '#FFFFFF',
      fontSize: Typography.sizes.body,
    },

    // ── Stats ─────────────────────────────────
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Roundness.lg,
      padding: Spacing.md,
      alignItems: 'center',
      gap: 4,
    },
    statIcon: {
      fontSize: 24,
    },
    statValue: {
      fontFamily: Typography.fonts.heading,
      fontSize: Typography.sizes.h2,
      color: colors.text,
    },
    statLabel: {
      fontFamily: Typography.fonts.body,
      fontSize: Typography.sizes.caption,
      color: colors.icon,
    },

    // ── Menu ──────────────────────────────────
    menuSection: {
      gap: Spacing.sm,
    },
    menuSectionTitle: {
      fontFamily: Typography.fonts.heading,
      fontSize: Typography.sizes.label,
      color: colors.icon,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: Spacing.xs,
    },
    menuGroup: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Roundness.lg,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
    },
    menuItemPressed: {
      backgroundColor: colors.surfaceContainer,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    menuIconBg: {
      width: 36,
      height: 36,
      borderRadius: Roundness.md,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuIconBgDestructive: {
      backgroundColor: colors.error + '12',
    },
    menuLabel: {
      fontFamily: Typography.fonts.label,
      fontSize: Typography.sizes.body,
      color: colors.text,
    },
    menuLabelDestructive: {
      color: colors.error,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.surfaceContainer,
      marginLeft: 68,
    },

    // ── Footer ────────────────────────────────
    footer: {
      alignItems: 'center',
      marginTop: Spacing.xl,
      gap: 4,
    },
    footerText: {
      fontFamily: Typography.fonts.label,
      fontSize: Typography.sizes.caption,
      color: colors.outline,
    },
    footerSubtext: {
      fontFamily: Typography.fonts.body,
      fontSize: Typography.sizes.caption,
      color: colors.outline,
    },

    // ── Theme Selector ────────────────────────
    themeSelectorContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceContainer,
      borderRadius: Roundness.md,
      padding: 4,
      marginTop: Spacing.xs,
    },
    themeOption: {
      flex: 1,
      paddingVertical: Spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Roundness.sm,
    },
    themeOptionActive: {
      backgroundColor: colors.background,
      // Add subtle shadow for premium look
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    themeOptionText: {
      fontFamily: Typography.fonts.label,
      fontSize: Typography.sizes.caption,
      color: colors.icon,
    },
    themeOptionTextActive: {
      color: colors.primary,
      fontFamily: Typography.fonts.bodyBold,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 4,
    },
  });
