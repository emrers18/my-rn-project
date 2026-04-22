import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorWidget({ message, onRetry }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Yanıt alınamadı</Text>
      <Text style={styles.message}>{message ?? 'AI yanıtı işlenemedi. Lütfen tekrar dene.'}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
    padding: 14,
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  icon: { fontSize: 28 },
  title: {
    color: '#C53030',
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    color: '#742A2A',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#C53030',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
