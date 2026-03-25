import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ChatScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Geri</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Yeni Sohbet</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🗺️</Text>
        <Text style={styles.emptyTitle}>Sohbet Başlat</Text>
        <Text style={styles.emptySubtitle}>
          Seyahat planın hakkında bir şeyler sor. AI asistanın yardımcı olmaya hazır!
        </Text>
      </View>

      {/* TODO: Faz 4'te GenUI & Gemini entegrasyonu burada yapılacak */}
      <View style={styles.inputBar}>
        <Text style={styles.comingSoon}>💬 Sohbet motoru Faz 4&apos;te gelecek</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    alignItems: 'center',
  },
  comingSoon: {
    color: '#475569',
    fontSize: 14,
  },
});
